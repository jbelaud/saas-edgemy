import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    console.log('Fetching player dashboard for user:', session.user.id);

    // Récupérer le profil player
    const player = await prisma.player.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!player) {
      console.log('Player profile not found for user:', session.user.id);
      return NextResponse.json(
        { error: 'Profil joueur non trouvé' },
        { status: 404 }
      );
    }

    console.log('Player profile found:', player.id);

    // Récupérer les réservations du user (pas du player)
    const reservations = await prisma.reservation.findMany({
      where: {
        playerId: session.user.id,
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        startDate: true,
        endDate: true,
        coachId: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Calculer les stats
    const confirmedReservations = reservations.filter(
      (r) => r.status === 'CONFIRMED' && r.paymentStatus === 'PAID'
    );

    const completedReservations = reservations.filter(
      (r) => r.status === 'COMPLETED'
    );

    const upcomingSessions = confirmedReservations.filter(
      (r) => r.startDate > now
    );

    // Heures totales coachées (sessions complétées)
    const totalHours = completedReservations.reduce((sum, r) => {
      const duration = (r.endDate.getTime() - r.startDate.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    // Nombre de coachs uniques (avec au moins une session confirmée ou complétée)
    const uniqueCoaches = new Set(
      [...confirmedReservations, ...completedReservations].map((r) => r.coachId)
    );

    const stats = {
      totalHours: Math.round(totalHours * 10) / 10, // Arrondi à 1 décimale
      coachesCount: uniqueCoaches.size,
      upcomingSessionsCount: upcomingSessions.length,
      completedSessionsCount: completedReservations.length,
      totalReservations: reservations.length,
    };

    return NextResponse.json({
      player: {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
      },
      stats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
