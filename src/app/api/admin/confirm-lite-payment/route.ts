import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * POST /api/admin/confirm-lite-payment
 *
 * Confirme le paiement manuel d'un abonnement LITE
 * (réservé aux admins)
 */
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Accès interdit - Admin uniquement' }, { status: 403 });
    }

    const { coachId, plan, confirmed } = await req.json() as {
      coachId: string;
      plan: 'MONTHLY' | 'YEARLY';
      confirmed: boolean;
    };

    // Récupérer le coach
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach non trouvé' }, { status: 404 });
    }

    if (coach.planKey !== 'LITE') {
      return NextResponse.json({ error: 'Ce coach n\'est pas sur le plan LITE' }, { status: 400 });
    }

    if (confirmed) {
      // Calculer la date de fin de période
      const currentPeriodEnd = new Date();
      if (plan === 'MONTHLY') {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      // Activer l'abonnement
      await prisma.coach.update({
        where: { id: coachId },
        data: {
          subscriptionStatus: 'ACTIVE',
          subscriptionPlan: plan,
          currentPeriodEnd,
        },
      });

      console.log(`✅ Paiement LITE confirmé pour coach ${coachId} (${plan})`);

      return NextResponse.json({
        success: true,
        message: 'Paiement confirmé, abonnement LITE activé',
        planKey: 'LITE',
        plan,
        currentPeriodEnd,
      });
    } else {
      // Refuser le paiement
      await prisma.coach.update({
        where: { id: coachId },
        data: {
          subscriptionStatus: 'CANCELED',
          planKey: 'PRO', // Revenir au plan PRO par défaut
        },
      });

      console.log(`❌ Paiement LITE refusé pour coach ${coachId}`);

      return NextResponse.json({
        success: true,
        message: 'Paiement refusé',
      });
    }
  } catch (err) {
    console.error('❌ Erreur confirmation paiement LITE:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de la confirmation du paiement',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
