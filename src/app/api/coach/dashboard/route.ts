import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

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

    console.log('Coach profile found:', coach.id, 'Status:', coach.status);

    // Calculer les stats
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const completedReservations = coach.reservations.filter(
      (r) => r.status === 'COMPLETED'
    );

    const recentReservations = completedReservations.filter(
      (r) => r.createdAt >= sixMonthsAgo
    );

    const totalRevenue = completedReservations.reduce(
      (sum, r) => sum + r.priceCents,
      0
    );

    const monthlyRevenue = recentReservations.reduce(
      (sum, r) => sum + r.priceCents,
      0
    );

    const totalHours = completedReservations.reduce((sum, r) => {
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
    const monthlyRevenueData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

      const monthRevenue = completedReservations
        .filter((r) => r.createdAt >= monthStart && r.createdAt <= monthEnd)
        .reduce((sum, r) => sum + r.priceCents, 0);

      monthlyRevenueData.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue / 100, // Convertir en euros
      });
    }

    const stats = {
      totalRevenue: totalRevenue / 100,
      monthlyRevenue: monthlyRevenue / 100,
      totalReservations: completedReservations.length,
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
