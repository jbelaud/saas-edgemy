/**
 * Règles métier pour le système de paiement Edgemy
 *
 * Ce fichier contient toutes les constantes et règles de calcul
 * pour les commissions, annulations, remboursements et transfers.
 */

import { ReservationType } from './types';

// ============================================
// RÈGLES DE COMMISSION
// ============================================

export const COMMISSION_RULES = {
  /**
   * Session unique : 5% du prix du coach
   */
  SINGLE_SESSION: {
    percent: parseFloat(process.env.STRIPE_SINGLE_SESSION_FEE_PERCENT || '0.05'),
  },

  /**
   * Pack d'heures : 3€ fixe + 2% du prix du coach
   */
  PACK: {
    fixedEuros: parseFloat(process.env.STRIPE_PACK_FIXED_FEE || '3.00'),
    percent: parseFloat(process.env.STRIPE_PACK_PERCENT_FEE || '0.02'),
  },
} as const;

/**
 * Calcule la commission Edgemy selon le type de réservation
 *
 * @param coachPriceEuros - Prix fixé par le coach (en euros)
 * @param type - Type de réservation (SINGLE ou PACK)
 * @returns Commission en centimes
 */
export function calculateCommission(
  coachPriceEuros: number,
  type: ReservationType
): number {
  const coachPriceCents = Math.round(coachPriceEuros * 100);

  if (type === 'SINGLE') {
    // Session unique : 5% du prix coach
    return Math.round(coachPriceCents * COMMISSION_RULES.SINGLE_SESSION.percent);
  } else {
    // Pack : 3€ fixe + 2% du prix coach
    const fixedFeeCents = Math.round(COMMISSION_RULES.PACK.fixedEuros * 100);
    const percentFeeCents = Math.round(coachPriceCents * COMMISSION_RULES.PACK.percent);
    return fixedFeeCents + percentFeeCents;
  }
}

// ============================================
// RÈGLES D'ANNULATION
// ============================================

export const CANCELLATION_RULES = {
  /**
   * Annulation par le JOUEUR
   */
  PLAYER: {
    /**
     * Délai pour remboursement total (en heures)
     * +24h avant la session = 100% remboursé
     */
    FULL_REFUND_HOURS: 24,

    /**
     * Pourcentage de remboursement si annulation tardive
     * -24h avant la session = 50% remboursé au joueur, 50% au coach
     */
    PARTIAL_REFUND_PERCENT: 0.5,

    /**
     * Pourcentage de compensation au coach si annulation tardive
     */
    COACH_COMPENSATION_PERCENT: 0.5,
  },

  /**
   * Annulation par le COACH
   * Le joueur choisit : reprogrammer ou remboursement total
   */
  COACH: {
    PLAYER_CHOICE: true, // Le joueur décide
    ALLOW_RESCHEDULE: true, // Possibilité de reprogrammer
    FULL_REFUND_IF_NO_RESCHEDULE: true, // Remboursement total si pas de reprogrammation
  },
} as const;

/**
 * Calcule les montants de remboursement selon les règles d'annulation
 *
 * @param reservationStartDate - Date de début de la session
 * @param playerAmountCents - Montant payé par le joueur (centimes)
 * @param coachEarningsCents - Montant que doit recevoir le coach (centimes)
 * @param cancelledBy - Qui annule (COACH ou PLAYER)
 * @returns Objet avec les montants de remboursement et compensation
 */
export function calculateCancellationAmounts(
  reservationStartDate: Date,
  playerAmountCents: number,
  coachEarningsCents: number,
  cancelledBy: 'PLAYER' | 'COACH'
): {
  refundToPlayer: number;
  compensationToCoach: number;
  refundType: 'FULL' | 'PARTIAL' | 'NONE';
} {
  const now = new Date();
  const hoursUntilSession = (reservationStartDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (cancelledBy === 'COACH') {
    // Le coach annule → remboursement total au joueur (choix par défaut)
    return {
      refundToPlayer: playerAmountCents,
      compensationToCoach: 0,
      refundType: 'FULL',
    };
  }

  // Le joueur annule
  if (hoursUntilSession >= CANCELLATION_RULES.PLAYER.FULL_REFUND_HOURS) {
    // +24h → Remboursement total
    return {
      refundToPlayer: playerAmountCents,
      compensationToCoach: 0,
      refundType: 'FULL',
    };
  } else {
    // -24h → Remboursement partiel (50/50)
    const refundAmount = Math.round(
      playerAmountCents * CANCELLATION_RULES.PLAYER.PARTIAL_REFUND_PERCENT
    );
    const compensationAmount = Math.round(
      coachEarningsCents * CANCELLATION_RULES.PLAYER.COACH_COMPENSATION_PERCENT
    );

    return {
      refundToPlayer: refundAmount,
      compensationToCoach: compensationAmount,
      refundType: 'PARTIAL',
    };
  }
}

// ============================================
// RÈGLES DE TRANSFERT POUR PACKS
// ============================================

export const PACK_TRANSFER_RULES = {
  /**
   * Mode de paiement : distribution après CHAQUE session consommée.
   */
  PAYOUT_MODE: 'PER_SESSION' as const,
} as const;

/**
 * Calcule le montant versé par session pour un pack.
 *
 * @param coachEarningsCents - Gains totaux du coach pour le pack
 * @param sessionsCount - Nombre total de sessions prévues dans le pack
 * @returns Montant de base par session et reliquat à verser lors de la dernière session
 */
export function calculatePackTransferAmounts(
  coachEarningsCents: number,
  sessionsCount: number,
): {
  perSessionAmount: number;
  remainder: number;
} {
  if (!Number.isInteger(sessionsCount) || sessionsCount <= 0) {
    throw new Error('sessionsCount doit être un entier strictement positif.');
  }

  const perSessionAmount = Math.floor(coachEarningsCents / sessionsCount);
  const remainder = coachEarningsCents - perSessionAmount * sessionsCount;

  return {
    perSessionAmount,
    remainder,
  };
}

/**
 * Calcule le remboursement pro-rata pour un pack
 *
 * @param totalSessions - Nombre total de sessions dans le pack
 * @param completedSessions - Nombre de sessions complétées
 * @param playerAmountCents - Montant total payé par le joueur
 * @param firstTransferDone - Si le premier transfer (50%) a déjà été fait
 * @returns Montant à rembourser au joueur
 */
export function calculatePackRefundAmount(
  totalSessions: number,
  completedSessions: number,
  playerAmountCents: number,
): {
  refundToPlayer: number;
  note: string;
} {
  if (!Number.isInteger(totalSessions) || totalSessions <= 0) {
    throw new Error('totalSessions doit être un entier strictement positif.');
  }

  const remainingSessions = Math.max(0, totalSessions - completedSessions);
  const refundAmount = Math.round(playerAmountCents * (remainingSessions / totalSessions));

  let note = `${completedSessions}/${totalSessions} sessions consommées. `;
  if (completedSessions > 0) {
    note += 'Les sessions déjà réalisées ont déjà été réglées au coach.';
  } else {
    note += 'Aucun versement au coach n\'a encore été effectué.';
  }

  return {
    refundToPlayer: refundAmount,
    note,
  };
}

// ============================================
// TYPES D'ÉVÉNEMENTS POUR LES LOGS
// ============================================

export const TRANSFER_TYPES = {
  SESSION_COMPLETION: 'session_completion', // Transfer après session unique
  CANCELLATION_COMPENSATION: 'cancellation_compensation', // Compensation coach si annulation joueur tardive
  PACK_SESSION_PAYOUT: 'pack_session_payout', // Paiement après chaque session de pack
} as const;

export type TransferType = typeof TRANSFER_TYPES[keyof typeof TRANSFER_TYPES];

// ============================================
// HELPERS DE CONVERSION
// ============================================

/**
 * Convertit des euros en centimes
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Convertit des centimes en euros
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Formate un montant en centimes en euros avec devise
 */
export function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2)}€`;
}

// ============================================
// VALIDATION
// ============================================

/**
 * Vérifie si une session est terminée
 */
export function isSessionCompleted(endDate: Date): boolean {
  return new Date() >= endDate;
}

/**
 * Vérifie si une annulation est dans les délais pour remboursement total
 */
export function isWithinFullRefundWindow(startDate: Date): boolean {
  const now = new Date();
  const hoursUntilSession = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilSession >= CANCELLATION_RULES.PLAYER.FULL_REFUND_HOURS;
}
