import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

// Prix du plan LITE
const LITE_PRICES = {
  MONTHLY: 15,
  YEARLY: 149,
};

/**
 * POST /api/coach/subscription/activate-lite
 *
 * Active manuellement le plan LITE pour un coach
 * (pas de Stripe Billing - paiement manuel via Wise/Revolut/USDT)
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { paymentMethod, billingPeriod } = await req.json() as {
      paymentMethod?: string; // 'WISE' | 'REVOLUT' | 'USDT' | 'BANK_TRANSFER'
      billingPeriod?: 'MONTHLY' | 'YEARLY';
    };

    const selectedPeriod = billingPeriod || 'MONTHLY';
    const price = LITE_PRICES[selectedPeriod];

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Profil coach non trouvé' }, { status: 404 });
    }

    // Vérifier si déjà un abonnement actif PRO
    if (coach.subscriptionStatus === 'ACTIVE' && coach.planKey === 'PRO') {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement PRO actif. Annulez-le d\'abord pour passer au plan LITE.' },
        { status: 400 }
      );
    }

    // Calculer la date de fin de période (pour info)
    const now = new Date();
    const periodEnd = new Date(now);
    if (selectedPeriod === 'YEARLY') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Activer le plan LITE
    // IMPORTANT: L'admin doit confirmer le paiement manuellement
    await prisma.coach.update({
      where: { id: coach.id },
      data: {
        planKey: 'LITE',
        subscriptionStatus: 'TRIALING', // En attente de confirmation paiement
        subscriptionPlan: selectedPeriod,
        paymentPreferences: paymentMethod ? [paymentMethod] : coach.paymentPreferences,
        currentPeriodEnd: periodEnd, // Date indicative
      },
    });

    console.log(`✅ Plan LITE ${selectedPeriod} activé pour coach ${coach.id} - En attente confirmation paiement (${price}€)`);

    return NextResponse.json({
      success: true,
      message: `Plan LITE ${selectedPeriod === 'YEARLY' ? 'annuel' : 'mensuel'} activé. Un administrateur validera votre paiement sous 24h.`,
      planKey: 'LITE',
      billingPeriod: selectedPeriod,
      price,
      status: 'TRIALING',
      paymentInstructions: {
        wise: `Envoyez ${price}€ à contact@edgemy.fr avec la référence LITE-${coach.id}`,
        revolut: `Envoyez ${price}€ à @edgemy avec la référence LITE-${coach.id}`,
        usdt: `Envoyez l'équivalent de ${price}€ en USDT à [adresse] avec la référence LITE-${coach.id}`,
        bankTransfer: `Virement bancaire: IBAN FR76... BIC CEPAFRPP. Référence: LITE-${coach.id}`,
      }
    });
  } catch (err) {
    console.error('❌ Erreur activation plan LITE:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'activation du plan LITE',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
