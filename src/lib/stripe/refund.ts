/**
 * Helper functions pour la gestion des remboursements Stripe
 */

import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * Interface pour les paramètres de création de remboursement
 */
export interface CreateRefundParams {
  paymentIntentId: string; // ID du PaymentIntent à rembourser
  amount: number; // Montant en centimes (optionnel, si non fourni = remboursement total)
  reason: string; // Raison du remboursement
  reservationId: string;
  initiatedBy?: string; // ID de l'utilisateur qui initie le remboursement
}

/**
 * Crée un remboursement Stripe et enregistre le log en base de données
 *
 * @param params - Paramètres du remboursement
 * @returns ID du remboursement Stripe
 */
export async function createStripeRefund(
  params: CreateRefundParams
): Promise<{ refundId: string; status: string }> {
  const { paymentIntentId, amount, reason, reservationId, initiatedBy } = params;

  try {
    // Créer le remboursement Stripe
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount,
      reason: 'requested_by_customer',
      metadata: {
        reservationId,
        internalReason: reason,
      },
    });

    console.log(`✅ Remboursement créé: ${refund.id} - ${amount / 100}€`);

    // Créer le log en base de données
    await prisma.refundLog.create({
      data: {
        reservationId,
        amount,
        reason,
        stripeRefundId: refund.id,
        initiatedBy,
      },
    });

    return {
      refundId: refund.id,
      status: refund.status ?? 'pending',
    };
  } catch (error) {
    console.error('❌ Erreur lors de la création du remboursement:', error);
    throw error;
  }
}

/**
 * Vérifie si un remboursement peut être effectué
 *
 * @param reservationId - ID de la réservation
 * @returns true si le remboursement peut être effectué
 */
export async function canRefund(reservationId: string): Promise<{
  canRefund: boolean;
  reason?: string;
}> {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      paymentStatus: true,
      refundStatus: true,
      transferStatus: true,
      stripePaymentId: true,
    },
  });

  if (!reservation) {
    return { canRefund: false, reason: 'Réservation non trouvée' };
  }

  if (reservation.paymentStatus !== 'PAID') {
    return { canRefund: false, reason: 'Paiement non effectué' };
  }

  if (reservation.refundStatus === 'FULL') {
    return { canRefund: false, reason: 'Déjà remboursé entièrement' };
  }

  if (!reservation.stripePaymentId) {
    return { canRefund: false, reason: 'Pas de PaymentIntent associé' };
  }

  if (reservation.transferStatus === 'TRANSFERRED') {
    // Le transfer a déjà été fait au coach
    // On peut quand même rembourser, mais il faudra gérer le reverse avec le coach
    console.warn(`⚠️ Remboursement demandé mais transfer déjà effectué pour réservation ${reservationId}`);
  }

  return { canRefund: true };
}

/**
 * Remboursement complet d'une réservation
 *
 * @param reservationId - ID de la réservation
 * @param reason - Raison du remboursement
 * @param initiatedBy - ID de l'utilisateur qui initie
 * @returns Résultat du remboursement
 */
export async function refundReservationFull(
  reservationId: string,
  reason: string,
  initiatedBy?: string
): Promise<{
  success: boolean;
  refundId?: string;
  error?: string;
}> {
  try {
    // Vérifier si le remboursement est possible
    const check = await canRefund(reservationId);
    if (!check.canRefund) {
      return { success: false, error: check.reason };
    }

    // Récupérer les infos de la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        stripePaymentId: true,
        priceCents: true,
        refundAmount: true,
      },
    });

    if (!reservation) {
      return { success: false, error: 'Réservation non trouvée' };
    }

    // Calculer le montant à rembourser (prix total - déjà remboursé)
    const alreadyRefunded = reservation.refundAmount || 0;
    const amountToRefund = reservation.priceCents - alreadyRefunded;

    if (amountToRefund <= 0) {
      return { success: false, error: 'Déjà entièrement remboursé' };
    }

    // Créer le remboursement
    const { refundId } = await createStripeRefund({
      paymentIntentId: reservation.stripePaymentId!,
      amount: amountToRefund,
      reason,
      reservationId: reservation.id,
      initiatedBy,
    });

    // Mettre à jour la réservation
    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        refundStatus: 'FULL',
        refundAmount: reservation.priceCents,
        refundReason: reason,
        refundedAt: new Date(),
        transferStatus: 'CANCELLED', // Le transfer est annulé
      },
    });

    console.log(`✅ Remboursement complet pour réservation ${reservationId}`);

    return { success: true, refundId };
  } catch (error) {
    console.error('❌ Erreur lors du remboursement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Remboursement partiel d'une réservation
 *
 * @param reservationId - ID de la réservation
 * @param amount - Montant à rembourser (centimes)
 * @param reason - Raison du remboursement
 * @param initiatedBy - ID de l'utilisateur qui initie
 * @returns Résultat du remboursement
 */
export async function refundReservationPartial(
  reservationId: string,
  amount: number,
  reason: string,
  initiatedBy?: string
): Promise<{
  success: boolean;
  refundId?: string;
  error?: string;
}> {
  try {
    // Vérifier si le remboursement est possible
    const check = await canRefund(reservationId);
    if (!check.canRefund) {
      return { success: false, error: check.reason };
    }

    // Récupérer les infos de la réservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      select: {
        id: true,
        stripePaymentId: true,
        priceCents: true,
        refundAmount: true,
      },
    });

    if (!reservation) {
      return { success: false, error: 'Réservation non trouvée' };
    }

    // Vérifier que le montant est valide
    const alreadyRefunded = reservation.refundAmount || 0;
    const maxRefundable = reservation.priceCents - alreadyRefunded;

    if (amount > maxRefundable) {
      return { success: false, error: `Montant trop élevé (max: ${maxRefundable / 100}€)` };
    }

    if (amount <= 0) {
      return { success: false, error: 'Montant invalide' };
    }

    // Créer le remboursement
    const { refundId } = await createStripeRefund({
      paymentIntentId: reservation.stripePaymentId!,
      amount,
      reason,
      reservationId: reservation.id,
      initiatedBy,
    });

    // Mettre à jour la réservation
    const totalRefunded = alreadyRefunded + amount;
    const isFullyRefunded = totalRefunded >= reservation.priceCents;

    await prisma.reservation.update({
      where: { id: reservationId },
      data: {
        refundStatus: isFullyRefunded ? 'FULL' : 'PARTIAL',
        refundAmount: totalRefunded,
        refundReason: reason,
        refundedAt: new Date(),
      },
    });

    console.log(`✅ Remboursement partiel pour réservation ${reservationId}: ${amount / 100}€`);

    return { success: true, refundId };
  } catch (error) {
    console.error('❌ Erreur lors du remboursement:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Remboursement pro-rata d'un pack
 *
 * @param packageId - ID du package
 * @param reason - Raison du remboursement
 * @param initiatedBy - ID de l'utilisateur qui initie
 * @returns Résultat du remboursement
 */
export async function refundPackageProRata(
  packageId: string,
  reason: string
): Promise<{
  success: boolean;
  refundAmount?: number;
  note?: string;
  error?: string;
}> {
  try {
    const package_ = await prisma.coachingPackage.findUnique({
      where: { id: packageId },
      include: {
        sessions: {
          select: { status: true },
        },
      },
    });

    if (!package_) {
      return { success: false, error: 'Package non trouvé' };
    }

    if (!package_.stripePaymentId) {
      return { success: false, error: 'Pas de paiement associé' };
    }

    // Calculer le nombre de sessions complétées
    const completedSessions = package_.sessions.filter((s) => s.status === 'COMPLETED').length;
    const totalSessions = package_.sessions.length;
    const remainingSessions = totalSessions - completedSessions;

    // Calculer le montant pro-rata
    const remainingRatio = remainingSessions / totalSessions;
    const refundAmount = Math.round(package_.priceCents * remainingRatio);

    if (refundAmount <= 0) {
      return {
        success: false,
        error: 'Toutes les sessions ont été consommées',
      };
    }

    // Note sur le remboursement
    let note = `${completedSessions}/${totalSessions} sessions consommées. `;
    if (completedSessions > 0) {
      note += 'Les sessions déjà réalisées ont déjà été réglées au coach.';
    } else {
      note += 'Aucun versement au coach n\'a encore été effectué.';
    }

    // Créer le remboursement Stripe
    await stripe.refunds.create({
      payment_intent: package_.stripePaymentId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        packageId: package_.id,
        internalReason: reason,
        completedSessions: completedSessions.toString(),
        totalSessions: totalSessions.toString(),
      },
    });

    // Mettre à jour le package
    await prisma.coachingPackage.update({
      where: { id: packageId },
      data: {
        status: 'CANCELLED',
      },
    });

    console.log(`✅ Remboursement pro-rata package ${packageId}: ${refundAmount / 100}€`);

    return {
      success: true,
      refundAmount,
      note,
    };
  } catch (error) {
    console.error('❌ Erreur lors du remboursement du pack:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}
