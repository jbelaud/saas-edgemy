import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        planKey: true,
        currentPeriodEnd: true,
        subscriptionId: true,
      },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    // Récupérer les infos détaillées depuis Stripe si on a un subscriptionId
    let cancelAtPeriodEnd = false;
    let cancelAt = null;
    let currentPeriodEnd = coach.currentPeriodEnd;

    if (coach.subscriptionId && coach.subscriptionStatus === 'ACTIVE') {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(coach.subscriptionId);
        const subscriptionData = stripeSubscription as unknown as {
          cancel_at_period_end?: boolean;
          cancel_at?: number;
          current_period_end?: number;
        };
        cancelAtPeriodEnd = subscriptionData.cancel_at_period_end || false;
        cancelAt = subscriptionData.cancel_at ? new Date(subscriptionData.cancel_at * 1000) : null;

        // Si currentPeriodEnd est null en BDD, on le synchronise depuis Stripe
        if (!currentPeriodEnd && subscriptionData.current_period_end) {
          currentPeriodEnd = new Date(subscriptionData.current_period_end * 1000);

          // Mettre à jour la BDD
          await prisma.coach.update({
            where: { id: coach.id },
            data: { currentPeriodEnd },
          });

          console.log(`✅ currentPeriodEnd synchronisé depuis Stripe pour le coach ${coach.id}: ${currentPeriodEnd}`);
        }
      } catch (error) {
        console.error('Erreur récupération détails Stripe:', error);
        // On continue sans ces infos si erreur
      }
    }

    return NextResponse.json({
      subscriptionStatus: coach.subscriptionStatus,
      subscriptionPlan: coach.subscriptionPlan,
      planKey: coach.planKey,
      currentPeriodEnd: currentPeriodEnd,
      subscriptionId: coach.subscriptionId,
      cancelAtPeriodEnd,
      cancelAt,
    });
  } catch (error) {
    console.error('Erreur récupération abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
