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
 * POST /api/stripe/checkout/subscription
 * Créer une session Stripe Checkout pour l'abonnement coach
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

    const { plan, locale, planKey } = await req.json() as {
      plan: SubscriptionPlan;
      locale?: string;
      planKey?: 'PRO' | 'LITE';
    };

    // Validation
    if (!plan || !['MONTHLY', 'YEARLY'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide. Choisissez MONTHLY ou YEARLY' },
        { status: 400 }
      );
    }

    const userLocale = locale || 'fr';
    const selectedPlanKey = planKey && ['PRO', 'LITE'].includes(planKey) ? planKey : 'PRO';

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

    // Récupérer la config du plan (PRO ou LITE)
    const planTypeConfig = STRIPE_CONFIG.plans[selectedPlanKey];
    const planConfig = plan === 'MONTHLY' ? planTypeConfig.monthly : planTypeConfig.yearly;

    // Vérifier que les Price IDs sont configurés
    if (!planConfig.priceId) {
      console.error(`Price ID manquant pour le plan ${selectedPlanKey} ${plan}`);
      return NextResponse.json(
        { error: `Configuration Stripe incomplète pour le plan ${selectedPlanKey}. Contactez l\'administrateur.` },
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

    // URL de base pour les redirections
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

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
      success_url: `${baseUrl}/${userLocale}/coach/dashboard?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/${userLocale}/coach/dashboard?subscription=cancelled`,
      metadata: {
        coachId: coach.id,
        userId: session.user.id,
        plan,
        planKey: selectedPlanKey, // Ajouter le planKey
      },
      subscription_data: {
        metadata: {
          coachId: coach.id,
          userId: session.user.id,
          plan,
          planKey: selectedPlanKey, // Ajouter le planKey
        },
      },
      // ✅ ACTIVATION STRIPE TAX pour conformité TVA
      automatic_tax: {
        enabled: true,
      },
      // ✅ COLLECTE ADRESSE pour calcul TVA correct
      customer_update: {
        address: 'auto',
      },
    });

    console.log(`✅ Session d'abonnement ${selectedPlanKey} créée pour coach ${coach.id} (${plan})`);

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
      planKey: selectedPlanKey,
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
