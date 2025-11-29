import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { checkAndExpireFreeTrial } from '@/lib/checkTrialExpiration';

export async function GET() {
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

    console.log('Fetching coach dashboard for user:', session.user.id);

    // Récupérer le profil coach
    const coach = await prisma.coach.findUnique({
      where: { userId: session.user.id },
      include: {
        announcements: true,
        availabilities: true,
        reservations: {
          include: {
            player: {
              select: {
                name: true,
                email: true,
              },
            },
            announcement: {
              select: {
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!coach) {
      console.log('Coach profile not found for user:', session.user.id);
      return NextResponse.json(
        { error: 'Profil coach non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier et expirer l'essai gratuit si nécessaire
    const trialUpdate = await checkAndExpireFreeTrial(coach.id);
    if (trialUpdate) {
      // Mettre à jour l'objet coach en mémoire avec le nouveau statut
      coach.subscriptionStatus = trialUpdate.subscriptionStatus;
    }

    console.log('Coach profile found:', coach.id, 'Status:', coach.status);

    // Calculer les stats
    const now = new Date();

    // Sessions comptabilisées pour les revenus :
    // - Status COMPLETED (session terminée et validée)
    // - OU status CONFIRMED avec paymentStatus PAID et endDate passée (session terminée mais pas encore validée)
    const paidCompletedReservations = coach.reservations.filter(
      (r) => r.status === 'COMPLETED' ||
        (r.status === 'CONFIRMED' && r.paymentStatus === 'PAID' && r.endDate < now)
    );

    const totalRevenue = paidCompletedReservations.reduce(
      (sum, r) => sum + (r.coachNetCents || r.coachEarningsCents || r.priceCents),
      0
    );

    // Revenu du mois en cours
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyRevenue = paidCompletedReservations
      .filter((r) => r.endDate >= currentMonthStart)
      .reduce(
        (sum, r) => sum + (r.coachNetCents || r.coachEarningsCents || r.priceCents),
        0
      );

    const totalHours = paidCompletedReservations.reduce((sum, r) => {
      const duration = (r.endDate.getTime() - r.startDate.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);

    const pendingReservations = coach.reservations.filter(
      (r) => r.status === 'PENDING'
    ).length;

    const upcomingReservations = coach.reservations.filter(
      (r) => r.status === 'CONFIRMED' && r.startDate > now
    );

    // Revenus mensuels pour le graphique (6 derniers mois)
    // Utilise endDate (date de la session) au lieu de createdAt
    const monthlyRevenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const monthRevenue = paidCompletedReservations
        .filter((r) => r.endDate >= monthStart && r.endDate <= monthEnd)
        .reduce((sum, r) => sum + (r.coachNetCents || r.coachEarningsCents || r.priceCents), 0);

      monthlyRevenueData.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue / 100, // Convertir en euros
      });
    }

    const stats = {
      totalRevenue: totalRevenue / 100,
      monthlyRevenue: monthlyRevenue / 100,
      totalReservations: paidCompletedReservations.length,
      totalHours: Math.round(totalHours * 10) / 10,
      pendingReservations,
      upcomingReservations: upcomingReservations.length,
      activeAnnouncements: coach.announcements.filter((a) => a.isActive).length,
      monthlyRevenueData,
    };

    return NextResponse.json({
      coach,
      stats,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du dashboard:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
