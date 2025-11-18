/**
 * Types et constantes pour l'intégration Stripe
 */

export type ReservationType = 'SINGLE' | 'PACK';

export type SubscriptionPlan = 'MONTHLY' | 'YEARLY';

export interface StripeConfig {
  // Plans d'abonnement coach
  plans: {
    PRO: {
      monthly: {
        priceId: string;
        amount: number; // en centimes
        name: string;
      };
      yearly: {
        priceId: string;
        amount: number; // en centimes
        name: string;
      };
    };
    LITE: {
      monthly: {
        priceId: string;
        amount: number; // en centimes
        name: string;
      };
      yearly: {
        priceId: string;
        amount: number; // en centimes
        name: string;
      };
    };
  };
}

// Configuration Stripe (les Price IDs seront créés dans Stripe Dashboard)
export const STRIPE_CONFIG: StripeConfig = {
  plans: {
    PRO: {
      monthly: {
        priceId: process.env.STRIPE_COACH_MONTHLY_PRICE_ID || '',
        amount: 3900, // 39€
        name: 'Edgemy Pro - Mensuel',
      },
      yearly: {
        priceId: process.env.STRIPE_COACH_YEARLY_PRICE_ID || '',
        amount: 39900, // 399€
        name: 'Edgemy Pro - Annuel',
      },
    },
    LITE: {
      monthly: {
        priceId: process.env.STRIPE_COACH_LITE_MONTHLY_PRICE_ID || '',
        amount: 1500, // 15€
        name: 'Edgemy Lite - Mensuel',
      },
      yearly: {
        priceId: process.env.STRIPE_COACH_LITE_YEARLY_PRICE_ID || '',
        amount: 14900, // 149€
        name: 'Edgemy Lite - Annuel',
      },
    },
  },
};

/**
 * Interface pour la création de session de paiement
 */
export interface CreateCheckoutSessionParams {
  reservationId: string;
  coachName: string;
  playerEmail: string;
  price: number; // en euros
  type: ReservationType;
}

/**
 * Interface pour l'abonnement coach
 */
export interface CreateSubscriptionParams {
  coachId: string;
  userId: string;
  email: string;
  plan: SubscriptionPlan;
}

/**
 * Résultat du calcul de commission
 */
export interface CommissionCalculation {
  playerAmount: number; // Ce que paie le joueur (en centimes)
  commission: number; // Commission Edgemy (en centimes)
  coachEarnings: number; // Gains du coach (en centimes)
}

/**
 * Statut du transfer
 */
export type TransferStatus = 'PENDING' | 'TRANSFERRED' | 'FAILED' | 'CANCELLED';

/**
 * Statut du remboursement
 */
export type RefundStatus = 'NONE' | 'PARTIAL' | 'FULL';

/**
 * Qui a annulé
 */
export type CancelledBy = 'COACH' | 'PLAYER';

/**
 * Statut du transfer pour les packs
 */
export type PackageTransferStatus = 'PENDING' | 'PARTIALLY_TRANSFERRED' | 'FULLY_TRANSFERRED';

/**
 * Paramètres pour annulation de réservation
 */
export interface CancelReservationParams {
  reservationId: string;
  cancelledBy: CancelledBy;
  reason: string;
  playerChoice?: 'reschedule' | 'refund'; // Si coach annule
}

/**
 * Résultat d'une annulation
 */
export interface CancellationResult {
  success: boolean;
  refundAmount?: number;
  compensationAmount?: number;
  refundType?: 'FULL' | 'PARTIAL' | 'NONE';
  transferId?: string;
  refundId?: string;
  error?: string;
}

/**
 * Paramètres pour compléter une session
 */
export interface CompleteSessionParams {
  reservationId: string;
  completedBy?: string; // ID de l'utilisateur qui marque comme complété
}

/**
 * Résultat de complétion de session
 */
export interface CompletionResult {
  success: boolean;
  transferId?: string;
  amount?: number;
  error?: string;
}
