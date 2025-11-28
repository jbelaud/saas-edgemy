import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// POST - Planifier une session de pack
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { packageId, startDate, endDate } = body;

    // Validation
    if (!packageId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      );
    }

    if (start < new Date()) {
      return NextResponse.json(
        { error: 'Impossible de planifier une session dans le passé' },
        { status: 400 }
      );
    }

    // Vérifier que le pack existe et appartient bien au coach
    const coachingPackage = await prisma.coachingPackage.findUnique({
      where: { id: packageId },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!coachingPackage) {
      return NextResponse.json(
        { error: 'Pack non trouvé' },
        { status: 404 }
      );
    }

    if (coachingPackage.coachId !== coach.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    if (coachingPackage.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Ce pack n\'est plus actif' },
        { status: 400 }
      );
    }

    // Calculer la durée en minutes
    const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const durationHours = durationMinutes / 60;

    // Vérifier qu'il reste assez d'heures
    if (durationHours > coachingPackage.remainingHours) {
      return NextResponse.json(
        { error: `Heures insuffisantes. Restant: ${coachingPackage.remainingHours}h, Demandé: ${durationHours}h` },
        { status: 400 }
      );
    }

    // Vérifier les chevauchements avec d'autres sessions de pack du coach
    const overlappingPackageSession = await prisma.packageSession.findFirst({
      where: {
        package: {
          coachId: coach.id,
        },
        status: {
          in: ['SCHEDULED', 'COMPLETED'],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gt: start } },
            ],
          },
          {
            AND: [
              { startDate: { lt: end } },
              { endDate: { gte: end } },
            ],
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } },
            ],
          },
        ],
      },
    });

    if (overlappingPackageSession) {
      return NextResponse.json(
        { error: 'Ce créneau chevauche une session de pack existante' },
        { status: 400 }
      );
    }

    // Vérifier aussi les chevauchements avec les réservations confirmées
    const overlappingReservation = await prisma.reservation.findFirst({
      where: {
        coachId: coach.id,
        status: {
          in: ['CONFIRMED', 'COMPLETED'],
        },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gt: start } },
            ],
          },
          {
            AND: [
              { startDate: { lt: end } },
              { endDate: { gte: end } },
            ],
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } },
            ],
          },
        ],
      },
    });

    if (overlappingReservation) {
      return NextResponse.json(
        { error: 'Ce créneau chevauche une réservation existante' },
        { status: 400 }
      );
    }

    // Créer la session et mettre à jour les heures restantes
    const [packageSession] = await prisma.$transaction([
      prisma.packageSession.create({
        data: {
          packageId,
          startDate: start,
          endDate: end,
          durationMinutes,
          status: 'SCHEDULED',
        },
      }),
      prisma.coachingPackage.update({
        where: { id: packageId },
        data: {
          remainingHours: {
            decrement: durationHours,
          },
        },
      }),
    ]);

    return NextResponse.json({
      session: packageSession,
      message: 'Session planifiée avec succès',
      remainingHours: coachingPackage.remainingHours - durationHours,
    }, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la planification de la session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
