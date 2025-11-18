import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

/**
 * GET /api/admin/finance/report?month=YYYY-MM
 *
 * Génère un rapport comptable mensuel pour Edgemy
 * (réservé aux admins)
 *
 * Retourne :
 * - Revenu Edgemy HT total
 * - TVA Edgemy totale
 * - CA Edgemy TTC total
 * - Frais Stripe totaux
 * - Payouts coachs totaux
 * - Nombre de transactions
 */
export async function GET(req: Request) {
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

    // Récupérer le mois demandé (format YYYY-MM)
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get('month');

    if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json(
        { error: 'Format de mois invalide. Utilisez YYYY-MM' },
        { status: 400 }
      );
    }

    const [year, month] = monthParam.split('-').map(Number);

    // Calculer les dates de début et fin du mois
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    console.log(`📊 Génération rapport financier ${monthParam}`);
    console.log(`   Du ${startDate.toISOString()} au ${endDate.toISOString()}`);

    // Agréger les données de réservations payées
    const reservationsStats = await prisma.reservation.aggregate({
      where: {
        paymentStatus: 'PAID',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        priceCents: true,            // Prix coachs (base)
        serviceFeeCents: true,       // Frais totaux joueurs
        stripeFeeCents: true,        // Frais Stripe
        edgemyFeeCents: true,        // Marge Edgemy nette
        edgemyRevenueHT: true,       // Revenu Edgemy HT
        edgemyRevenueTVACents: true, // TVA Edgemy
        coachNetCents: true,         // Total payé aux coachs
      },
      _count: {
        id: true,
      },
    });

    // Agréger les transfers effectués
    const transfersStats = await prisma.transferLog.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: 'paid',
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Agréger les abonnements coach payés
    const subscriptionsStats = await prisma.coach.findMany({
      where: {
        subscriptionStatus: 'ACTIVE',
        currentPeriodEnd: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        planKey: true,
        subscriptionPlan: true,
      },
    });

    // Calculer revenus abonnements (simplif ié - à affiner avec Stripe invoices)
    const subscriptionRevenue = subscriptionsStats.reduce((sum, coach) => {
      if (coach.planKey === 'PRO') {
        return sum + (coach.subscriptionPlan === 'MONTHLY' ? 3900 : 39900);
      } else if (coach.planKey === 'LITE') {
        return sum + (coach.subscriptionPlan === 'MONTHLY' ? 1500 : 14900);
      }
      return sum;
    }, 0);

    // Construire le rapport
    const report = {
      period: {
        month: monthParam,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      reservations: {
        count: reservationsStats._count.id,
        totalCoachEarnings: (reservationsStats._sum.coachNetCents ?? 0) / 100,
        totalServiceFees: (reservationsStats._sum.serviceFeeCents ?? 0) / 100,
        totalStripeFees: (reservationsStats._sum.stripeFeeCents ?? 0) / 100,
        edgemyRevenueHT: (reservationsStats._sum.edgemyRevenueHT ?? 0) / 100,
        edgemyRevenueTVA: (reservationsStats._sum.edgemyRevenueTVACents ?? 0) / 100,
        edgemyRevenueTTC: ((reservationsStats._sum.edgemyRevenueHT ?? 0) + (reservationsStats._sum.edgemyRevenueTVACents ?? 0)) / 100,
      },
      transfers: {
        count: transfersStats._count.id,
        totalAmount: (transfersStats._sum.amount ?? 0) / 100,
      },
      subscriptions: {
        count: subscriptionsStats.length,
        revenue: subscriptionRevenue / 100,
        breakdown: {
          PRO: subscriptionsStats.filter(c => c.planKey === 'PRO').length,
          LITE: subscriptionsStats.filter(c => c.planKey === 'LITE').length,
        },
      },
      summary: {
        totalEdgemyRevenueHT: ((reservationsStats._sum.edgemyRevenueHT ?? 0) + subscriptionRevenue) / 100,
        totalEdgemyRevenueTVA: (reservationsStats._sum.edgemyRevenueTVACents ?? 0) / 100,
        totalEdgemyRevenueTTC: ((reservationsStats._sum.edgemyRevenueHT ?? 0) + (reservationsStats._sum.edgemyRevenueTVACents ?? 0) + subscriptionRevenue) / 100,
        totalStripeFees: (reservationsStats._sum.stripeFeeCents ?? 0) / 100,
        totalCoachPayouts: (reservationsStats._sum.coachNetCents ?? 0) / 100,
      },
    };

    console.log(`✅ Rapport généré: ${report.reservations.count} transactions`);

    return NextResponse.json(report);
  } catch (err) {
    console.error('❌ Erreur génération rapport:', err);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération du rapport',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
