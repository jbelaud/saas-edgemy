"use client";

import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Calendar } from "lucide-react";

interface SubscriptionChartProps {
  data: {
    monthlySubscriptions: number;
    annualSubscriptions: number;
  };
}

const COLORS = ["#3B82F6", "#8B5CF6"]; // Blue for monthly, Purple for annual

export function SubscriptionChart({ data }: SubscriptionChartProps) {
  const chartData = [
    { name: "Mensuels", value: data.monthlySubscriptions },
    { name: "Annuels", value: data.annualSubscriptions },
  ];

  const total = data.monthlySubscriptions + data.annualSubscriptions;

  return (
    <AdminGlassCard
      title="Répartition des Abonnements Coachs"
      description="Comparaison entre abonnements mensuels et annuels"
      icon={<Calendar className="h-6 w-6" />}
    >
      <div className="mt-4">
        {total === 0 ? (
          <div className="py-12 text-center text-gray-400">
            Aucun abonnement coach pour le moment
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8 lg:flex-row">
            {/* Graphique */}
            <div className="h-80 w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "12px",
                      color: "#fff",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#fff" }}
                    formatter={(value) => (
                      <span style={{ color: "#fff" }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Stats détaillées */}
            <div className="flex-1 space-y-4">
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-300">Abonnements Mensuels</p>
                    <p className="mt-1 text-3xl font-bold text-white">
                      {data.monthlySubscriptions}
                    </p>
                  </div>
                  <div className="text-4xl">📅</div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    style={{
                      width: `${total > 0 ? (data.monthlySubscriptions / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {total > 0
                    ? `${((data.monthlySubscriptions / total) * 100).toFixed(1)}% du total`
                    : "0%"}
                </p>
              </div>

              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-300">Abonnements Annuels</p>
                    <p className="mt-1 text-3xl font-bold text-white">
                      {data.annualSubscriptions}
                    </p>
                  </div>
                  <div className="text-4xl">📆</div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    style={{
                      width: `${total > 0 ? (data.annualSubscriptions / total) * 100 : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  {total > 0
                    ? `${((data.annualSubscriptions / total) * 100).toFixed(1)}% du total`
                    : "0%"}
                </p>
              </div>

              <div className="rounded-xl border border-white/20 bg-white/5 p-4">
                <p className="text-sm text-gray-400">Total Abonnements Actifs</p>
                <p className="mt-1 text-2xl font-bold text-white">{total}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {data.annualSubscriptions > data.monthlySubscriptions
                    ? "Les abonnements annuels sont plus populaires 🎯"
                    : data.monthlySubscriptions > data.annualSubscriptions
                      ? "Les abonnements mensuels sont plus populaires 📊"
                      : "Égalité entre mensuels et annuels ⚖️"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminGlassCard>
  );
}
