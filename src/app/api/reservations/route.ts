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

    // Vérifier que la session n'a pas lieu dans les 24h suivant l'inscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { createdAt: true },
    });

    if (user) {
      const userCreatedAt = new Date(user.createdAt);
      
      // Calculer la date minimum pour réserver (inscription + 24h)
      const minBookingDate = new Date(userCreatedAt.getTime() + 24 * 60 * 60 * 1000);
      
      // Vérifier que la session commence au moins 24h après l'inscription
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

    // Déterminer le numéro de session si c'est un pack DÉJÀ ACHETÉ (CoachingPackage)
    let sessionNumber = null;
    let coachingPackageId: string | null = null;
    let reservationType: 'SINGLE' | 'PACK' = 'SINGLE';
    let reservationPriceCents = announcement.priceCents;

    if (packageId) {
      reservationType = 'PACK';
      // Vérifier si c'est un CoachingPackage (pack déjà acheté) ou un AnnouncementPack (achat en cours)
      const coachingPackage = await prisma.coachingPackage.findUnique({
        where: { id: packageId },
        include: { sessions: true },
      });

      if (coachingPackage) {
        // C'est un pack déjà acheté
        if (coachingPackage.playerId !== session.user.id) {
          return NextResponse.json(
            { error: 'Ce pack ne vous appartient pas' },
            { status: 403 }
          );
        }

        // Vérifier qu'il reste des heures
        if (coachingPackage.remainingHours <= 0) {
          return NextResponse.json(
            { error: 'Plus d\'heures disponibles dans ce pack' },
            { status: 400 }
          );
        }

        sessionNumber = coachingPackage.sessions.length + 1;
        coachingPackageId = coachingPackage.id;
        reservationPriceCents = 0; // Paiement déjà effectué lors de l'achat du pack
      } else {
        // Pack à acheter : récupérer l'AnnouncementPack pour connaître le prix
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
          paymentStatus: stripePaymentId ? 'PAID' : coachingPackageId ? 'PAID' : 'PENDING',
          type: reservationType,
          priceCents: reservationPriceCents,
          stripePaymentId: stripePaymentId || null,
        },
      });

      // Si c'est une session d'un pack DÉJÀ ACHETÉ, créer la PackageSession et déduire les heures
      if (coachingPackageId) {
        await tx.packageSession.create({
          data: {
            packageId: coachingPackageId,
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
          where: { id: coachingPackageId },
          data: {
            remainingHours: {
              decrement: durationHours,
            },
          },
        });
      }

      return reservation;
    });

    // Récupérer la réservation complète
    const updatedReservation = await prisma.reservation.findUnique({
      where: { id: result.id },
      include: {
        coach: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        announcement: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!updatedReservation) {
      return NextResponse.json(
        { error: 'Réservation introuvable après création' },
        { status: 500 }
      );
    }

    // Retourner l'ID et les détails de la réservation
    return NextResponse.json({
      id: updatedReservation.id, // Pour le front qui attend data.id
      reservation: updatedReservation, // Pour compatibilité
    }, { status: 201 });
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
