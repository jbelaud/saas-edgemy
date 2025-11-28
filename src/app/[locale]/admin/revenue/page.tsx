import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { RevenueStats } from "@/components/admin/revenue/RevenueStats";
import { SubscriptionChart } from "@/components/admin/revenue/SubscriptionChart";
import { CommissionsTable } from "@/components/admin/revenue/CommissionsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getRevenueData() {
  // Récupérer tous les coachs avec leurs abonnements
  const coaches = await prisma.coach.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      subscriptionId: true,
      createdAt: true,
    },
  });

  // Récupérer toutes les réservations payées pour calculer les commissions
  const paidReservations = await prisma.reservation.findMany({
    where: {
      paymentStatus: "PAID",
    },
    select: {
      id: true,
      priceCents: true,
      coachNetCents: true,
      coachEarningsCents: true,
      stripeFeeCents: true,
      edgemyFeeCents: true,
      serviceFeeCents: true,
      edgemyRevenueHT: true,
      edgemyRevenueTVACents: true,
      type: true,
      createdAt: true,
      pack: {
        select: {
          hours: true,
        },
      },
      player: {
        select: {
          name: true,
          email: true,
        },
      },
      coach: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Récupérer tous les packs de coaching pour les commissions sur packs
  const coachingPackages = await prisma.coachingPackage.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      priceCents: true,
      coachNetCents: true,
      coachEarningsCents: true,
      stripeFeeCents: true,
      edgemyFeeCents: true,
      serviceFeeCents: true,
      totalHours: true,
      createdAt: true,
      player: {
        select: {
          name: true,
          email: true,
        },
      },
      coach: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Calculer les stats des abonnements coachs
  const monthlySubscriptions = coaches.filter((c) =>
    c.subscriptionId?.includes("monthly")
  ).length;
  const annualSubscriptions = coaches.filter((c) =>
    c.subscriptionId?.includes("annual")
  ).length;

  // Calculer les marges Edgemy (6.5% uniforme - frais Stripe)
  let totalEdgemyMarginCents = 0;
  let totalStripeFeeCents = 0;
  let totalEdgemyRevenueHT = 0;
  let totalEdgemyRevenueTVACents = 0;

  paidReservations.forEach((reservation) => {
    // Utiliser les champs déjà calculés dans la DB
    totalEdgemyMarginCents += reservation.edgemyFeeCents || 0;
    totalStripeFeeCents += reservation.stripeFeeCents || 0;
    totalEdgemyRevenueHT += reservation.edgemyRevenueHT || 0;
    totalEdgemyRevenueTVACents += reservation.edgemyRevenueTVACents || 0;
  });

  // Marges sur les packs de coaching
  coachingPackages.forEach((pack) => {
    totalEdgemyMarginCents += pack.edgemyFeeCents || 0;
    totalStripeFeeCents += pack.stripeFeeCents || 0;
  });

  return {
    coaches,
    monthlySubscriptions,
    annualSubscriptions,
    totalEdgemyMargin: totalEdgemyMarginCents / 100, // Convertir en euros
    totalStripeFees: totalStripeFeeCents / 100,
    totalEdgemyRevenueHT: totalEdgemyRevenueHT / 100,
    totalEdgemyRevenueTVA: totalEdgemyRevenueTVACents / 100,
    paidReservations,
    coachingPackages,
  };
}

export default async function AdminRevenuePage() {
  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Revenus & Analytics</h1>
          <p className="text-sm text-gray-400">
            Abonnements des coachs et commissions sur les sessions
          </p>
        </div>
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
        <RevenueStatsWrapper />
      </Suspense>

      {/* Graphique Abonnements Coachs */}
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <SubscriptionChartWrapper />
      </Suspense>

      {/* Détail des commissions */}
      <Suspense fallback={<Skeleton className="h-96 rounded-2xl" />}>
        <CommissionsTableWrapper />
      </Suspense>
    </div>
  );
}

async function RevenueStatsWrapper() {
  const data = await getRevenueData();
  return <RevenueStats data={data} />;
}

async function SubscriptionChartWrapper() {
  const data = await getRevenueData();
  return <SubscriptionChart data={data} />;
}

async function CommissionsTableWrapper() {
  const data = await getRevenueData();
  return <CommissionsTable data={data} />;
}
