"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { Users, UserCheck, Calendar, CreditCard } from "lucide-react";

interface DashboardStatsProps {
  data: {
    totalCoaches: number;
    totalPlayers: number;
    todayReservations: number;
    pendingPayments: number;
  };
}

export function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      title: "Coachs Actifs",
      value: data.totalCoaches,
      icon: <UserCheck className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Joueurs",
      value: data.totalPlayers,
      icon: <Users className="h-6 w-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Sessions Aujourd'hui",
      value: data.todayReservations,
      icon: <Calendar className="h-6 w-6" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Paiements en Attente",
      value: data.pendingPayments,
      icon: <CreditCard className="h-6 w-6" />,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <AdminGlassCard key={index} className="relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">{stat.title}</p>
              <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
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
  );
}
