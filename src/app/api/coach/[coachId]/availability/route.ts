import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Récupérer les disponibilités publiques d'un coach (accessible sans auth)
// Accepte un paramètre ?duration=60 pour découper en créneaux
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  try {
    const { coachId } = await params;
    const { searchParams } = new URL(request.url);
    const durationParam = searchParams.get('duration');
    const duration = durationParam ? parseInt(durationParam, 10) : null;

    // Vérifier que le coach existe
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer les disponibilités futures
    const availabilities = await prisma.availability.findMany({
      where: {
        coachId,
        start: {
          gte: new Date(),
        },
      },
      orderBy: {
        start: 'asc',
      },
    });

    // Récupérer les réservations confirmées ou en attente pour ce coach
    // Pour les PENDING : uniquement celles de moins de 15 minutes (protection temporaire pendant paiement)
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    const reservations = await prisma.reservation.findMany({
      where: {
        coachId,
        endDate: {
          gte: now,
        },
        OR: [
          // Réservations confirmées (toujours bloquées)
          { status: 'CONFIRMED' },
          // Réservations en attente de moins de 15 minutes (protection temporaire)
          {
            status: 'PENDING',
            createdAt: {
              gte: fifteenMinutesAgo,
            },
          },
        ],
      },
      select: {
        startDate: true,
        endDate: true,
        status: true,
        createdAt: true,
      },
    });

    // Fonction pour vérifier si un créneau chevauche une réservation
    const isSlotBooked = (slotStart: Date, slotEnd: Date): boolean => {
      return reservations.some(reservation => {
        const resStart = new Date(reservation.startDate);
        const resEnd = new Date(reservation.endDate);

        // Vérifier le chevauchement
        return (
          (slotStart >= resStart && slotStart < resEnd) ||
          (slotEnd > resStart && slotEnd <= resEnd) ||
          (slotStart <= resStart && slotEnd >= resEnd)
        );
      });
    };

    // Si duration est fourni, découper les disponibilités en créneaux
    if (duration && duration > 0) {
      const slots = [];

      for (const availability of availabilities) {
        const start = new Date(availability.start);
        const end = new Date(availability.end);
        const durationMs = duration * 60 * 1000; // Convertir minutes en ms

        let currentSlotStart = start;

        // Générer des créneaux de la durée spécifiée
        while (currentSlotStart < end) {
          const currentSlotEnd = new Date(currentSlotStart.getTime() + durationMs);

          // Ne pas dépasser la fin de la disponibilité
          if (currentSlotEnd <= end) {
            const isBooked = isSlotBooked(currentSlotStart, currentSlotEnd);

            slots.push({
              id: `${availability.id}-${currentSlotStart.getTime()}`,
              start: currentSlotStart.toISOString(),
              end: currentSlotEnd.toISOString(),
              isBooked,
            });
          }

          // Passer au créneau suivant
          currentSlotStart = currentSlotEnd;
        }
      }

      return NextResponse.json({ availabilities: slots });
    }

    // Sinon, retourner les disponibilités brutes avec indicateur de réservation
    const availabilitiesWithBooking = availabilities.map(availability => ({
      ...availability,
      isBooked: isSlotBooked(new Date(availability.start), new Date(availability.end)),
    }));

    return NextResponse.json({ availabilities: availabilitiesWithBooking });
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle disponibilité (authentification requise)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { coachId } = await params;

    // Vérifier que l'utilisateur est bien le coach
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    if (coach.userId !== session.user.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = await request.json();
    const { start, end } = body;

    // Validation
    if (!start || !end) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      );
    }

    if (startDate < new Date()) {
      return NextResponse.json(
        { error: 'Impossible de créer une disponibilité dans le passé' },
        { status: 400 }
      );
    }

    // Vérifier les chevauchements
    const overlapping = await prisma.availability.findFirst({
      where: {
        coachId,
        OR: [
          {
            AND: [
              { start: { lte: startDate } },
              { end: { gt: startDate } },
            ],
          },
          {
            AND: [
              { start: { lt: endDate } },
              { end: { gte: endDate } },
            ],
          },
          {
            AND: [
              { start: { gte: startDate } },
              { end: { lte: endDate } },
            ],
          },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: 'Ce créneau chevauche une disponibilité existante' },
        { status: 400 }
      );
    }

    // Créer la disponibilité
    const availability = await prisma.availability.create({
      data: {
        coachId,
        start: startDate,
        end: endDate,
      },
    });

    return NextResponse.json(availability, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la disponibilité:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
