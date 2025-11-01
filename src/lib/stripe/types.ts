/**
 * Types et constantes pour l'intégration Stripe
 */

export type ReservationType = 'SINGLE' | 'PACK';

export type SubscriptionPlan = 'MONTHLY' | 'YEARLY';

export interface StripeConfig {
  // Plans d'abonnement coach
  plans: {
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
}

// Configuration Stripe (les Price IDs seront créés dans Stripe Dashboard)
export const STRIPE_CONFIG: StripeConfig = {
  plans: {
    monthly: {
      priceId: process.env.STRIPE_COACH_MONTHLY_PRICE_ID || '',
      amount: 3900, // 39€
      name: 'Abonnement Coach - Mensuel',
    },
    yearly: {
      priceId: process.env.STRIPE_COACH_YEARLY_PRICE_ID || '',
      amount: 39900, // 399€
      name: 'Abonnement Coach - Annuel',
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
