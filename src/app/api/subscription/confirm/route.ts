import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

/**
 * POST /api/subscription/confirm
 * Confirmer immédiatement l'abonnement au retour de Stripe
 * (avant que le webhook n'arrive)
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { sessionId } = await request.json();

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID requis' },
        { status: 400 }
      );
    }

    // Récupérer la session Stripe pour vérifier le paiement
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Paiement non confirmé' },
        { status: 400 }
      );
    }

    const coachId = stripeSession.metadata?.coachId;
    const planKey = (stripeSession.metadata?.planKey as 'PRO' | 'LITE') || 'PRO';
    const plan = (stripeSession.metadata?.plan as 'MONTHLY' | 'YEARLY') || 'MONTHLY';

    if (!coachId) {
      return NextResponse.json(
        { error: 'Coach ID manquant dans la session' },
        { status: 400 }
      );
    }

    // Vérifier que le coach appartient bien à l'utilisateur connecté
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach || coach.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Coach non autorisé' },
        { status: 403 }
      );
    }

    // Si l'abonnement est déjà actif, ne rien faire
    if (coach.subscriptionStatus === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        message: 'Abonnement déjà actif',
        planKey: coach.planKey,
      });
    }

    // Activer immédiatement l'abonnement
    // Le webhook le confirmera plus tard avec l'ID d'abonnement Stripe
    await prisma.coach.update({
      where: { id: coachId },
      data: {
        planKey: planKey,
        subscriptionPlan: plan,
        subscriptionStatus: 'ACTIVE',
      },
    });

    console.log(`✅ Abonnement ${planKey} ${plan} confirmé immédiatement pour le coach ${coachId}`);

    return NextResponse.json({
      success: true,
      message: `Abonnement ${planKey} activé avec succès`,
      planKey,
    });

  } catch (error) {
    console.error('Erreur confirmation abonnement:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la confirmation' },
      { status: 500 }
    );
  }
}
