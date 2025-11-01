import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { STRIPE_CONFIG, SubscriptionPlan } from '@/lib/stripe/types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * POST /api/stripe/subscribe-coach
 * Créer un abonnement Stripe pour un coach (Phase 1)
 */
export async function POST(req: Request) {
  try {
    // Vérifier l'authentification
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { plan } = await req.json() as { plan: SubscriptionPlan };

    // Validation
    if (!plan || !['MONTHLY', 'YEARLY'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide. Choisissez MONTHLY ou YEARLY' },
        { status: 400 }
      );
    }

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    });

    if (!coach) {
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si le coach a déjà un abonnement actif
    if (coach.subscriptionStatus === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement actif' },
        { status: 400 }
      );
    }

    const planConfig = plan === 'MONTHLY' ? STRIPE_CONFIG.plans.monthly : STRIPE_CONFIG.plans.yearly;

    // Vérifier que les Price IDs sont configurés
    if (!planConfig.priceId) {
      console.error(`Price ID manquant pour le plan ${plan}`);
      return NextResponse.json(
        { error: 'Configuration Stripe incomplète. Contactez l\'administrateur.' },
        { status: 500 }
      );
    }

    let customerId = coach.stripeCustomerId;

    // Créer un client Stripe si nécessaire
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: coach.user.email!,
        name: `${coach.firstName} ${coach.lastName}`,
        metadata: {
          coachId: coach.id,
          userId: session.user.id,
        },
      });
      customerId = customer.id;

      // Mettre à jour le coach avec l'ID client Stripe
      await prisma.coach.update({
        where: { id: coach.id },
        data: { stripeCustomerId: customerId },
      });

      console.log(`✅ Client Stripe créé: ${customerId} pour coach ${coach.id}`);
    }

    // Créer la session Stripe Checkout pour l'abonnement
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/settings/subscription?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/coach/settings/subscription?canceled=true`,
      metadata: {
        coachId: coach.id,
        userId: session.user.id,
        plan,
      },
    });

    console.log(`✅ Session d'abonnement créée pour coach ${coach.id} (${plan})`);

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (err) {
    console.error('❌ Erreur création abonnement coach:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de la création de l\'abonnement',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stripe/subscribe-coach
 * Annuler l'abonnement d'un coach
 */
export async function DELETE(req: Request) {
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

    if (!coach.subscriptionId) {
      return NextResponse.json(
        { error: 'Aucun abonnement actif' },
        { status: 400 }
      );
    }

    // Annuler l'abonnement Stripe (fin de période)
    const subscription = await stripe.subscriptions.update(coach.subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log(`✅ Abonnement ${coach.subscriptionId} annulé (fin de période: ${new Date((subscription as any).current_period_end * 1000).toISOString()})`);

    return NextResponse.json({
      message: 'Abonnement annulé. Il restera actif jusqu\'à la fin de la période en cours.',
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    });
  } catch (err) {
    console.error('❌ Erreur annulation abonnement:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'annulation de l\'abonnement',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
