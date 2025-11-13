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
      let currentPeriodEnd = coach.currentPeriodEnd;

      // Si currentPeriodEnd est null, le synchroniser depuis Stripe
      if (!currentPeriodEnd) {
        try {
          console.log(`🔍 Tentative de récupération de l'abonnement Stripe: ${coach.subscriptionId}`);
          const stripeSubscription = await stripe.subscriptions.retrieve(coach.subscriptionId, {
            expand: ['items.data.price']
          });

          // Logger l'objet complet pour debug
          console.log(`📊 Abonnement Stripe récupéré (COMPLET):`, JSON.stringify(stripeSubscription, null, 2));
          const subscriptionData = stripeSubscription as unknown as {
            id: string;
            status: string;
            current_period_end?: number;
            current_period_start?: number;
            items?: { data: Array<unknown> };
          };
          console.log(`📊 Propriétés clés:`, {
            id: subscriptionData.id,
            status: subscriptionData.status,
            current_period_end: subscriptionData.current_period_end,
            current_period_start: subscriptionData.current_period_start,
            items_data: subscriptionData.items?.data[0],
          });

          // Vérifier current_period_end à différents endroits possibles
          const periodEndTimestamp = subscriptionData.current_period_end;

          console.log(`🔍 periodEndTimestamp trouvé:`, periodEndTimestamp);

          if (periodEndTimestamp) {
            currentPeriodEnd = new Date(periodEndTimestamp * 1000);

            // Mettre à jour la BDD
            await prisma.coach.update({
              where: { id: coach.id },
              data: { currentPeriodEnd },
            });

            console.log(`✅ currentPeriodEnd synchronisé depuis Stripe pour le coach ${coach.id}: ${currentPeriodEnd}`);
          } else {
            console.error(`❌ current_period_end absent dans l'abonnement Stripe ${coach.subscriptionId}`);
            return NextResponse.json({ error: 'Impossible de déterminer la date de fin de période depuis Stripe' }, { status: 400 });
          }
        } catch (error) {
          console.error('Erreur récupération currentPeriodEnd depuis Stripe:', error);
          console.error('Détails erreur:', JSON.stringify(error, null, 2));
          return NextResponse.json({ error: `Impossible de déterminer la date de fin de période: ${error instanceof Error ? error.message : 'Erreur inconnue'}` }, { status: 400 });
        }
      }

      const periodEnd = new Date(currentPeriodEnd);
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
