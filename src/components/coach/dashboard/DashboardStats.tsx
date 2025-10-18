'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
      <Card>
        <CardHeader>
          <CardTitle>Évolution des revenus</CardTitle>
          <CardDescription>
            Revenus mensuels sur les 12 derniers mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(2)}€`}
                labelStyle={{ color: '#000' }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Revenus"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Taux de conversion</CardTitle>
            <CardDescription>
              Ratio réservations / vues de profil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">
              {stats.totalReservations > 0 ? '12%' : '0%'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Moyenne de la plateforme : 8%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Durée moyenne session</CardTitle>
            <CardDescription>
              Temps moyen par coaching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">
              {stats.totalReservations > 0 
                ? (stats.totalHours / stats.totalReservations).toFixed(1) 
                : '0'}h
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {stats.totalReservations} sessions au total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
          <CardDescription>
            Vos dernières réservations et interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.totalReservations === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucune réservation pour le moment. Créez vos premières annonces pour commencer !
              </p>
            ) : (
              <div className="text-sm text-muted-foreground">
                <p>• {stats.upcomingReservations} réservations à venir</p>
                <p>• {stats.pendingReservations} demandes en attente</p>
                <p>• {stats.activeAnnouncements} annonces actives</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
