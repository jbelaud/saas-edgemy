import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays, format, parse, setHours, setMinutes, startOfDay, isBefore, isAfter } from 'date-fns';

// GET - Récupérer les créneaux disponibles d'un coach
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ coachId: string }> }
) {
  try {
    const { coachId } = await params;
    const { searchParams } = new URL(request.url);
    const announcementId = searchParams.get('announcementId');

    if (!announcementId) {
      return NextResponse.json(
        { error: 'announcementId requis' },
        { status: 400 }
      );
    }

    // Récupérer l'annonce pour connaître la durée
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { duration: true },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    const sessionDuration = announcement.duration; // en minutes

    // Récupérer les disponibilités récurrentes du coach
    const availabilities = await prisma.availability.findMany({
      where: {
        coachId,
        type: 'RECURRING',
        isBlocked: false,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    if (availabilities.length === 0) {
      return NextResponse.json({ availableSlots: [] });
    }

    // Récupérer les réservations existantes pour les 30 prochains jours
    const today = startOfDay(new Date());
    const endDate = addDays(today, 30);

    const existingReservations = await prisma.reservation.findMany({
      where: {
        coachId,
        startDate: {
          gte: today,
          lte: endDate,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
      },
      select: {
        startDate: true,
        endDate: true,
      },
    });

    // Générer les créneaux disponibles pour les 30 prochains jours
    const availableSlots: { date: string; slots: string[] }[] = [];

    for (let i = 0; i < 30; i++) {
      const currentDate = addDays(today, i);
      const dayOfWeek = currentDate.getDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi

      // Trouver les disponibilités pour ce jour de la semaine
      const dayAvailabilities = availabilities.filter(
        (avail) => avail.dayOfWeek === dayOfWeek
      );

      if (dayAvailabilities.length === 0) continue;

      const slots: string[] = [];

      for (const availability of dayAvailabilities) {
        if (!availability.startTime || !availability.endTime) continue;

        // Parser les heures de début et fin
        const [startHour, startMinute] = availability.startTime.split(':').map(Number);
        const [endHour, endMinute] = availability.endTime.split(':').map(Number);

        let currentSlotTime = setMinutes(setHours(currentDate, startHour), startMinute);
        const endTime = setMinutes(setHours(currentDate, endHour), endMinute);

        // Générer les créneaux toutes les heures (ou selon la durée de la session)
        while (isBefore(currentSlotTime, endTime)) {
          const slotEndTime = addDays(currentSlotTime, 0);
          slotEndTime.setMinutes(slotEndTime.getMinutes() + sessionDuration);

          // Vérifier que le créneau ne dépasse pas la fin de disponibilité
          if (isAfter(slotEndTime, endTime)) break;

          // Vérifier que le créneau n'est pas dans le passé
          if (isBefore(currentSlotTime, new Date())) {
            currentSlotTime = addDays(currentSlotTime, 0);
            currentSlotTime.setMinutes(currentSlotTime.getMinutes() + sessionDuration);
            continue;
          }

          // Vérifier que le créneau ne chevauche pas une réservation existante
          const isSlotAvailable = !existingReservations.some((reservation) => {
            const resStart = new Date(reservation.startDate);
            const resEnd = new Date(reservation.endDate);
            
            // Vérifier le chevauchement
            return (
              (currentSlotTime >= resStart && currentSlotTime < resEnd) ||
              (slotEndTime > resStart && slotEndTime <= resEnd) ||
              (currentSlotTime <= resStart && slotEndTime >= resEnd)
            );
          });

          if (isSlotAvailable) {
            slots.push(format(currentSlotTime, 'HH:mm'));
          }

          // Passer au créneau suivant
          currentSlotTime = addDays(currentSlotTime, 0);
          currentSlotTime.setMinutes(currentSlotTime.getMinutes() + sessionDuration);
        }
      }

      if (slots.length > 0) {
        availableSlots.push({
          date: format(currentDate, 'yyyy-MM-dd'),
          slots: slots.sort(),
        });
      }
    }

    return NextResponse.json({ availableSlots });
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux disponibles:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
