"use client";

import { useMemo } from "react";
import { AdminGlassCard } from "@/components/admin/ui/AdminGlassCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp } from "lucide-react";

interface SessionsChartProps {
  data: Array<{
    createdAt: Date;
    status: string;
  }>;
}

export function SessionsChart({ data }: SessionsChartProps) {
  const chartData = useMemo(() => {
    // Créer un objet avec les 14 derniers jours
    const last14Days = Array.from({ length: 14 }, (_, i) => {
      const date = subDays(new Date(), 13 - i);
      return {
        date: format(date, "yyyy-MM-dd"),
        label: format(date, "dd MMM", { locale: fr }),
        count: 0,
      };
    });

    // Compter les réservations par jour
    data.forEach((reservation) => {
      const dateStr = format(new Date(reservation.createdAt), "yyyy-MM-dd");
      const dayData = last14Days.find((d) => d.date === dateStr);
      if (dayData) {
        dayData.count++;
      }
    });

    return last14Days;
  }, [data]);

  return (
    <AdminGlassCard
      title="Sessions des 14 derniers jours"
      description="Évolution du nombre de réservations"
      icon={<TrendingUp className="h-6 w-6" />}
    >
      <div className="mt-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="label"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.7)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "12px",
                color: "#fff",
              }}
            />
            <Bar
              dataKey="count"
              fill="url(#colorGradient)"
              radius={[8, 8, 0, 0]}
            />
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9333EA" stopOpacity={1} />
                <stop offset="100%" stopColor="#EC4899" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminGlassCard>
  );
}
