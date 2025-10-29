import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST - Créer une réservation (unitaire ou première session d'un pack)
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
      packageId, // Optionnel : si c'est une session de pack
      stripePaymentId,
    } = body;

    // Validation des champs requis
    if (!announcementId || !coachId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'announcementId, coachId, startDate et endDate requis' },
        { status: 400 }
      );
    }

    // Récupérer l'annonce pour le prix
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { priceCents: true, durationMin: true, coachId: true },
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

    // Vérifier que le créneau est toujours disponible (éviter race conditions)
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

    // Déterminer le numéro de session si c'est un pack
    let sessionNumber = null;
    if (packageId) {
      const coachingPackage = await prisma.coachingPackage.findUnique({
        where: { id: packageId },
        include: { sessions: true },
      });

      if (!coachingPackage) {
        return NextResponse.json(
          { error: 'Pack non trouvé' },
          { status: 404 }
        );
      }

      if (coachingPackage.playerId !== session.user.id) {
        return NextResponse.json(
          { error: 'Ce pack ne vous appartient pas' },
          { status: 403 }
        );
      }

      sessionNumber = coachingPackage.sessions.length + 1;

      // Vérifier qu'il reste des heures
      if (coachingPackage.remainingHours <= 0) {
        return NextResponse.json(
          { error: 'Plus d\'heures disponibles dans ce pack' },
          { status: 400 }
        );
      }
    }

    // Créer la réservation dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer la réservation
      const reservation = await tx.reservation.create({
        data: {
          announcementId,
          coachId,
          playerId: session.user.id,
          packId: packageId || null,
          sessionNumber,
          startDate: start,
          endDate: end,
          status: 'CONFIRMED',
          paymentStatus: stripePaymentId ? 'PAID' : 'PENDING', // Mock pour MVP
          priceCents: packageId ? 0 : announcement.priceCents, // 0 si pack (déjà payé)
          stripePaymentId: stripePaymentId || null,
        },
      });

      // Si c'est une session de pack, créer la PackageSession et déduire les heures
      if (packageId) {
        await tx.packageSession.create({
          data: {
            packageId,
            reservationId: reservation.id,
            startDate: start,
            endDate: end,
            durationMinutes: announcement.durationMin,
            status: 'SCHEDULED',
          },
        });

        // Déduire les heures du pack
        const durationHours = announcement.durationMin / 60;
        await tx.coachingPackage.update({
          where: { id: packageId },
          data: {
            remainingHours: {
              decrement: durationHours,
            },
          },
        });
      }

      return reservation;
    });

    // Créer automatiquement le salon Discord permanent si les deux utilisateurs ont lié leur compte Discord
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: {
        user: {
          select: { discordId: true },
        },
      },
    });

    const player = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { discordId: true },
    });

    if (coach?.user.discordId && player?.discordId) {
      try {
        // Appeler l'API de création/réutilisation du salon Discord permanent
        const discordResponse = await fetch(
          `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/discord/create-channel`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Cookie: request.headers.get('cookie') || '',
            },
            body: JSON.stringify({
              reservationId: result.id,
            }),
          }
        );

        if (!discordResponse.ok) {
          console.error('Erreur lors de la création du salon Discord:', await discordResponse.text());
          // Ne pas faire échouer la réservation si Discord échoue
        } else {
          console.log('Salon Discord créé avec succès pour la réservation', result.id);
        }
      } catch (discordError) {
        console.error('Erreur lors de l\'appel à l\'API Discord:', discordError);
        // Ne pas faire échouer la réservation si Discord échoue
      }
    } else {
      console.log('Salon Discord non créé: un ou plusieurs utilisateurs n\'ont pas lié leur compte Discord');
    }

    return NextResponse.json({ reservation: result }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer les réservations de l'utilisateur
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un coach ou un joueur
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    let reservations;
    if (coach) {
      // Récupérer les réservations du coach
      reservations = await prisma.reservation.findMany({
        where: { coachId: coach.id },
        include: {
          player: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          announcement: {
            select: {
              title: true,
              durationMin: true,
            },
          },
          pack: {
            select: {
              hours: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      });
    } else {
      // Récupérer les réservations du joueur
      reservations = await prisma.reservation.findMany({
        where: { playerId: session.user.id },
        include: {
          coach: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          announcement: {
            select: {
              title: true,
              durationMin: true,
            },
          },
          pack: {
            select: {
              hours: true,
            },
          },
        },
        orderBy: { startDate: 'desc' },
      });
    }

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
