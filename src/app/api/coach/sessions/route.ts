import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Récupérer toutes les sessions du coach
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer toutes les réservations du coach (futures et passées)
    const reservations = await prisma.reservation.findMany({
      where: {
        coachId: coach.id,
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
      },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
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
      orderBy: {
        startDate: 'asc',
      },
    });

    // Formater pour le calendrier
    const formattedSessions = reservations.map(r => ({
      id: r.id,
      startDate: r.startDate,
      endDate: r.endDate,
      package: {
        player: {
          name: r.player.name,
          email: r.player.email,
        },
      },
    }));

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
