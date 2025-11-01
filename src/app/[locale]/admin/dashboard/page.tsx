import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { DashboardStats } from "@/components/admin/dashboard/DashboardStats";
import { SessionsChart } from "@/components/admin/dashboard/SessionsChart";
import { RecentReservations } from "@/components/admin/dashboard/RecentReservations";
import { RevenueOverview } from "@/components/admin/dashboard/RevenueOverview";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const [
    totalCoaches,
    totalPlayers,
    totalReservations,
    todayReservations,
    pendingPayments,
    recentReservations,
    last14DaysReservations,
    coaches,
    paidReservations,
    coachingPackages,
  ] = await Promise.all([
    // Total coachs actifs
    prisma.coach.count({
      where: { status: "ACTIVE" },
    }),

    // Total joueurs
    prisma.player.count(),

    // Total réservations
    prisma.reservation.count(),

    // Réservations aujourd'hui
    prisma.reservation.count({
      where: {
        startDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),

    // Paiements en attente
    prisma.reservation.count({
      where: {
        paymentStatus: "PENDING",
      },
    }),

    // 10 dernières réservations
    prisma.reservation.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        player: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        coach: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        announcement: {
          select: {
            title: true,
          },
        },
      },
    }),

    // Réservations des 14 derniers jours pour le graphique
    prisma.reservation.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    }),

    // Données pour les revenus
    prisma.coach.findMany({
      select: {
        subscriptionId: true,
      },
    }),

    prisma.reservation.findMany({
      where: {
        paymentStatus: "PAID",
      },
      select: {
        priceCents: true,
        pack: {
          select: {
            hours: true,
          },
        },
      },
    }),

    prisma.coachingPackage.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        priceCents: true,
      },
    }),
  ]);

  // Calculer les stats de revenus
  const monthlySubscriptions = coaches.filter((c) =>
    c.subscriptionId?.includes("monthly")
  ).length;
  const annualSubscriptions = coaches.filter((c) =>
    c.subscriptionId?.includes("annual")
  ).length;

  let totalCommissionsSessions = 0;
  let totalCommissionsPacks = 0;

  paidReservations.forEach((reservation) => {
    if (reservation.pack) {
      const commission = 300 + reservation.priceCents * 0.02;
      totalCommissionsPacks += commission;
    } else {
      const commission = reservation.priceCents * 0.05;
      totalCommissionsSessions += commission;
    }
  });

  coachingPackages.forEach((pack) => {
    const commission = 300 + pack.priceCents * 0.02;
    totalCommissionsPacks += commission;
  });

  return {
    totalCoaches,
    totalPlayers,
    totalReservations,
    todayReservations,
    pendingPayments,
    recentReservations,
    last14DaysReservations,
    revenueData: {
      monthlySubscriptions,
      annualSubscriptions,
      totalCommissionsSessions: totalCommissionsSessions / 100,
      totalCommissionsPacks: totalCommissionsPacks / 100,
    },
  };
}

export default async function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Vue d&apos;ensemble de la plateforme Edgemy
        </p>
      </div>

      {/* Statistiques principales */}
      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        }
      >
        <DashboardStatsWrapper />
      </Suspense>

      {/* Récap des revenus */}
      <Suspense fallback={<Skeleton className="h-48 rounded-2xl" />}>
        <RevenueOverviewWrapper />
      </Suspense>

      {/* Graphique des sessions */}
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <SessionsChartWrapper />
      </Suspense>

      {/* Réservations récentes */}
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <RecentReservationsWrapper />
      </Suspense>
    </div>
  );
}

async function DashboardStatsWrapper() {
  const data = await getDashboardData();
  return <DashboardStats data={data} />;
}

async function RevenueOverviewWrapper() {
  const data = await getDashboardData();
  return <RevenueOverview data={data.revenueData} />;
}

async function SessionsChartWrapper() {
  const data = await getDashboardData();
  return <SessionsChart data={data.last14DaysReservations} />;
}

async function RecentReservationsWrapper() {
  const data = await getDashboardData();
  return <RecentReservations reservations={data.recentReservations} />;
}
