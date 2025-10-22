import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  try {
    const { coachId } = await params;
    const { searchParams } = new URL(request.url);
    
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const announcementId = searchParams.get('announcementId');

    if (!startDate || !endDate || !announcementId) {
      return NextResponse.json(
        { error: 'startDate, endDate et announcementId requis' },
        { status: 400 }
      );
    }

    // 1. Récupérer l'annonce pour connaître la durée
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { durationMin: true, coachId: true },
    });

    if (!announcement || announcement.coachId !== coachId) {
      return NextResponse.json({ error: 'Annonce non trouvée' }, { status: 404 });
    }

    const durationMin = announcement.durationMin;
    const start = new Date(startDate);
    const end = new Date(endDate);

    // 2. Récupérer les disponibilités
    const [recurringAvailabilities, specificAvailabilities, exceptions] = await Promise.all([
      // Disponibilités récurrentes
      prisma.availability.findMany({
        where: { coachId, type: 'RECURRING', isBlocked: false },
      }),
      // Disponibilités spécifiques dans la période
      prisma.availability.findMany({
        where: {
          coachId,
          type: 'SPECIFIC',
          isBlocked: false,
          specificDate: { gte: start, lte: end },
        },
      }),
      // Exceptions/blocages dans la période
      prisma.availability.findMany({
        where: {
          coachId,
          type: 'EXCEPTION',
          isBlocked: true,
          specificDate: { gte: start, lte: end },
        },
      }),
    ]);

    // 3. Récupérer les réservations existantes
    const reservations = await prisma.reservation.findMany({
      where: {
        coachId,
        startDate: { gte: start },
        endDate: { lte: end },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
      select: { startDate: true, endDate: true },
    });

    // 4. Générer les créneaux disponibles
    const slots = generateSlots(
      start,
      end,
      durationMin,
      recurringAvailabilities,
      specificAvailabilities,
      exceptions,
      reservations
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('Erreur calcul créneaux:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Fonction de génération des créneaux
interface Availability {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  specificDate?: Date;
  isBlocked?: boolean;
}

interface Reservation {
  startDate: Date;
  endDate: Date;
}

function generateSlots(
  startDate: Date,
  endDate: Date,
  durationMin: number,
  recurringAvailabilities: Availability[],
  specificAvailabilities: Availability[],
  exceptions: Availability[],
  reservations: Reservation[]
) {
  const slots: { start: string; end: string }[] = [];
  const currentDate = new Date(startDate);
  const SLOT_INTERVAL_MIN = 30; // Créneaux tous les 30 minutes

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay();
    const dateString = currentDate.toISOString().split('T')[0];

    // Vérifier si le jour est bloqué
    const isBlocked = exceptions.some(
      (exc) => exc.specificDate?.toISOString().split('T')[0] === dateString
    );

    if (!isBlocked) {
      // Récupérer les disponibilités pour ce jour
      const dayAvailabilities = [
        ...recurringAvailabilities.filter((a) => a.dayOfWeek === dayOfWeek),
        ...specificAvailabilities.filter(
          (a) => a.specificDate?.toISOString().split('T')[0] === dateString
        ),
      ];

      // Générer les créneaux pour chaque disponibilité
      for (const avail of dayAvailabilities) {
        if (!avail.startTime || !avail.endTime) continue;

        const [startHour, startMin] = avail.startTime.split(':').map(Number);
        const [endHour, endMin] = avail.endTime.split(':').map(Number);

        const slotStart = new Date(currentDate);
        slotStart.setHours(startHour, startMin, 0, 0);

        const availEnd = new Date(currentDate);
        availEnd.setHours(endHour, endMin, 0, 0);

        // Générer créneaux tous les SLOT_INTERVAL_MIN minutes
        while (slotStart < availEnd) {
          const slotEnd = new Date(slotStart);
          slotEnd.setMinutes(slotEnd.getMinutes() + durationMin);

          // Vérifier que le créneau ne dépasse pas la disponibilité
          if (slotEnd <= availEnd) {
            // Vérifier que le créneau ne chevauche pas une réservation
            const isReserved = reservations.some((res) => {
              const resStart = new Date(res.startDate);
              const resEnd = new Date(res.endDate);
              return (
                (slotStart >= resStart && slotStart < resEnd) ||
                (slotEnd > resStart && slotEnd <= resEnd) ||
                (slotStart <= resStart && slotEnd >= resEnd)
              );
            });

            if (!isReserved) {
              slots.push({
                start: slotStart.toISOString(),
                end: slotEnd.toISOString(),
              });
            }
          }

          // Avancer de SLOT_INTERVAL_MIN minutes
          slotStart.setMinutes(slotStart.getMinutes() + SLOT_INTERVAL_MIN);
        }
      }
    }

    // Passer au jour suivant
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
}
