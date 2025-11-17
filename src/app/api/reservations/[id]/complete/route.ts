/**
 * POST /api/reservations/[id]/complete
 *
 * Complète une session et débloque le paiement au coach
 *
 * ✅ NOUVEAU SYSTÈME DE PAIEMENT (Phase 1)
 * - L'argent est gelé dans le solde Edgemy jusqu'à la fin de la session
 * - Cette API transfère l'argent au coach APRÈS la session
 * - Pour les packs, utilise la logique 50%-50% (voir /api/packages/[id]/complete-session)
 *
 * Protection:
 * - Authentification requise (coach ou admin)
 * - Vérification que la session est terminée (endDate passée)
 * - Vérification que le transferStatus est PENDING
 *
 * Flow:
 * 1. Vérifier les permissions
 * 2. Vérifier que la session est terminée
 * 3. Créer le transfer Stripe vers le compte Connect du coach
 * 4. Mettre à jour la réservation (status: COMPLETED, transferStatus: TRANSFERRED)
 * 5. Créer le log de transfer
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import {
  transferForCompletedSession,
  transferPackInstallment,
} from '@/lib/stripe/transfer';
import { isSessionCompleted } from '@/lib/stripe/business-rules';
import { Prisma } from '@prisma/client';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const reservationId = id;

    // Récupérer la réservation
    const reservationSelect = Prisma.validator<Prisma.ReservationSelect>()({
      id: true,
      coachId: true,
      playerId: true,
      announcementId: true,
      packId: true,
      paymentStatus: true,
      transferStatus: true,
      startDate: true,
      endDate: true,
      status: true,
      stripePaymentId: true,
      stripeTransferId: true,
      transferredAt: true,
      type: true,
      coachEarningsCents: true,
      coachNetCents: true,
      sessionsCount: true,
      coach: {
        select: {
          id: true,
          userId: true,
          firstName: true,
          lastName: true,
          stripeAccountId: true,
        },
      },
      player: {
        select: {
          id: true,
          name: true,
        },
      },
      packageSession: {
        select: {
          id: true,
          packageId: true,
          status: true,
        },
      },
    });

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: reservationSelect,
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Réservation non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier les permissions
    // Seul le coach, le joueur ou un admin peut marquer comme complété
    const isCoach = session.user.id === reservation.coach.userId;
    const isPlayer = session.user.id === reservation.playerId;
    const isAdmin = session.user.role === 'ADMIN';

    if (!isCoach && !isPlayer && !isAdmin) {
      return NextResponse.json(
        { error: 'Vous n\'avez pas la permission de compléter cette session' },
        { status: 403 }
      );
    }

    // Vérifier que la session est bien terminée
    if (!isSessionCompleted(reservation.endDate)) {
      const minutesRemaining = Math.ceil(
        (reservation.endDate.getTime() - new Date().getTime()) / (1000 * 60)
      );

      return NextResponse.json(
        {
          error: 'La session n\'est pas encore terminée',
          minutesRemaining,
          endDate: reservation.endDate.toISOString(),
        },
        { status: 400 }
      );
    }

    // Vérifier le statut du paiement
    if (reservation.paymentStatus !== 'PAID') {
      return NextResponse.json(
        { error: 'Le paiement n\'a pas été effectué' },
        { status: 400 }
      );
    }

    // Vérifier le statut du transfer
    if (reservation.transferStatus !== 'PENDING') {
      return NextResponse.json(
        {
          error: `Le transfer est déjà ${reservation.transferStatus}`,
          transferStatus: reservation.transferStatus,
          transferredAt: reservation.transferredAt,
        },
        { status: 400 }
      );
    }

    // Vérifier que le coach a un compte Stripe Connect valide
    if (
      !reservation.coach.stripeAccountId ||
      reservation.coach.stripeAccountId.startsWith('acct_mock_')
    ) {
      return NextResponse.json(
        { error: 'Le coach n\'a pas configuré son compte Stripe Connect' },
        { status: 400 }
      );
    }

    console.log(`🔄 Début du processus de transfert pour réservation ${reservationId}`);
    console.log(`   Coach: ${reservation.coach.firstName} ${reservation.coach.lastName}`);
    console.log(`   Joueur: ${reservation.player.name}`);
    console.log(`   Type: ${reservation.type}`);

    let transferResult: Awaited<ReturnType<typeof transferForCompletedSession>> | Awaited<ReturnType<typeof transferPackInstallment>>;

    if (reservation.type === 'PACK') {
      if (!reservation.packId || !reservation.packageSession) {
        return NextResponse.json(
          { error: 'Pack ou session de pack introuvable pour cette réservation' },
          { status: 400 },
        );
      }

      transferResult = await transferPackInstallment({
        reservationId,
        packageId: reservation.packageSession.packageId,
        packageSessionId: reservation.packageSession.id,
      });
    } else {
      transferResult = await transferForCompletedSession(reservationId);
    }

    if (!transferResult.success) {
      console.error(`❌ Échec du transfert: ${transferResult.error}`);
      return NextResponse.json(
        {
          error: 'Échec du transfert',
          details: transferResult.error,
        },
        { status: 500 },
      );
    }

    console.log(`✅ Transfert réalisé: ${transferResult.transferId ?? 'N/A'}`);

    const updatedReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: reservationSelect,
    });

    const packageDetails = reservation.packageSession
      ? await prisma.coachingPackage.findUnique({
        where: { id: reservation.packageSession.packageId },
        select: {
          id: true,
          sessionPayoutCents: true,
          sessionsCompletedCount: true,
          sessionsTotalCount: true,
          coachEarningsCents: true,
        },
      })
      : null;

    const transferredAmount = reservation.type === 'PACK'
      ? (transferResult.amount
        ?? packageDetails?.sessionPayoutCents
        ?? reservation.coachNetCents)
      : (transferResult.amount ?? reservation.coachEarningsCents);

    return NextResponse.json({
      success: true,
      message: reservation.type === 'PACK'
        ? 'Session de pack complétée et versement effectué'
        : 'Session complétée et paiement transféré au coach',
      reservation: updatedReservation,
      transfer: {
        transferId: transferResult.transferId,
        amount: transferredAmount,
        amountEuros: transferredAmount / 100,
        transferredAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('❌ Erreur lors de la complétion de la session:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
