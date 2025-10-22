import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST - Créer un pack coaching (mock Stripe pour l'instant)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const {
      coachId,
      announcementId,
      totalHours,
      priceCents,
      stripePaymentId, // Mock pour l'instant
    } = body;

    // Validation
    if (!coachId || !announcementId || !totalHours || !priceCents) {
      return NextResponse.json(
        { error: 'coachId, announcementId, totalHours et priceCents requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'annonce existe
    const announcement = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { coachId: true },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    if (announcement.coachId !== coachId) {
      return NextResponse.json(
        { error: 'Coach non valide pour cette annonce' },
        { status: 400 }
      );
    }

    // Créer le pack
    const coachingPackage = await prisma.coachingPackage.create({
      data: {
        playerId: session.user.id,
        coachId,
        announcementId,
        totalHours,
        remainingHours: totalHours,
        priceCents,
        stripePaymentId: stripePaymentId || null,
        status: 'ACTIVE',
      },
      include: {
        coach: {
          select: {
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
      },
    });

    return NextResponse.json({ package: coachingPackage }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du pack:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer les packs de l'utilisateur
export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    let packages;
    if (coach) {
      // Récupérer les packs vendus par le coach
      packages = await prisma.coachingPackage.findMany({
        where: { coachId: coach.id },
        include: {
          player: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          announcement: {
            select: {
              title: true,
              durationMin: true,
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
            orderBy: { startDate: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Récupérer les packs achetés par le joueur
      packages = await prisma.coachingPackage.findMany({
        where: { playerId: session.user.id },
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
            include: {
              reservation: {
                select: {
                  startDate: true,
                  endDate: true,
                  status: true,
                },
              },
            },
            orderBy: { startDate: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Erreur lors de la récupération des packs:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
