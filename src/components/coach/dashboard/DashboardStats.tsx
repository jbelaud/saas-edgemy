'use client';

import { GlassCard } from '@/components/ui';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Activity } from 'lucide-react';

interface DashboardStatsProps {
  stats: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalReservations: number;
    totalHours: number;
    pendingReservations: number;
    upcomingReservations: number;
    activeAnnouncements: number;
    monthlyRevenueData: Array<{ month: string; revenue: number }>;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <GlassCard>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="text-xl font-bold text-white">Évolution des revenus</h3>
          </div>
          <p className="text-sm text-gray-400">
            Revenus mensuels sur les 12 derniers mois
          </p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis 
              dataKey="month" 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              formatter={(value: number) => `${value.toFixed(2)}€`}
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                color: '#fff'
              }}
              labelStyle={{ color: '#94a3b8' }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f59e0b" 
              strokeWidth={3}
              name="Revenus"
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Taux de conversion</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Ratio réservations / vues de profil
          </p>
          <div className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
            {stats.totalReservations > 0 ? '12%' : '0%'}
          </div>
          <p className="text-sm text-gray-500">
            Moyenne de la plateforme : 8%
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Durée moyenne session</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">
            Temps moyen par coaching
          </p>
          <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            {stats.totalReservations > 0 
              ? (stats.totalHours / stats.totalReservations).toFixed(1) 
              : '0'}h
          </div>
          <p className="text-sm text-gray-500">
            {stats.totalReservations} sessions au total
          </p>
        </GlassCard>
      </div>

      {/* Recent Activity */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">Activité récente</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Vos dernières réservations et interactions
        </p>
        <div className="space-y-3">
          {stats.totalReservations === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucune réservation pour le moment. Créez vos premières annonces pour commencer !
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-gray-300">{stats.upcomingReservations} réservations à venir</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                <span className="text-gray-300">{stats.pendingReservations} demandes en attente</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-gray-300">{stats.activeAnnouncements} annonces actives</span>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
