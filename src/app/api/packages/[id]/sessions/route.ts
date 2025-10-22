import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST - Planifier une session pour un pack
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: packageId } = await params;
    const body = await request.json();
    const { startDate, endDate } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate et endDate requis' },
        { status: 400 }
      );
    }

    // Récupérer le pack avec ses informations
    const coachingPackage = await prisma.coachingPackage.findUnique({
      where: { id: packageId },
      include: {
        coach: {
          select: {
            userId: true,
          },
        },
        announcement: {
          select: {
            durationMin: true,
            coachId: true,
          },
        },
        sessions: true,
      },
    });

    if (!coachingPackage) {
      return NextResponse.json(
        { error: 'Pack non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le coach
    if (coachingPackage.coach.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Seul le coach peut planifier des sessions' },
        { status: 403 }
      );
    }

    // Vérifier qu'il reste des heures
    if (coachingPackage.remainingHours <= 0) {
      return NextResponse.json(
        { error: 'Plus d\'heures disponibles dans ce pack' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Vérifier que le créneau est disponible
    const existingReservation = await prisma.reservation.findFirst({
      where: {
        coachId: coachingPackage.announcement.coachId,
        status: { in: ['CONFIRMED', 'PENDING'] },
        OR: [
          {
            startDate: { lte: start },
            endDate: { gt: start },
          },
          {
            startDate: { lt: end },
            endDate: { gte: end },
          },
          {
            startDate: { gte: start },
            endDate: { lte: end },
          },
        ],
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { error: 'Ce créneau n\'est plus disponible' },
        { status: 409 }
      );
    }

    // Créer la session et la réservation dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer la réservation
      const reservation = await tx.reservation.create({
        data: {
          announcementId: coachingPackage.announcementId,
          coachId: coachingPackage.coachId,
          playerId: coachingPackage.playerId,
          packId: packageId,
          sessionNumber: coachingPackage.sessions.length + 1,
          startDate: start,
          endDate: end,
          status: 'CONFIRMED',
          priceCents: 0, // Déjà payé via le pack
        },
      });

      // Créer la PackageSession
      const packageSession = await tx.packageSession.create({
        data: {
          packageId,
          reservationId: reservation.id,
          startDate: start,
          endDate: end,
          durationMinutes: coachingPackage.announcement.durationMin,
          status: 'SCHEDULED',
        },
      });

      // Déduire les heures du pack
      const durationHours = coachingPackage.announcement.durationMin / 60;
      await tx.coachingPackage.update({
        where: { id: packageId },
        data: {
          remainingHours: {
            decrement: durationHours,
          },
        },
      });

      return { reservation, packageSession };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la planification de la session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PATCH - Modifier une session de pack
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: packageId } = await params;
    const body = await request.json();
    const { sessionId, status } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId requis' },
        { status: 400 }
      );
    }

    // Récupérer la session
    const packageSession = await prisma.packageSession.findUnique({
      where: { id: sessionId },
      include: {
        package: {
          include: {
            coach: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!packageSession || packageSession.packageId !== packageId) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le coach
    if (packageSession.package.coach.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Seul le coach peut modifier cette session' },
        { status: 403 }
      );
    }

    // Mettre à jour le statut
    const updatedSession = await prisma.packageSession.update({
      where: { id: sessionId },
      data: {
        ...(status && { status }),
      },
    });

    return NextResponse.json({ session: updatedSession });
  } catch (error) {
    console.error('Erreur lors de la modification de la session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Annuler une session de pack
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: packageId } = await params;
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId requis' },
        { status: 400 }
      );
    }

    // Récupérer la session
    const packageSession = await prisma.packageSession.findUnique({
      where: { id: sessionId },
      include: {
        package: {
          include: {
            coach: {
              select: {
                userId: true,
              },
            },
          },
        },
      },
    });

    if (!packageSession || packageSession.packageId !== packageId) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que l'utilisateur est le coach ou le joueur
    const isCoach = packageSession.package.coach.userId === session.user.id;
    const isPlayer = packageSession.package.playerId === session.user.id;

    if (!isCoach && !isPlayer) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Annuler la session dans une transaction
    await prisma.$transaction(async (tx) => {
      // Mettre à jour le statut de la session
      await tx.packageSession.update({
        where: { id: sessionId },
        data: { status: 'CANCELLED' },
      });

      // Mettre à jour la réservation associée
      if (packageSession.reservationId) {
        await tx.reservation.update({
          where: { id: packageSession.reservationId },
          data: { status: 'CANCELLED' },
        });
      }

      // Recréditer les heures au pack
      const durationHours = packageSession.durationMinutes / 60;
      await tx.coachingPackage.update({
        where: { id: packageId },
        data: {
          remainingHours: {
            increment: durationHours,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
