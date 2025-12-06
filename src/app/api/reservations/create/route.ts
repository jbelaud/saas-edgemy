import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createDiscordThreadForLite } from '@/lib/discord/create-thread-lite';
import { calculateForSession, calculateForPack } from '@/lib/stripe/pricing';

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
    // Pour les PENDING : uniquement celles de moins de 15 minutes (protection temporaire)
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const existingReservation = await prisma.reservation.findFirst({
      where: {
        coachId,
        OR: [
          // Réservations confirmées
          { status: 'CONFIRMED' },
          // Réservations en attente de moins de 15 minutes
          {
            status: 'PENDING',
            createdAt: { gte: fifteenMinutesAgo },
          },
        ],
        AND: [
          {
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
            id: true,
            announcementId: true,
            totalPrice: true,
            hours: true,
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
        // Calculer le nombre de sessions à partir des heures et de la durée de l'annonce
        const sessionsCount = Math.floor((announcementPack.hours * 60) / announcement.durationMin);
        // Stocker les infos du pack pour création du CoachingPackage (LITE)
        (body as { _announcementPack?: { id: string; hours: number; sessionsCount: number } })._announcementPack = {
          id: announcementPack.id,
          hours: announcementPack.hours,
          sessionsCount,
        };
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

        // Récupérer les infos du nouveau pack si c'est un achat de pack
        const newPackInfo = (body as { _announcementPack?: { id: string; hours: number; sessionsCount: number } })._announcementPack;

        const reservation = await prisma.$transaction(async (tx) => {
          // Créer la réservation directement CONFIRMED pour LITE
          // Le paiement est géré directement entre le coach et le joueur
          const res = await tx.reservation.create({
            data: {
              announcementId,
              coachId,
              playerId: session.user.id,
              packId: packageId || null,
              sessionNumber: sessionNumber || (newPackInfo ? 1 : null),
              startDate: start,
              endDate: end,
              status: 'CONFIRMED', // Confirmé immédiatement pour LITE
              paymentStatus: 'EXTERNAL_PAID', // Paiement externe (géré par le coach)
              type: reservationType,
              priceCents: reservationPriceCents,
              // Pour LITE, le coach reçoit 100% du montant (pas de frais Edgemy)
              coachNetCents: reservationPriceCents,
              stripeFeeCents: 0,
              edgemyFeeCents: 0,
              serviceFeeCents: 0,
              commissionCents: 0,
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

          // Si c'est un NOUVEAU pack (achat initial) - créer le CoachingPackage
          if (newPackInfo && reservationType === 'PACK') {
            const durationHours = announcement.durationMin / 60;
            const totalHours = newPackInfo.hours;

            // Créer le CoachingPackage
            const newCoachingPackage = await tx.coachingPackage.create({
              data: {
                playerId: session.user.id,
                coachId,
                announcementId,
                totalHours,
                remainingHours: totalHours - durationHours, // Déduire la première session
                priceCents: reservationPriceCents,
                status: 'ACTIVE',
                // Pour LITE, pas de frais
                commissionCents: 0,
                coachEarningsCents: reservationPriceCents,
                stripeFeeCents: 0,
                edgemyFeeCents: 0,
                serviceFeeCents: 0,
                coachNetCents: reservationPriceCents,
                sessionPayoutCents: Math.round(reservationPriceCents / newPackInfo.sessionsCount),
                sessionsCompletedCount: 0,
                sessionsTotalCount: newPackInfo.sessionsCount,
              },
            });

            // Créer la première PackageSession
            await tx.packageSession.create({
              data: {
                packageId: newCoachingPackage.id,
                reservationId: res.id,
                startDate: start,
                endDate: end,
                durationMinutes: announcement.durationMin,
                status: 'SCHEDULED',
              },
            });

            console.log(`✅ [LITE] CoachingPackage créé: ${newCoachingPackage.id} avec ${totalHours}h, ${totalHours - durationHours}h restantes`);
          }

          return res;
        });

        // Créer le salon Discord immédiatement
        let discordUrl: string | null = null;
        try {
          const discordResult = await createDiscordThreadForLite({
            reservationId: reservation.id,
            coachId: coach.id,
            playerId: session.user.id,
            coachName: `${coach.firstName} ${coach.lastName}`,
            playerName: user?.name || 'Joueur',
            sessionTitle: announcement.title,
            startDate: start,
            endDate: end,
            paymentPreferences: coach.paymentPreferences,
            priceCents: reservationPriceCents,
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

        // Vérifier si c'est une annonce gratuite (0€)
        const isFreeAnnouncement = reservationPriceCents === 0;

        if (isFreeAnnouncement) {
          console.log(`🎁 [FREE] Annonce gratuite détectée - Création réservation sans paiement`);

          // Créer directement la réservation comme CONFIRMED et PAID
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
                status: 'CONFIRMED', // Confirmé immédiatement
                paymentStatus: 'PAID', // Marqué comme "payé" (gratuit)
                type: reservationType,
                priceCents: 0,
                coachNetCents: 0,
                stripeFeeCents: 0,
                edgemyFeeCents: 0,
                serviceFeeCents: 0,
                commissionCents: 0,
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

          console.log(`✅ [FREE] Réservation gratuite créée: ${reservation.id}`);

          return NextResponse.json(
            {
              mode: 'FREE',
              reservationId: reservation.id,
              message: 'Réservation gratuite confirmée',
            },
            { status: 201 }
          );
        }

        // Vérifier que le coach a un compte Stripe Connect valide pour les annonces payantes
        if (!coach.stripeAccountId || coach.stripeAccountId.startsWith('acct_mock_')) {
          return NextResponse.json(
            { error: 'Le coach n\'a pas configuré son compte Stripe' },
            { status: 400 }
          );
        }

        // Calculer le pricing dès maintenant pour stocker le bon montant
        let pricingBreakdown;
        if (reservationType === 'PACK' && packageId) {
          const announcementPack = await prisma.announcementPack.findUnique({
            where: { id: packageId },
            select: { hours: true },
          });

          if (announcementPack && announcementPack.hours > 0) {
            pricingBreakdown = calculateForPack(reservationPriceCents, announcementPack.hours);
          } else {
            pricingBreakdown = calculateForSession(reservationPriceCents);
          }
        } else {
          pricingBreakdown = calculateForSession(reservationPriceCents);
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
              // PENDING jusqu'à validation du paiement Stripe (webhook)
              status: coachingPackageId ? 'CONFIRMED' : 'PENDING',
              paymentStatus: coachingPackageId ? 'PAID' : 'PENDING',
              type: reservationType,
              priceCents: reservationPriceCents,
              // Stocker le breakdown pricing dès la création
              coachNetCents: pricingBreakdown.coachNetCents,
              stripeFeeCents: pricingBreakdown.stripeFeeCents,
              edgemyFeeCents: pricingBreakdown.edgemyFeeCents,
              serviceFeeCents: pricingBreakdown.serviceFeeCents,
              commissionCents: pricingBreakdown.edgemyFeeCents,
              sessionsCount: 'sessionsCount' in pricingBreakdown ? pricingBreakdown.sessionsCount : null,
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
