import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reservations/[id]/details
 *
 * Récupère les détails d'une réservation pour permettre de réessayer le paiement
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const reservation = await prisma.reservation.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        paymentStatus: true,
        coachId: true,
        playerId: true,
        priceCents: true,
        createdAt: true,
        coach: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        player: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier que la réservation n'a pas expiré (plus de 15 minutes)
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    if (
      reservation.status === 'PENDING' &&
      reservation.paymentStatus === 'PENDING' &&
      reservation.createdAt < fifteenMinutesAgo
    ) {
      return NextResponse.json(
        { error: 'Réservation expirée (plus de 15 minutes)' },
        { status: 410 } // 410 Gone
      );
    }

    // Vérifier que la réservation est toujours en attente
    if (reservation.status !== 'PENDING' || reservation.paymentStatus !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette réservation ne peut plus être payée' },
        { status: 400 }
      );
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
