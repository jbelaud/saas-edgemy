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

    // Récupérer toutes les sessions de pack planifiées par le coach
    const packageSessions = await prisma.packageSession.findMany({
      where: {
        package: {
          coachId: coach.id,
        },
        status: {
          in: ['SCHEDULED', 'COMPLETED'],
        },
        // Exclure celles qui ont déjà une réservation (pour éviter les doublons)
        reservationId: null,
      },
      include: {
        package: {
          include: {
            player: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    // Formater les réservations pour le calendrier
    const formattedReservations = reservations.map(r => ({
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

    // Formater les sessions de pack pour le calendrier
    const formattedPackageSessions = packageSessions.map(s => ({
      id: s.id,
      startDate: s.startDate,
      endDate: s.endDate,
      package: {
        player: {
          name: s.package.player.name,
          email: s.package.player.email,
        },
      },
    }));

    // Combiner les deux types de sessions
    const allSessions = [...formattedReservations, ...formattedPackageSessions];

    // Trier par date de début
    allSessions.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return NextResponse.json(allSessions);
  } catch (error) {
    console.error('Erreur lors de la récupération des sessions:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
