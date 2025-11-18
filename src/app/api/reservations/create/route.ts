import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createDiscordThreadForLite } from '@/lib/discord/create-thread-lite';

/**
 * API centralisée pour créer des réservations
 * Gère automatiquement le flux PRO (Stripe) et LITE (paiement externe)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      announcementId,
      coachId,
      startDate,
      endDate,
      packageId, // Optionnel
    } = body;

    // Validation des champs requis
    if (!announcementId || !coachId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'announcementId, coachId, startDate et endDate requis' },
        { status: 400 }
      );
    }

    // Vérifier le feature flag LITE
    const litePlanEnabled = process.env.ENABLE_LITE_PLAN === 'true';

    // Récupérer le coach avec son plan
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: {
        id: true,
        planKey: true,
        firstName: true,
        lastName: true,
        stripeAccountId: true,
        paymentPreferences: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    const planKey = coach.planKey || 'PRO';

    // Vérifier si le plan LITE est activé
    if (planKey === 'LITE' && !litePlanEnabled) {
      return NextResponse.json(
        { error: 'Le plan LITE n\'est pas encore disponible' },
        { status: 403 }
      );
    }

    // Récupérer le plan depuis la DB
    const plan = await prisma.plan.findUnique({
      where: { key: planKey },
      select: {
        key: true,
        name: true,
        requiresStripe: true,
      },
    });

    if (!plan) {
      console.error(`Plan non trouvé pour le coach ${coachId}, planKey: ${planKey}`);
      return NextResponse.json(
        { error: 'Plan du coach invalide' },
        { status: 500 }
      );
    }

    // Récupérer l'annonce pour le prix
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: {
        priceCents: true,
        durationMin: true,
        coachId: true,
        title: true,
      },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    if (announcement.coachId !== coachId) {
      return NextResponse.json(
        { error: 'Coach non valide pour cette annonce' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Vérifier que la session n'a pas lieu dans les 24h suivant l'inscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true, email: true, name: true },
    });

    if (user) {
      const userCreatedAt = new Date(user.createdAt);
      const minBookingDate = new Date(userCreatedAt.getTime() + 24 * 60 * 60 * 1000);

      if (start < minBookingDate) {
        const hoursUntilCanBook = Math.ceil((minBookingDate.getTime() - start.getTime()) / (1000 * 60 * 60));
        return NextResponse.json(
          {
            error: 'Vous ne pouvez pas réserver une session qui a lieu dans les 24h suivant votre inscription',
            minBookingDate: minBookingDate.toISOString(),
            hoursUntilCanBook,
          },
          { status: 403 }
        );
      }
    }

    // Vérifier que le créneau est toujours disponible
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        coachId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          {
            startDate: { lte: start },
            endDate: { gt: start },
          },
          {
            startDate: { lt: end },
            endDate: { gte: end },
          },
          {
            startDate: { gte: start },
            endDate: { lte: end },
          },
        ],
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: 'Ce créneau n\'est plus disponible' },
        { status: 409 }
      );
    }

    // Déterminer le prix et type de réservation
    let sessionNumber = null;
    let coachingPackageId: string | null = null;
    let reservationType: 'SINGLE' | 'PACK' = 'SINGLE';
    let reservationPriceCents = announcement.priceCents;

    if (packageId) {
      reservationType = 'PACK';
      const coachingPackage = await prisma.coachingPackage.findUnique({
        where: { id: packageId },
        include: { sessions: true },
      });

      if (coachingPackage) {
        if (coachingPackage.playerId !== session.user.id) {
          return NextResponse.json(
            { error: 'Ce pack ne vous appartient pas' },
            { status: 403 }
          );
        }

        if (coachingPackage.remainingHours <= 0) {
          return NextResponse.json(
            { error: 'Plus d\'heures disponibles dans ce pack' },
            { status: 400 }
          );
        }

        sessionNumber = coachingPackage.sessions.length + 1;
        coachingPackageId = coachingPackage.id;
        reservationPriceCents = 0;
      } else {
        const announcementPack = await prisma.announcementPack.findUnique({
          where: { id: packageId },
          select: {
            announcementId: true,
            totalPrice: true,
            isActive: true,
          },
        });

        if (!announcementPack || announcementPack.announcementId !== announcementId) {
          return NextResponse.json(
            { error: 'Pack indisponible pour cette annonce' },
            { status: 400 }
          );
        }

        if (announcementPack.isActive === false) {
          return NextResponse.json(
            { error: 'Ce pack n\'est plus disponible' },
            { status: 400 }
          );
        }

        reservationPriceCents = announcementPack.totalPrice;
      }
    }

    // ========================================================================
    // SWITCH SELON LE PLAN : PRO (Stripe) vs LITE (Externe)
    // ========================================================================

    switch (planKey) {
      case 'LITE': {
        // ====================================================================
        // FLUX LITE : Créer réservation + Discord + Retourner confirmation
        // ====================================================================
        console.log(`🎯 [LITE] Création réservation sans Stripe pour coach ${coach.id}`);

        const reservation = await prisma.$transaction(async (tx) => {
          // Créer la réservation avec statut EXTERNAL_PENDING
          const res = await tx.reservation.create({
            data: {
              announcementId,
              coachId,
              playerId: session.user.id,
              packId: packageId || null,
              sessionNumber,
              startDate: start,
              endDate: end,
              status: 'PENDING', // En attente de paiement externe
              paymentStatus: 'EXTERNAL_PENDING',
              type: reservationType,
              priceCents: reservationPriceCents,
            },
          });

          // Si c'est une session d'un pack déjà acheté
          if (coachingPackageId) {
            await tx.packageSession.create({
              data: {
                packageId: coachingPackageId,
                reservationId: res.id,
                startDate: start,
                endDate: end,
                durationMinutes: announcement.durationMin,
                status: 'SCHEDULED',
              },
            });

            const durationHours = announcement.durationMin / 60;
            await tx.coachingPackage.update({
              where: { id: coachingPackageId },
              data: {
                remainingHours: {
                  decrement: durationHours,
                },
              },
            });
          }

          return res;
        });

        // Créer le salon Discord immédiatement
        let discordUrl: string | null = null;
        try {
          const discordResult = await createDiscordThreadForLite({
            reservationId: reservation.id,
            coachName: `${coach.firstName} ${coach.lastName}`,
            playerName: user?.name || 'Joueur',
            sessionTitle: announcement.title,
            startDate: start,
            endDate: end,
            paymentPreferences: coach.paymentPreferences,
          });

          discordUrl = discordResult.url || null;

          // Mettre à jour la réservation avec l'ID du salon
          if (discordResult.channelId) {
            await prisma.reservation.update({
              where: { id: reservation.id },
              data: { discordChannelId: discordResult.channelId },
            });
          }
        } catch (discordError) {
          console.error('❌ Erreur création Discord pour LITE:', discordError);
          // On continue même si Discord échoue
        }

        console.log(`✅ [LITE] Réservation créée: ${reservation.id}, Discord: ${discordUrl || 'N/A'}`);

        return NextResponse.json(
          {
            mode: 'LITE',
            reservationId: reservation.id,
            discordUrl,
            message: 'Réservation créée. Le coach vous contactera pour le paiement.',
          },
          { status: 201 }
        );
      }

      case 'PRO':
      default: {
        // ====================================================================
        // FLUX PRO : Créer réservation + Retourner session Stripe
        // ====================================================================
        console.log(`💳 [PRO] Création réservation avec Stripe pour coach ${coach.id}`);

        // Vérifier que le coach a un compte Stripe Connect valide
        if (!coach.stripeAccountId || coach.stripeAccountId.startsWith('acct_mock_')) {
          return NextResponse.json(
            { error: 'Le coach n\'a pas configuré son compte Stripe' },
            { status: 400 }
          );
        }

        const reservation = await prisma.$transaction(async (tx) => {
          const res = await tx.reservation.create({
            data: {
              announcementId,
              coachId,
              playerId: session.user.id,
              packId: packageId || null,
              sessionNumber,
              startDate: start,
              endDate: end,
              status: 'CONFIRMED',
              paymentStatus: coachingPackageId ? 'PAID' : 'PENDING',
              type: reservationType,
              priceCents: reservationPriceCents,
            },
          });

          if (coachingPackageId) {
            await tx.packageSession.create({
              data: {
                packageId: coachingPackageId,
                reservationId: res.id,
                startDate: start,
                endDate: end,
                durationMinutes: announcement.durationMin,
                status: 'SCHEDULED',
              },
            });

            const durationHours = announcement.durationMin / 60;
            await tx.coachingPackage.update({
              where: { id: coachingPackageId },
              data: {
                remainingHours: {
                  decrement: durationHours,
                },
              },
            });
          }

          return res;
        });

        console.log(`✅ [PRO] Réservation créée: ${reservation.id}`);

        // Retourner les infos pour redirection Stripe
        return NextResponse.json(
          {
            mode: 'PRO',
            reservationId: reservation.id,
            coachId: coach.id,
            coachName: `${coach.firstName} ${coach.lastName}`,
            playerEmail: user?.email || session.user.email,
            price: reservationPriceCents / 100,
            type: reservationType,
          },
          { status: 201 }
        );
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la création de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
