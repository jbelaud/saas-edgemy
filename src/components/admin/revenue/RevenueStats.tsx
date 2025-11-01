"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Users, Calendar, DollarSign, Package } from "lucide-react";

interface RevenueStatsProps {
  data: {
    monthlySubscriptions: number;
    annualSubscriptions: number;
    totalCommissionsSessions: number;
    totalCommissionsPacks: number;
  };
}

export function RevenueStats({ data }: RevenueStatsProps) {
  const totalCommissions =
    data.totalCommissionsSessions + data.totalCommissionsPacks;
  const totalSubscriptions = data.monthlySubscriptions + data.annualSubscriptions;

  const stats = [
    {
      title: "Abonnements Mensuels",
      value: data.monthlySubscriptions,
      subtitle: `${totalSubscriptions > 0 ? ((data.monthlySubscriptions / totalSubscriptions) * 100).toFixed(0) : 0}% du total`,
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Abonnements Annuels",
      value: data.annualSubscriptions,
      subtitle: `${totalSubscriptions > 0 ? ((data.annualSubscriptions / totalSubscriptions) * 100).toFixed(0) : 0}% du total`,
      icon: <Calendar className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Commissions Sessions (5%)",
      value: `${data.totalCommissionsSessions.toFixed(2)} €`,
      subtitle: "Sessions uniques",
      icon: <DollarSign className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Commissions Packs (3€ + 2%)",
      value: `${data.totalCommissionsPacks.toFixed(2)} €`,
      subtitle: "Packs horaires",
      icon: <Package className="h-6 w-6" />,
      color: "from-orange-500 to-amber-500",
    },
  ];

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <AdminGlassCard key={index} className="relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-400">{stat.title}</p>
                <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                <p className="mt-1 text-xs text-gray-500">{stat.subtitle}</p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
              >
                {stat.icon}
              </div>
            </div>
            {/* Effet de glow */}
            <div
              className={`absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-3xl`}
            />
          </AdminGlassCard>
        ))}
      </div>

      {/* Total des commissions */}
      <AdminGlassCard className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-300">Total Commissions Phase 1</p>
            <p className="mt-2 text-4xl font-bold text-white">
              {totalCommissions.toFixed(2)} €
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Sessions + Packs (Stripe non intégré)
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50">
            <DollarSign className="h-8 w-8 text-white" />
          </div>
        </div>
      </AdminGlassCard>
    </>
  );
}
