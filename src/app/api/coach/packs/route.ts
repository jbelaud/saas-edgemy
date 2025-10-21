import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/coach/packs - Récupérer tous les packs achetés avec leurs sessions
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer tous les packs avec au moins une réservation
    const packs = await prisma.announcementPack.findMany({
      where: {
        announcement: {
          coachId: coach.id,
        },
        reservations: {
          some: {}, // Au moins une réservation
        },
      },
      include: {
        announcement: {
          select: {
            id: true,
            title: true,
            type: true,
            durationMin: true,
          },
        },
        reservations: {
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
          orderBy: {
            sessionNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Grouper les réservations par joueur
    const packsWithPlayers = packs.map((pack) => {
      // Grouper par playerId
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const playerGroups = pack.reservations.reduce((acc: any, reservation: any) => {
        const playerId = reservation.playerId;
        if (!acc[playerId]) {
          acc[playerId] = {
            player: reservation.player,
            sessions: [],
          };
        }
        acc[playerId].sessions.push(reservation);
        return acc;
      }, {});

      return {
        id: pack.id,
        hours: pack.hours,
        totalPrice: pack.totalPrice,
        discountPercent: pack.discountPercent,
        announcement: pack.announcement,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        playerPacks: Object.values(playerGroups).map((group: any) => ({
          player: group.player,
          sessions: group.sessions,
          totalSessions: pack.hours,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          completedSessions: group.sessions.filter((s: any) => s.status === 'COMPLETED').length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          scheduledSessions: group.sessions.filter((s: any) => s.status === 'CONFIRMED').length,
          remainingSessions: pack.hours - group.sessions.length,
        })),
      };
    });

    return NextResponse.json({ packs: packsWithPlayers });
  } catch (error) {
    console.error('Erreur lors de la récupération des packs:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
