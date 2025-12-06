import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * GET /api/reservations/summary?reservation_id=xxx
 * Récupère le résumé d'une réservation pour la page de succès LITE
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservation_id');

    if (!reservationId) {
      return NextResponse.json(
        { error: 'reservation_id requis' },
        { status: 400 }
      );
    }

    // Récupérer la réservation avec les détails
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
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
            durationMin: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est bien le joueur de cette réservation
    if (reservation.playerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      reservationId: reservation.id,
      priceCents: reservation.priceCents,
      coachFirstName: reservation.coach.firstName,
      coachLastName: reservation.coach.lastName,
      announcementTitle: reservation.announcement.title,
      durationMinutes: reservation.announcement.durationMin,
      startDate: reservation.startDate.toISOString(),
      endDate: reservation.endDate.toISOString(),
      discordChannelId: reservation.discordChannelId,
    });
  } catch (error) {
    console.error('Erreur récupération résumé réservation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
