import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

// PUT - Modifier une session
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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

    const { sessionId } = await params;
    const body = await request.json();
    const { startDate, endDate } = body;

    // Récupérer la session existante
    const existingSession = await prisma.packageSession.findUnique({
      where: { id: sessionId },
      include: {
        package: true,
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 });
    }

    if (existingSession.package.coachId !== coach.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return NextResponse.json(
        { error: 'La date de fin doit être après la date de début' },
        { status: 400 }
      );
    }

    // Calculer la différence de durée
    const oldDurationMinutes = existingSession.durationMinutes;
    const newDurationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const durationDifference = (newDurationMinutes - oldDurationMinutes) / 60; // en heures

    // Vérifier qu'il y a assez d'heures si la durée augmente
    if (durationDifference > 0 && durationDifference > existingSession.package.remainingHours) {
      return NextResponse.json(
        { error: `Heures insuffisantes. Restant: ${existingSession.package.remainingHours}h, Besoin: ${durationDifference}h` },
        { status: 400 }
      );
    }

    // Vérifier les chevauchements (exclure la session actuelle)
    const overlapping = await prisma.packageSession.findFirst({
      where: {
        id: { not: sessionId },
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

    if (overlapping) {
      return NextResponse.json(
        { error: 'Ce créneau chevauche une session existante' },
        { status: 400 }
      );
    }

    // Mettre à jour la session et ajuster les heures restantes
    const [updatedSession] = await prisma.$transaction([
      prisma.packageSession.update({
        where: { id: sessionId },
        data: {
          startDate: start,
          endDate: end,
          durationMinutes: newDurationMinutes,
        },
      }),
      prisma.coachingPackage.update({
        where: { id: existingSession.packageId },
        data: {
          remainingHours: {
            decrement: durationDifference, // Peut être négatif si la durée diminue
          },
        },
      }),
    ]);

    return NextResponse.json({
      session: updatedSession,
      message: 'Session modifiée avec succès',
    });
  } catch (error) {
    console.error('Erreur lors de la modification de la session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Annuler une session
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
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

    const { sessionId } = await params;

    // Récupérer la session existante
    const existingSession = await prisma.packageSession.findUnique({
      where: { id: sessionId },
      include: {
        package: true,
      },
    });

    if (!existingSession) {
      return NextResponse.json({ error: 'Session non trouvée' }, { status: 404 });
    }

    if (existingSession.package.coachId !== coach.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Supprimer la session et recréditer les heures
    const durationHours = existingSession.durationMinutes / 60;

    await prisma.$transaction([
      prisma.packageSession.delete({
        where: { id: sessionId },
      }),
      prisma.coachingPackage.update({
        where: { id: existingSession.packageId },
        data: {
          remainingHours: {
            increment: durationHours,
          },
        },
      }),
    ]);

    return NextResponse.json({
      message: 'Session annulée avec succès',
      creditedHours: durationHours,
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
