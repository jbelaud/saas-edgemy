import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/coach/packages
 * Récupère tous les packs de coaching réservés par les joueurs pour ce coach
 */
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Coach non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer tous les packs de ce coach
    const packages = await prisma.coachingPackage.findMany({
      where: {
        coachId: coach.id,
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
          },
        },
        sessions: {
          include: {
            reservation: {
              select: {
                startDate: true,
                endDate: true,
                status: true,
              },
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

    // Formater les données
    const formattedPackages = packages.map((pkg) => ({
      id: pkg.id,
      player: {
        id: pkg.player.id,
        name: pkg.player.name,
        email: pkg.player.email,
        image: pkg.player.image,
      },
      announcement: {
        title: pkg.announcement.title,
      },
      totalHours: pkg.totalHours,
      remainingHours: pkg.remainingHours,
      usedHours: pkg.totalHours - pkg.remainingHours,
      priceCents: pkg.priceCents,
      status: pkg.status,
      createdAt: pkg.createdAt,
      sessions: pkg.sessions.map((session) => ({
        id: session.id,
        startDate: session.startDate,
        endDate: session.endDate,
        durationMinutes: session.durationMinutes,
        status: session.status,
        reservationStatus: session.reservation?.status,
      })),
      totalSessions: pkg.sessions.length,
      completedSessions: pkg.sessions.filter((s) => s.status === 'COMPLETED').length,
    }));

    return NextResponse.json({
      packages: formattedPackages,
      total: formattedPackages.length,
      active: formattedPackages.filter((p) => p.status === 'ACTIVE').length,
      completed: formattedPackages.filter((p) => p.status === 'COMPLETED').length,
    });
  } catch (error) {
    console.error('Erreur récupération packs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
