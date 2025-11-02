import { loadStripe } from '@stripe/stripe-js';
import { ReservationType } from './stripe/types';

// Initialiser Stripe avec la clé publique
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentSessionParams {
  reservationId: string;
  coachName: string;
  playerEmail: string;
  price: number;
  type?: ReservationType;
}

/**
 * Redirige vers la page de paiement Stripe pour une session/pack
 */
export async function redirectToCheckout(params: PaymentSessionParams): Promise<void> {
  try {
    // Créer la session de paiement
    const response = await fetch('/api/stripe/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        type: params.type || 'SINGLE',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création de la session de paiement');
    }

    const data = await response.json();

    // Rediriger vers Stripe Checkout
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe n\'a pas pu être chargé');
    }

    // Rediriger vers Stripe Checkout via URL (méthode recommandée)
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('URL de session de paiement manquante');
    }
  } catch (error) {
    console.error('Erreur redirection Stripe:', error);
    throw error;
  }
}

/**
 * Redirige vers l'abonnement coach Stripe
 */
export async function redirectToCoachSubscription(plan: 'MONTHLY' | 'YEARLY'): Promise<void> {
  try {
    const response = await fetch('/api/stripe/subscribe-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la création de l\'abonnement');
    }

    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error('URL d\'abonnement invalide');
    }
  } catch (error) {
    console.error('Erreur redirection abonnement Stripe:', error);
    throw error;
  }
}

/**
 * Annule l'abonnement coach
 */
export async function cancelCoachSubscription(): Promise<{ message: string; currentPeriodEnd: Date }> {
  try {
    const response = await fetch('/api/stripe/subscribe-coach', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'annulation de l\'abonnement');
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur annulation abonnement Stripe:', error);
    throw error;
  }
}
