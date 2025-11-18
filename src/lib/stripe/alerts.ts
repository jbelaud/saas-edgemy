/**
 * Système d'alertes pour les anomalies Stripe
 */

import { prisma } from '@/lib/prisma';

export type AlertSeverity = 'INFO' | 'WARNING' | 'ERROR';

export interface Alert {
  type: string;
  severity: AlertSeverity;
  message: string;
  details: Record<string, unknown>;
  reservationId?: string;
  coachId?: string;
}

/**
 * Créer une alerte admin dans les logs
 */
export async function createAlert(alert: Alert): Promise<void> {
  try {
    await prisma.adminLog.create({
      data: {
        action: `STRIPE_ALERT_${alert.type}`,
        details: JSON.stringify({
          message: alert.message,
          ...alert.details,
        }),
        severity: alert.severity,
        source: 'stripe-integration',
      },
    });

    console.log(`🚨 ALERTE ${alert.severity}: ${alert.message}`, alert.details);
  } catch (error) {
    console.error('Erreur création alerte:', error);
  }
}

/**
 * Vérifier si la marge Edgemy est anormalement basse
 */
export async function checkLowMargin(
  reservationId: string,
  edgemyFeeCents: number,
  totalCustomerCents: number
): Promise<void> {
  const marginPercent = (edgemyFeeCents / totalCustomerCents) * 100;

  if (edgemyFeeCents === 0) {
    await createAlert({
      type: 'ZERO_MARGIN',
      severity: 'WARNING',
      message: 'Marge Edgemy nulle détectée',
      details: {
        reservationId,
        edgemyFeeCents,
        totalCustomerCents,
        marginPercent: 0,
      },
      reservationId,
    });
  } else if (edgemyFeeCents < 0) {
    await createAlert({
      type: 'NEGATIVE_MARGIN',
      severity: 'ERROR',
      message: 'MARGE NÉGATIVE DÉTECTÉE - Configuration incorrecte !',
      details: {
        reservationId,
        edgemyFeeCents,
        totalCustomerCents,
        marginPercent,
      },
      reservationId,
    });
  } else if (marginPercent < 1) {
    await createAlert({
      type: 'LOW_MARGIN',
      severity: 'INFO',
      message: 'Marge Edgemy très faible (< 1%)',
      details: {
        reservationId,
        edgemyFeeCents,
        totalCustomerCents,
        marginPercent,
      },
      reservationId,
    });
  }
}

/**
 * Alerter si un transfer échoue
 */
export async function alertTransferFailure(
  reservationId: string,
  coachId: string,
  error: Error
): Promise<void> {
  await createAlert({
    type: 'TRANSFER_FAILED',
    severity: 'ERROR',
    message: 'Échec du transfer Stripe vers le coach',
    details: {
      reservationId,
      coachId,
      error: error.message,
      stack: error.stack,
    },
    reservationId,
    coachId,
  });
}

/**
 * Alerter si un PaymentIntent échoue
 */
export async function alertPaymentFailure(
  reservationId: string,
  playerId: string,
  reason: string
): Promise<void> {
  await createAlert({
    type: 'PAYMENT_FAILED',
    severity: 'WARNING',
    message: 'Paiement joueur échoué',
    details: {
      reservationId,
      playerId,
      reason,
    },
    reservationId,
  });
}

/**
 * Alerter si un abonnement passe en PAST_DUE
 */
export async function alertSubscriptionPastDue(
  coachId: string,
  subscriptionId: string
): Promise<void> {
  await createAlert({
    type: 'SUBSCRIPTION_PAST_DUE',
    severity: 'WARNING',
    message: 'Abonnement coach en retard de paiement',
    details: {
      coachId,
      subscriptionId,
    },
    coachId,
  });
}
