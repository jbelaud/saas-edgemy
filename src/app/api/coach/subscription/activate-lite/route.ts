import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

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

    const { paymentMethod } = await req.json() as {
      paymentMethod?: string; // 'WISE' | 'REVOLUT' | 'USDT' | 'BANK_TRANSFER'
    };

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Profil coach non trouvé' }, { status: 404 });
    }

    // Vérifier si déjà un abonnement actif
    if (coach.subscriptionStatus === 'ACTIVE' && coach.planKey !== 'LITE') {
      return NextResponse.json(
        { error: 'Vous avez déjà un abonnement actif. Annulez-le d\'abord pour passer au plan LITE.' },
        { status: 400 }
      );
    }

    // Activer le plan LITE
    // IMPORTANT: L'admin doit confirmer le paiement manuellement
    await prisma.coach.update({
      where: { id: coach.id },
      data: {
        planKey: 'LITE',
        subscriptionStatus: 'TRIALING', // En attente de confirmation paiement
        subscriptionPlan: 'MONTHLY', // Par défaut mensuel pour LITE
        paymentPreferences: paymentMethod ? [paymentMethod] : coach.paymentPreferences,
      },
    });

    console.log(`✅ Plan LITE activé pour coach ${coach.id} - En attente confirmation paiement`);

    return NextResponse.json({
      success: true,
      message: 'Plan LITE activé. Un administrateur validera votre paiement sous 24h.',
      planKey: 'LITE',
      status: 'TRIALING',
      paymentInstructions: {
        wise: 'Envoyez 15€ à contact@edgemy.fr avec la référence LITE-' + coach.id,
        revolut: 'Envoyez 15€ à @edgemy avec la référence LITE-' + coach.id,
        usdt: 'Envoyez l\'équivalent de 15€ en USDT à [adresse] avec la référence LITE-' + coach.id,
        bankTransfer: 'Virement bancaire: IBAN FR76... BIC CEPAFRPP. Référence: LITE-' + coach.id,
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
