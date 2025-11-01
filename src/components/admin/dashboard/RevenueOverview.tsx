"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, DollarSign, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface RevenueOverviewProps {
  data: {
    monthlySubscriptions: number;
    annualSubscriptions: number;
    totalCommissionsSessions: number;
    totalCommissionsPacks: number;
  };
}

export function RevenueOverview({ data }: RevenueOverviewProps) {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'fr';

  const totalCommissions =
    data.totalCommissionsSessions + data.totalCommissionsPacks;
  const totalSubscriptions = data.monthlySubscriptions + data.annualSubscriptions;

  return (
    <AdminGlassCard className="relative overflow-hidden border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
      {/* Effet de glow */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Récap Revenus</h3>
              <p className="text-sm text-gray-400">
                Abonnements & Commissions Phase 1
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-purple-300 hover:text-purple-200 hover:bg-purple-500/20"
            asChild
          >
            <Link href={`/${locale}/admin/revenue`}>
              Voir détails
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Commissions */}
          <div className="rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <DollarSign className="h-4 w-4" />
              <span>Total Commissions</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {totalCommissions.toFixed(2)} €
            </p>
            <p className="mt-1 text-xs text-purple-300">
              Sessions + Packs
            </p>
          </div>

          {/* Sessions (5%) */}
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Package className="h-4 w-4" />
              <span>Sessions (5%)</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {data.totalCommissionsSessions.toFixed(2)} €
            </p>
            <p className="mt-1 text-xs text-green-300">
              Sessions uniques
            </p>
          </div>

          {/* Packs (3€ + 2%) */}
          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
            <div className="flex items-center gap-2 text-sm text-orange-400">
              <Package className="h-4 w-4" />
              <span>Packs (3€ + 2%)</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {data.totalCommissionsPacks.toFixed(2)} €
            </p>
            <p className="mt-1 text-xs text-orange-300">
              Packs horaires
            </p>
          </div>

          {/* Abonnements Coachs */}
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <div className="flex items-center gap-2 text-sm text-blue-400">
              <Calendar className="h-4 w-4" />
              <span>Abonnements</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-white">
              {totalSubscriptions}
            </p>
            <p className="mt-1 text-xs text-blue-300">
              {data.monthlySubscriptions}M / {data.annualSubscriptions}A
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">ℹ️</span>
            <p className="text-xs text-yellow-200">
              <span className="font-semibold">Phase 1 :</span> Données basées sur les
              statuts PAID en DB. Stripe non intégré.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="shrink-0 text-yellow-200 hover:text-yellow-100 hover:bg-yellow-500/20"
            asChild
          >
            <Link href={`/${locale}/admin/revenue`}>
              Analytics →
            </Link>
          </Button>
        </div>
      </div>
    </AdminGlassCard>
  );
}
