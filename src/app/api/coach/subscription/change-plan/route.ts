import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json();
    const { newPlan } = body;

    if (!newPlan || (newPlan !== 'MONTHLY' && newPlan !== 'YEARLY')) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        subscriptionId: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        stripeCustomerId: true,
        currentPeriodEnd: true,
      },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    if (!coach.subscriptionId) {
      return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 });
    }

    if (coach.subscriptionPlan === newPlan) {
      return NextResponse.json({ error: 'Vous êtes déjà sur ce plan' }, { status: 400 });
    }

    // Si passage de YEARLY à MONTHLY, vérifier qu'on est dans le dernier mois
    if (coach.subscriptionPlan === 'YEARLY' && newPlan === 'MONTHLY') {
      if (!coach.currentPeriodEnd) {
        return NextResponse.json({ error: 'Impossible de déterminer la date de fin de période' }, { status: 400 });
      }

      const periodEnd = new Date(coach.currentPeriodEnd);
      const now = new Date();
      const oneMonthBeforeEnd = new Date(periodEnd);
      oneMonthBeforeEnd.setMonth(oneMonthBeforeEnd.getMonth() - 1);

      if (now < oneMonthBeforeEnd) {
        const daysRemaining = Math.ceil((oneMonthBeforeEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return NextResponse.json({
          error: `Vous pourrez passer au mensuel dans ${daysRemaining} jour${daysRemaining > 1 ? 's' : ''}, soit 1 mois avant la fin de votre abonnement annuel`
        }, { status: 400 });
      }
    }

    // Récupérer le nouveau Price ID selon le plan choisi
    const newPriceId = newPlan === 'MONTHLY'
      ? process.env.STRIPE_COACH_MONTHLY_PRICE_ID!
      : process.env.STRIPE_COACH_YEARLY_PRICE_ID!;

    // Si c'est YEARLY → MONTHLY, planifier le changement pour la fin de période (pas de paiement immédiat)
    if (coach.subscriptionPlan === 'YEARLY' && newPlan === 'MONTHLY') {
      // Mettre à jour l'abonnement pour qu'il passe à MONTHLY à la fin de la période
      await stripe.subscriptions.update(coach.subscriptionId, {
        items: [
          {
            id: (await stripe.subscriptions.retrieve(coach.subscriptionId)).items.data[0].id,
            price: newPriceId,
          },
        ],
        proration_behavior: 'none', // Pas de prorata, change à la fin de période
      });

      console.log(`✅ Abonnement planifié pour passage mensuel à la fin de période: ${coach.id}`);

      return NextResponse.json({
        success: true,
        message: 'Votre abonnement passera en mensuel à la fin de votre période annuelle en cours',
        effectiveDate: coach.currentPeriodEnd,
      });
    }

    // Si c'est MONTHLY → YEARLY, créer une session Checkout pour paiement immédiat
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: coach.stripeCustomerId!,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: newPriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata: {
          coachId: coach.id,
          plan: newPlan,
        },
      },
      metadata: {
        coachId: coach.id,
        type: 'plan_change',
        oldPlan: coach.subscriptionPlan || '',
        newPlan: newPlan,
        oldSubscriptionId: coach.subscriptionId,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/fr/coach/settings?plan_changed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/fr/coach/settings?plan_change_cancelled=true`,
    });

    console.log(`✅ Session Checkout créée pour changement de plan: ${coach.id} (${coach.subscriptionPlan} → ${newPlan})`);

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error('Erreur changement de plan:', error);
    return NextResponse.json(
      { error: 'Erreur lors du changement de plan' },
      { status: 500 }
    );
  }
}
