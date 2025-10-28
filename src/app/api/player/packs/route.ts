import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// GET - Récupérer tous les packs du joueur
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer tous les packs du joueur
    const packs = await prisma.coachingPackage.findMany({
      where: {
        playerId: session.user.id,
        status: 'ACTIVE',
      },
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
        sessions: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true,
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

    return NextResponse.json({ packs });
  } catch (error) {
    console.error('Erreur lors de la récupération des packs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
