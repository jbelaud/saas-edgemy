import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * POST /api/coach/cancel-pack-session
 * Annule une session de pack et re-crédite les heures
 */
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
      select: { id: true },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    const body = await request.json();
    const { packageSessionId } = body;

    if (!packageSessionId) {
      return NextResponse.json(
        { error: 'ID de session manquant' },
        { status: 400 }
      );
    }

    // Récupérer la session de pack avec les infos du pack
    const packageSession = await prisma.packageSession.findUnique({
      where: { id: packageSessionId },
      include: {
        package: {
          select: {
            id: true,
            coachId: true,
            status: true,
            remainingHours: true,
          },
        },
        reservation: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
          },
        },
      },
    });

    if (!packageSession) {
      return NextResponse.json(
        { error: 'Session non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que la session appartient au coach
    if (packageSession.package.coachId !== coach.id) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    // Vérifier que la session n'est pas déjà annulée ou complétée
    if (packageSession.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cette session est déjà annulée' },
        { status: 400 }
      );
    }

    if (packageSession.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Impossible d\'annuler une session déjà complétée' },
        { status: 400 }
      );
    }

    // Calculer les heures à re-créditer
    const durationHours = packageSession.durationMinutes / 60;

    // Annuler dans une transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour le statut de la PackageSession
      await tx.packageSession.update({
        where: { id: packageSessionId },
        data: {
          status: 'CANCELLED',
        },
      });

      // 2. Re-créditer les heures au pack (sauf si pack déjà complété)
      if (packageSession.package.status === 'ACTIVE') {
        await tx.coachingPackage.update({
          where: { id: packageSession.package.id },
          data: {
            remainingHours: {
              increment: durationHours,
            },
          },
        });
      }

      // 3. Si une réservation est associée, l'annuler aussi
      if (packageSession.reservationId && packageSession.reservation) {
        await tx.reservation.update({
          where: { id: packageSession.reservationId },
          data: {
            status: 'CANCELLED',
            cancelledBy: 'COACH',
            cancelledAt: new Date(),
            cancellationReason: 'Session annulée par le coach',
          },
        });
      }
    });

    const newRemainingHours = packageSession.package.status === 'ACTIVE'
      ? packageSession.package.remainingHours + durationHours
      : packageSession.package.remainingHours;

    console.log(`✅ Session ${packageSessionId} annulée. Heures re-créditées: +${durationHours}h (total: ${newRemainingHours}h)`);

    return NextResponse.json({
      success: true,
      message: 'Session annulée avec succès',
      hoursRecredited: durationHours,
      remainingHours: newRemainingHours,
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la session:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
