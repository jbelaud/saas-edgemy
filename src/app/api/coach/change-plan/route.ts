import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * POST /api/coach/change-plan
 * Change le plan du coach avec validation des règles métier
 *
 * RÈGLES:
 * - PRO annuel → LITE: Attendre fin période
 * - PRO mensuel → LITE: Attendre fin période
 * - LITE annuel → PRO: Upgrade immédiat avec prorata
 * - LITE mensuel → PRO: Upgrade immédiat avec prorata
 * - Impossible si réservations futures existent
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { targetPlanKey } = body;

    if (!targetPlanKey || typeof targetPlanKey !== 'string') {
      return NextResponse.json(
        { error: 'targetPlanKey requis' },
        { status: 400 }
      );
    }

    // Vérifier que le plan cible existe
    const targetPlan = await prisma.plan.findUnique({
      where: { key: targetPlanKey },
      select: {
        key: true,
        name: true,
        monthlyPrice: true,
        yearlyPrice: true,
      },
    });

    if (!targetPlan) {
      return NextResponse.json(
        { error: 'Plan cible non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer le coach avec ses infos d'abonnement
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        planKey: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        currentPeriodEnd: true,
        reservations: {
          where: {
            startDate: { gt: new Date() }, // Réservations futures
            status: { in: ['CONFIRMED', 'PENDING'] },
          },
          select: { id: true, startDate: true },
        },
      },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Profil coach non trouvé' }, { status: 404 });
    }

    const currentPlanKey = coach.planKey || 'PRO';

    // Si déjà sur le plan cible
    if (currentPlanKey === targetPlanKey) {
      return NextResponse.json(
        { error: 'Vous êtes déjà sur ce plan' },
        { status: 400 }
      );
    }

    // RÈGLE: Impossible de changer si réservations futures
    if (coach.reservations.length > 0) {
      return NextResponse.json(
        {
          error: 'Impossible de changer de plan avec des réservations futures',
          futureReservationsCount: coach.reservations.length,
          nextReservationDate: coach.reservations[0].startDate,
        },
        { status: 400 }
      );
    }

    const isDowngrade = currentPlanKey === 'PRO' && targetPlanKey === 'LITE';
    const isUpgrade = currentPlanKey === 'LITE' && targetPlanKey === 'PRO';
    const isAnnual = coach.subscriptionPlan === 'YEARLY';
    const isMonthly = coach.subscriptionPlan === 'MONTHLY';

    // ========================================================================
    // DOWNGRADE: PRO → LITE
    // ========================================================================
    if (isDowngrade) {
      const currentPeriodEnd = coach.currentPeriodEnd;

      if (!currentPeriodEnd) {
        // Pas d'abonnement actif, changement immédiat possible
        await prisma.coach.update({
          where: { id: coach.id },
          data: { planKey: targetPlanKey },
        });

        console.log(`✅ Coach ${coach.id} passé de PRO à LITE (pas d'abonnement actif)`);

        return NextResponse.json({
          success: true,
          message: 'Plan changé vers LITE avec succès',
          planKey: targetPlanKey,
          effectiveDate: new Date().toISOString(),
        });
      }

      // Avec abonnement actif : attendre la fin de période
      const daysRemaining = Math.ceil(
        (currentPeriodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return NextResponse.json(
        {
          error: 'Vous devez attendre la fin de votre période d\'abonnement',
          currentPlanKey,
          targetPlanKey,
          subscriptionPlan: coach.subscriptionPlan,
          currentPeriodEnd: currentPeriodEnd.toISOString(),
          daysRemaining,
          message: isAnnual
            ? 'Votre abonnement annuel PRO doit se terminer avant de passer à LITE'
            : 'Votre abonnement mensuel PRO doit se terminer avant de passer à LITE',
        },
        { status: 400 }
      );
    }

    // ========================================================================
    // UPGRADE: LITE → PRO
    // ========================================================================
    if (isUpgrade) {
      // Calculer le prorata (si abonnement actif)
      let prorataAmount = 0;

      if (coach.currentPeriodEnd && coach.currentPeriodEnd > new Date()) {
        const now = Date.now();
        const periodEnd = coach.currentPeriodEnd.getTime();
        const daysRemaining = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));

        // Calculer le prorata selon le type d'abonnement
        if (isAnnual) {
          // LITE annuel → PRO: Prorata sur 365 jours
          const litePricePerDay = targetPlan.yearlyPrice / 365;
          prorataAmount = Math.round(litePricePerDay * daysRemaining);
        } else if (isMonthly) {
          // LITE mensuel → PRO: Prorata sur 30 jours
          const litePricePerDay = targetPlan.monthlyPrice / 30;
          prorataAmount = Math.round(litePricePerDay * daysRemaining);
        }

        console.log(
          `💰 Prorata calculé: ${prorataAmount / 100}€ pour ${daysRemaining} jours restants`
        );
      }

      // Mettre à jour le plan immédiatement
      await prisma.coach.update({
        where: { id: coach.id },
        data: {
          planKey: targetPlanKey,
          // TODO: Gérer le prorata avec Stripe ici
          // stripeSubscriptionId devra être mis à jour
        },
      });

      console.log(`✅ Coach ${coach.id} upgradé de LITE à PRO (prorata: ${prorataAmount / 100}€)`);

      return NextResponse.json({
        success: true,
        message: 'Plan upgradé vers PRO avec succès',
        planKey: targetPlanKey,
        effectiveDate: new Date().toISOString(),
        prorataAmount,
        prorataMessage:
          prorataAmount > 0
            ? `Un prorata de ${(prorataAmount / 100).toFixed(2)}€ sera facturé pour la période restante`
            : null,
      });
    }

    // ========================================================================
    // Autres cas non supportés
    // ========================================================================
    return NextResponse.json(
      {
        error: 'Changement de plan non supporté',
        currentPlanKey,
        targetPlanKey,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('❌ Erreur changement de plan:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Unknown',
      },
      { status: 500 }
    );
  }
}
