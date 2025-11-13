import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * GET /api/stripe/connect/status
 * Récupérer le statut du compte Stripe Connect du coach
 */
export async function GET() {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'abonnement est actif OU s'il est annulé mais encore dans la période active
    const hasActiveSubscription = coach.subscriptionStatus === 'ACTIVE';
    const isInActivePeriod = coach.currentPeriodEnd ? new Date() < coach.currentPeriodEnd : false;
    const canAccessStripeConnect = hasActiveSubscription || isInActivePeriod;

    // Récupérer les informations d'annulation depuis Stripe si l'abonnement existe
    let cancelAtPeriodEnd = false;
    if (coach.subscriptionId && hasActiveSubscription) {
      try {
        const subscription = await stripe.subscriptions.retrieve(coach.subscriptionId);
        cancelAtPeriodEnd = subscription.cancel_at_period_end;
      } catch (error) {
        console.error('Erreur récupération subscription Stripe:', error);
      }
    }

    // Si pas de compte Stripe Connect
    if (!coach.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        accountId: null,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        hasActiveSubscription,
        canAccessStripeConnect,
        cancelAtPeriodEnd,
        currentPeriodEnd: coach.currentPeriodEnd?.toISOString() || null,
        subscriptionStatus: coach.subscriptionStatus,
      });
    }

    // Si c'est un compte mock, retourner un statut non connecté
    if (coach.stripeAccountId.startsWith('acct_mock_')) {
      console.log(`ℹ️ Compte mock détecté: ${coach.stripeAccountId}, retour statut non connecté`);
      return NextResponse.json({
        connected: false,
        accountId: null,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        hasActiveSubscription,
        canAccessStripeConnect,
        cancelAtPeriodEnd,
        currentPeriodEnd: coach.currentPeriodEnd?.toISOString() || null,
        subscriptionStatus: coach.subscriptionStatus,
      });
    }

    // Récupérer les détails du compte Stripe Connect
    const account = await stripe.accounts.retrieve(coach.stripeAccountId);

    return NextResponse.json({
      connected: true,
      accountId: account.id,
      detailsSubmitted: account.details_submitted,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      hasActiveSubscription,
      canAccessStripeConnect,
      cancelAtPeriodEnd,
      currentPeriodEnd: coach.currentPeriodEnd?.toISOString() || null,
      subscriptionStatus: coach.subscriptionStatus,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        pastDue: account.requirements?.past_due || [],
      },
    });
  } catch (err) {
    console.error('❌ Erreur récupération statut Stripe Connect:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de la récupération du statut',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
