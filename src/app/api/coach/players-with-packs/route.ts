import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Récupérer tous les joueurs avec des packs actifs pour ce coach
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
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

    // Récupérer tous les packs actifs avec les infos des joueurs
    const packages = await prisma.coachingPackage.findMany({
      where: {
        coachId: coach.id,
        status: 'ACTIVE',
        remainingHours: {
          gt: 0, // Seulement les packs avec des heures restantes
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
        sessions: {
          where: {
            status: {
              in: ['SCHEDULED', 'COMPLETED'],
            },
          },
          orderBy: {
            startDate: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Grouper par joueur
    const playerPackages = packages.reduce((acc, pkg) => {
      const playerId = pkg.playerId;
      if (!acc[playerId]) {
        acc[playerId] = {
          player: pkg.player,
          packages: [],
        };
      }
      acc[playerId].packages.push({
        id: pkg.id,
        totalHours: pkg.totalHours,
        remainingHours: pkg.remainingHours,
        usedHours: pkg.totalHours - pkg.remainingHours,
        sessionsCount: pkg.sessions.length,
        createdAt: pkg.createdAt,
      });
      return acc;
    }, {} as Record<string, { player: any; packages: any[] }>);

    return NextResponse.json(Object.values(playerPackages));
  } catch (error) {
    console.error('Erreur lors de la récupération des joueurs avec packs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
