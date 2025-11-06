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

    const hasActiveSubscription = coach.subscriptionStatus === 'ACTIVE';

    // Si pas de compte Stripe Connect
    if (!coach.stripeAccountId) {
      return NextResponse.json({
        connected: false,
        accountId: null,
        detailsSubmitted: false,
        chargesEnabled: false,
        payoutsEnabled: false,
        hasActiveSubscription,
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
