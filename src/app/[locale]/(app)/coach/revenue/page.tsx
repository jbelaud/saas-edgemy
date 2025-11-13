'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { GlassCard, GradientText } from '@/components/ui';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  TrendingUp,
  Euro,
  ArrowUpRight,
  Clock,
  Banknote,
  Calendar,
  Wallet,
  BarChart3,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SubscriptionGate } from '@/components/coach/dashboard/SubscriptionGate';

interface CoachDashboardResponse {
  coach: {
    subscriptionStatus: string | null;
    stripeAccountId: string | null;
    isOnboarded: boolean;
  };
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

export default function CoachRevenuePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { data: session, isPending } = useSession();

  const [dashboardData, setDashboardData] = useState<CoachDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/coach/dashboard');
        if (!response.ok) {
          throw new Error('Impossible de récupérer le dashboard coach');
        }
        const data = await response.json();
        setDashboardData(data);
        setSubscriptionStatus(data.coach?.subscriptionStatus || null);
      } catch (error) {
        console.error('Erreur récupération dashboard coach:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboard();
    }
  }, [session]);

  const stats = dashboardData?.stats;
  const coach = dashboardData?.coach;

  const isStripeConnected = useMemo(() => {
    return coach?.stripeAccountId && coach?.isOnboarded;
  }, [coach]);

  const revenuePerHour = useMemo(() => {
    if (!stats || stats.totalHours === 0) return 0;
    return stats.totalRevenue / stats.totalHours;
  }, [stats]);

  const averageOrderValue = useMemo(() => {
    if (!stats || stats.totalReservations === 0) return 0;
    return stats.totalRevenue / stats.totalReservations;
  }, [stats]);

  if (isPending || isLoading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      </CoachLayout>
    );
  }

  if (!stats) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400">Impossible d&apos;afficher les revenus pour le moment.</p>
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <header className="flex flex-col gap-3">
          <div className="inline-flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/25">
              <Euro className="h-6 w-6 text-emerald-300" />
            </div>
            <GradientText className="text-3xl font-semibold" variant="emerald">
              Revenus & performance
            </GradientText>
          </div>
          <p className="text-gray-300 max-w-2xl">
            Analysez vos gains, suivez vos réservations et anticipez vos prochains paiements.
          </p>
        </header>

        <SubscriptionGate isActive={subscriptionStatus === 'ACTIVE'}>
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <GlassCard className="p-6 border-emerald-500/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Revenus total</p>
              <TrendingUp className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="text-3xl font-semibold text-white">{stats.totalRevenue.toFixed(2)} €</p>
            <p className="text-xs text-emerald-300/80 mt-2 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" />
              {stats.monthlyRevenue.toFixed(2)} € générés ce mois-ci
            </p>
          </GlassCard>

          <GlassCard className="p-6 border-blue-500/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Heures coachées</p>
              <Clock className="h-5 w-5 text-blue-300" />
            </div>
            <p className="text-3xl font-semibold text-white">{stats.totalHours.toFixed(1)} h</p>
            <p className="text-xs text-blue-300/80 mt-2">
              {stats.totalReservations} sessions complétées
            </p>
          </GlassCard>

          <GlassCard className="p-6 border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Revenu moyen / session</p>
              <Wallet className="h-5 w-5 text-amber-300" />
            </div>
            <p className="text-3xl font-semibold text-white">{averageOrderValue.toFixed(2)} €</p>
            <p className="text-xs text-amber-300/80 mt-2">
              {revenuePerHour.toFixed(2)} € par heure de coaching
            </p>
          </GlassCard>

          <GlassCard className="p-6 border-purple-500/20">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400">Prochaines sessions</p>
              <Calendar className="h-5 w-5 text-purple-300" />
            </div>
            <p className="text-3xl font-semibold text-white">{stats.upcomingReservations}</p>
            <p className="text-xs text-purple-300/80 mt-2">
              {stats.pendingReservations} demandes en attente
            </p>
          </GlassCard>
        </div>

        {/* Revenue chart */}
        <GlassCard className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Évolution mensuelle</h3>
              <p className="text-sm text-gray-400">Revenus encaissés sur les 6 derniers mois</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                Revenus encaissés
              </div>
            </div>
          </div>
          <div className="h-72">
            {stats.monthlyRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthlyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.4} />
                  <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value}€`} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(2)} €`, 'Revenus']}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderRadius: '12px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      color: '#f8fafc',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#34d399"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Aucune donnée disponible pour l’instant.
              </div>
            )}
          </div>
        </GlassCard>

        {/* Summary grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Banknote className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Résumé financier</h3>
                <p className="text-sm text-gray-400">Vision claire de vos recettes et demandes</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-gray-300">Annonces actives</span>
                <span className="text-white font-semibold">{stats.activeAnnouncements}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-gray-300">Demandes en attente</span>
                <span className="text-amber-300 font-semibold">{stats.pendingReservations}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <span className="text-gray-300">Sessions à venir</span>
                <span className="text-emerald-300 font-semibold">{stats.upcomingReservations}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <BarChart3 className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Optimisation</h3>
                <p className="text-sm text-gray-400">Recommandations pour augmenter vos revenus</p>
              </div>
            </div>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Relancez vos joueurs récurrents pour des packs + gains réguliers.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-400" />
                Activez plus de créneaux pour augmenter vos chances de réservation.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                Créez une annonce pack pour fidéliser vos élèves.
              </li>
            </ul>
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Wallet className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Versements & paiements</h3>
                <p className="text-sm text-gray-400">
                  {isStripeConnected ? 'Vos versements automatiques' : 'Paramétrez vos informations bancaires Stripe'}
                </p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              {isStripeConnected ? (
                <>
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <p className="text-white font-medium flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                      Compte Stripe connecté
                    </p>
                    <p className="text-xs text-gray-300 mt-2">
                      Vos gains sont automatiquement versés sur votre compte bancaire après validation de chaque session.
                    </p>
                    <ul className="mt-3 space-y-1 text-xs text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>Sessions individuelles : paiement immédiat après la session</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1">•</span>
                        <span>Packs : paiement après la première session du pack</span>
                      </li>
                    </ul>
                    <Button
                      variant="outline"
                      className="mt-4 w-full border-emerald-500/70 bg-emerald-950/60 text-emerald-100 hover:bg-emerald-800/70 hover:border-emerald-400 hover:text-white"
                      onClick={() => router.push(`/${locale}/coach/settings?tab=payouts`)}
                    >
                      Gérer mon compte Stripe
                    </Button>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-white/5 border border-purple-500/20 rounded-lg">
                  <p className="text-white font-medium">Compte Stripe</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Finalisez la connexion pour recevoir vos futurs paiements.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 w-full border-purple-500/70 bg-purple-950/60 text-purple-100 hover:bg-purple-800/70 hover:border-purple-400 hover:text-white"
                    onClick={() => router.push(`/${locale}/coach/settings?tab=payouts`)}
                  >
                    Configurer mes versements
                  </Button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                {isStripeConnected
                  ? 'Les versements sont traités automatiquement immédiatement après validation des sessions.'
                  : 'Les versements sont traités automatiquement sous 7 jours ouvrés après validation des sessions.'
                }
              </p>
            </div>
          </GlassCard>
        </div>
        </SubscriptionGate>
      </div>
    </CoachLayout>
  );
}
