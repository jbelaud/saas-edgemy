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

    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        subscriptionId: true,
        subscriptionStatus: true,
      },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    if (!coach.subscriptionId) {
      return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 });
    }

    // Annuler l'abonnement sur Stripe à la fin de la période
    // cancel_at_period_end = true permet de garder l'accès jusqu'à la fin de la période payée
    const subscription = await stripe.subscriptions.update(coach.subscriptionId, {
      cancel_at_period_end: true,
    });

    console.log(`✅ Abonnement ${coach.subscriptionId} annulé à la fin de période pour le coach ${coach.id}`);

    return NextResponse.json({
      success: true,
      message: 'Abonnement annulé avec succès',
      cancelAt: subscription.cancel_at,
    });
  } catch (error) {
    console.error('Erreur annulation abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'abonnement' },
      { status: 500 }
    );
  }
}
