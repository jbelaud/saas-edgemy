/**
 * Helper functions pour la gestion des transfers Stripe vers les coachs
 */

import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import {
  Prisma,
  PackageTransferStatus,
  PackageStatus,
  PackageSessionStatus,
} from '@prisma/client';
import {
  TransferType,
  TRANSFER_TYPES,
  calculatePackTransferAmounts,
} from './business-rules';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * Interface pour les paramètres de création de transfer
 */
export interface CreateTransferParams {
  amount: number; // Montant en centimes
  destinationAccountId: string; // ID du compte Stripe Connect du coach
  sourceTransaction: string; // ID du PaymentIntent source
  reservationId: string;
  transferType: TransferType;
  metadata?: Record<string, string>;
}

/**
 * Crée un transfer Stripe vers le compte Connect du coach
 * et enregistre le log en base de données
 *
 * @param params - Paramètres du transfer
 * @returns ID du transfer Stripe
 */
export async function createStripeTransfer(
  params: CreateTransferParams
): Promise<{ transferId: string; status: string }> {
  const { amount, destinationAccountId, sourceTransaction, reservationId, transferType, metadata } = params;

  try {
    // Créer le transfer Stripe
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'eur',
      destination: destinationAccountId,
      source_transaction: sourceTransaction,
      metadata: {
        reservationId,
        transferType,
        ...metadata,
      },
    });

    console.log(`✅ Transfer créé: ${transfer.id} - ${amount / 100}€ vers ${destinationAccountId}`);

    // Créer le log en base de données
    await prisma.transferLog.create({
      data: {
        reservationId,
        amount,
        stripeTransferId: transfer.id,
        status: 'pending', // Sera mis à jour par le webhook
        transferType,
      },
    });

    return {
      transferId: transfer.id,
      status: 'pending',
    };
  } catch (error) {
    console.error('❌ Erreur lors de la création du transfer:', error);

    // Logger l'échec
    await prisma.transferLog.create({
      data: {
        reservationId,
        amount,
        stripeTransferId: `failed_${Date.now()}`,
        status: 'failed',
        transferType,
      },
    });

    throw error;
  }
}

/**
 * Met à jour le statut d'un transfer dans les logs
 *
 * @param transferId - ID du transfer Stripe
 * @param status - Nouveau statut
 */
export async function updateTransferStatus(
  transferId: string,
  status: 'pending' | 'paid' | 'failed' | 'canceled'
): Promise<void> {
  await prisma.transferLog.updateMany({
    where: { stripeTransferId: transferId },
    data: { status },
  });
}

/**
 * Récupère le compte Stripe Connect d'un coach
 *
 * @param coachId - ID du coach
 * @returns ID du compte Stripe Connect ou null
 */
export async function getCoachStripeAccount(coachId: string): Promise<string | null> {
  const coach = await prisma.coach.findUnique({
    where: { id: coachId },
    select: { stripeAccountId: true },
  });

  return coach?.stripeAccountId || null;
}

/**
 * Vérifie si un transfer peut être effectué
 *
 * @param reservationId - ID de la réservation
 * @returns true si le transfer peut être effectué
 */
export async function canTransferToCoach(reservationId: string): Promise<{
  canTransfer: boolean;
  reason?: string;
}> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      paymentStatus: true,
      transferStatus: true,
      endDate: true,
      coachId: true,
    },
  });

  if (!reservation) {
    return { canTransfer: false, reason: 'Réservation non trouvée' };
  }

  if (reservation.paymentStatus !== 'PAID') {
    return { canTransfer: false, reason: 'Paiement non effectué' };
  }

  if (reservation.transferStatus !== 'PENDING') {
    return { canTransfer: false, reason: `Transfer déjà ${reservation.transferStatus}` };
  }

  if (new Date() < reservation.endDate) {
    return { canTransfer: false, reason: 'La session n\'est pas encore terminée' };
  }

  const coach = await prisma.coach.findUnique({
    where: { id: reservation.coachId },
    select: { stripeAccountId: true },
  });

  if (!coach?.stripeAccountId || coach.stripeAccountId.startsWith('acct_mock_')) {
    return { canTransfer: false, reason: 'Compte Stripe Connect du coach non configuré' };
  }

  return { canTransfer: true };
}

/**
 * Transfer pour une session unique complétée
 *
 * @param reservationId - ID de la réservation
 * @returns Résultat du transfer
 */
export async function transferForCompletedSession(reservationId: string): Promise<{
  success: boolean;
  transferId?: string;
  error?: string;
  amount?: number;
}> {
  try {
    // Vérifier si le transfer est possible
    const check = await canTransferToCoach(reservationId);
    if (!check.canTransfer) {
      return { success: false, error: check.reason };
    }

    // Récupérer les infos de la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: {
          select: {
            id: true,
            stripeAccountId: true,
          },
        },
      },
    });

    if (!reservation) {
      return { success: false, error: 'Réservation non trouvée' };
    }

    // Créer le transfer
    const { transferId } = await createStripeTransfer({
      amount: reservation.coachEarningsCents,
      destinationAccountId: reservation.coach.stripeAccountId!,
      sourceTransaction: reservation.stripePaymentId!,
      reservationId: reservation.id,
      transferType: TRANSFER_TYPES.SESSION_COMPLETION,
      metadata: {
        coachId: reservation.coach.id,
      },
    });

    // Mettre à jour la réservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        status: 'COMPLETED',
        transferStatus: 'TRANSFERRED',
        stripeTransferId: transferId,
        transferredAt: new Date(),
      },
    });

    console.log(`✅ Transfer complété pour réservation ${reservationId}`);

    return { success: true, transferId, amount: reservation.coachEarningsCents };
  } catch (error) {
    console.error('❌ Erreur lors du transfer:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

interface TransferPackInstallmentParams {
  reservationId: string;
  packageId: string;
  packageSessionId: string;
}

export async function transferPackInstallment(
  params: TransferPackInstallmentParams,
): Promise<{
  success: boolean;
  transferId?: string;
  error?: string;
  amount?: number;
  isFirstTransfer?: boolean;
  isFinalTransfer?: boolean;
}> {
  const { reservationId, packageId, packageSessionId } = params;

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: {
          select: {
            id: true,
            stripeAccountId: true,
          },
        },
        packageSession: {
          select: {
            id: true,
            status: true,
            packageId: true,
          },
        },
      },
    });

    if (!reservation) {
      return { success: false, error: 'Réservation non trouvée' };
    }

    if (reservation.type !== 'PACK') {
      return { success: false, error: 'Réservation non liée à un pack' };
    }

    if (!reservation.packageSession || reservation.packageSession.id !== packageSessionId) {
      return { success: false, error: 'Session de pack introuvable pour cette réservation' };
    }

    if (!reservation.coach.stripeAccountId || reservation.coach.stripeAccountId.startsWith('acct_mock_')) {
      return { success: false, error: 'Compte Stripe Connect du coach non configuré' };
    }

    const coachingPackage = await prisma.coachingPackage.findUnique({
      where: { id: packageId },
      select: {
        id: true,
        coachId: true,
        playerId: true,
        status: true,
        transferStatus: true,
        stripePaymentId: true,
        coachEarningsCents: true,
        sessionPayoutCents: true,
        sessionsCompletedCount: true,
        sessionsTotalCount: true,
      },
    });

    if (!coachingPackage) {
      return { success: false, error: 'Pack introuvable' };
    }

    if (!coachingPackage.stripePaymentId) {
      return { success: false, error: 'Identifiant de paiement Stripe manquant pour le pack' };
    }

    const totalSessions = coachingPackage.sessionsTotalCount
      || reservation.sessionsCount
      || 1;
    const coachNetTotal = coachingPackage.coachEarningsCents ?? reservation.coachNetCents;

    const isFirstSession = coachingPackage.sessionsCompletedCount === 0;
    const nextCompletedCount = coachingPackage.sessionsCompletedCount + 1;
    const isLastSession = nextCompletedCount >= totalSessions;

    if (nextCompletedCount > totalSessions) {
      return { success: false, error: 'Toutes les sessions du pack ont déjà été complétées' };
    }

    const basePayout = coachingPackage.sessionPayoutCents
      || Math.floor(coachNetTotal / totalSessions);
    const remainder = coachNetTotal - basePayout * totalSessions;

    let transferAmount = basePayout;
    if (isLastSession) {
      transferAmount += remainder;
    }

    if (transferAmount <= 0) {
      return { success: false, error: 'Montant du transfert invalide pour cette session' };
    }

    const transferType = TRANSFER_TYPES.PACK_SESSION_PAYOUT;

    const { transferId } = await createStripeTransfer({
      amount: transferAmount,
      destinationAccountId: reservation.coach.stripeAccountId!,
      sourceTransaction: coachingPackage.stripePaymentId,
      reservationId: reservation.id,
      transferType,
      metadata: {
        coachId: reservation.coach.id,
        packageId,
        packageSessionId,
      },
    });

    await prisma.$transaction(async (tx) => {
      await tx.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'COMPLETED',
          transferStatus: 'TRANSFERRED',
          stripeTransferId: transferId,
          transferredAt: new Date(),
        },
      });

      const packageUpdateData: Prisma.CoachingPackageUncheckedUpdateInput = {
        sessionsCompletedCount: nextCompletedCount,
      };

      if (isLastSession) {
        packageUpdateData.transferStatus = PackageTransferStatus.FULLY_TRANSFERRED;
        packageUpdateData.finalTransferId = transferId;
        packageUpdateData.finalTransferredAt = new Date();
        packageUpdateData.status = PackageStatus.COMPLETED;
      } else {
        packageUpdateData.transferStatus = PackageTransferStatus.PARTIALLY_TRANSFERRED;
      }

      await tx.coachingPackage.update({
        where: { id: packageId },
        data: packageUpdateData,
      });

      await tx.packageSession.update({
        where: { id: packageSessionId },
        data: {
          status: PackageSessionStatus.COMPLETED,
        },
      });
    });

    console.log(`✅ Transfert pack réalisé pour la session ${packageSessionId} (${transferAmount / 100}€)`);

    return {
      success: true,
      transferId,
      amount: transferAmount,
      isFirstTransfer: isFirstSession,
      isFinalTransfer: isLastSession,
    };
  } catch (error) {
    console.error('❌ Erreur transfert pack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Transfer de compensation au coach en cas d'annulation tardive par le joueur
 *
 * @param reservationId - ID de la réservation
 * @param compensationAmount - Montant de la compensation (centimes)
 * @returns Résultat du transfer
 */
export async function transferCancellationCompensation(
  reservationId: string,
  compensationAmount: number
): Promise<{
  success: boolean;
  transferId?: string;
  error?: string;
}> {
  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        coach: {
          select: {
            id: true,
            stripeAccountId: true,
          },
        },
      },
    });

    if (!reservation) {
      return { success: false, error: 'Réservation non trouvée' };
    }

    if (!reservation.coach.stripeAccountId || reservation.coach.stripeAccountId.startsWith('acct_mock_')) {
      return { success: false, error: 'Compte Stripe Connect du coach non configuré' };
    }

    // Créer le transfer de compensation
    const { transferId } = await createStripeTransfer({
      amount: compensationAmount,
      destinationAccountId: reservation.coach.stripeAccountId,
      sourceTransaction: reservation.stripePaymentId!,
      reservationId: reservation.id,
      transferType: TRANSFER_TYPES.CANCELLATION_COMPENSATION,
      metadata: {
        coachId: reservation.coach.id,
        reason: 'late_cancellation_by_player',
      },
    });

    console.log(`✅ Compensation transférée au coach pour réservation ${reservationId}: ${compensationAmount / 100}€`);

    return { success: true, transferId };
  } catch (error) {
    console.error('❌ Erreur lors du transfer de compensation:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
