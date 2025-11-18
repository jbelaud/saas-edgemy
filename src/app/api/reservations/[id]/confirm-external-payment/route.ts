import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/reservations/[id]/confirm-external-payment
 * Permet au coach de confirmer qu'il a reçu le paiement externe (plan LITE)
 */
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const resolvedParams = await context.params;
    const reservationId = resolvedParams.id;

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: {
          select: {
            userId: true,
            planKey: true,
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

    // Vérifier que l'utilisateur est bien le coach de cette réservation
    if (reservation.coach.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Vous n\'êtes pas autorisé à confirmer ce paiement' },
        { status: 403 }
      );
    }

    // Vérifier que c'est bien une réservation LITE
    if (reservation.coach.planKey !== 'LITE') {
      return NextResponse.json(
        { error: 'Cette action est réservée aux coachs avec le plan LITE' },
        { status: 400 }
      );
    }

    // Vérifier que le paiement est bien en attente
    if (reservation.paymentStatus !== 'EXTERNAL_PENDING') {
      return NextResponse.json(
        {
          error: 'Le paiement a déjà été confirmé ou n\'est pas en attente',
          currentStatus: reservation.paymentStatus,
        },
        { status: 400 }
      );
    }

    // Mettre à jour la réservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        paymentStatus: 'EXTERNAL_PAID',
        status: 'CONFIRMED',
      },
      include: {
        player: {
          select: {
            name: true,
            email: true,
          },
        },
        announcement: {
          select: {
            title: true,
          },
        },
      },
    });

    console.log(`✅ [LITE] Paiement externe confirmé pour réservation ${reservationId}`);

    // TODO: Envoyer un email/notification au joueur pour confirmer
    // que le paiement a été validé par le coach

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
      message: 'Paiement confirmé avec succès',
    });
  } catch (error) {
    console.error('❌ Erreur confirmation paiement externe:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}
