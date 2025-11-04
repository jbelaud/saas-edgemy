'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2, TrendingUp, Users, Clock, Euro, ExternalLink, Sparkles, CheckCircle2, Zap, BarChart3, UserCircle2, Megaphone } from 'lucide-react';
import { GlassCard, GradientButton, GradientText } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from '@/components/coach/dashboard/DashboardStats';
import { DashboardProfile } from '@/components/coach/dashboard/DashboardProfile';
import { DashboardAnnouncements } from '@/components/coach/dashboard/DashboardAnnouncements';
import type { CoachDashboardData } from '@/types/dashboard';
import Link from 'next/link';
import { useCoachRoleSetup } from '@/hooks/useCoachRoleSetup';
import { useSearchParams } from 'next/navigation';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { CoachOnboardingModal } from '@/components/coach/onboarding/CoachOnboardingModal';

export default function CoachDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  
  // Hook pour créer le profil coach lors de la première connexion Google
  useCoachRoleSetup();
  
  // Vérifier si on est en mode setup (côté client uniquement)
  useEffect(() => {
    const setupFromUrl = searchParams.get('setupCoach') === 'true';
    const setupFromStorage = typeof window !== 'undefined' && localStorage.getItem('pendingCoachRole') === 'true';
    setIsSettingUp(setupFromUrl || setupFromStorage);
  }, [searchParams]);

  useEffect(() => {
    const fetchDashboard = async () => {
      // Ne pas charger le dashboard si on est en mode setup
      if (isSettingUp) {
        return;
      }
      
      try {
        const response = await fetch('/api/coach/dashboard');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du dashboard');
        }

        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboard();
    }
  }, [session, router, isSettingUp]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) {
    router.push('/');
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <GlassCard className="border-red-500/20 bg-red-500/10">
          <h2 className="text-red-400 text-xl font-bold mb-2">Erreur</h2>
          <p className="text-red-300">{error}</p>
        </GlassCard>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Vérifier le statut d'abonnement du coach
  const { coach, stats } = data;
  const hasActiveSubscription = coach.subscriptionStatus === 'ACTIVE';

  return (
    <CoachLayout>
      {/* Header simplifié */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2">
            <GradientText variant="white">Bienvenue,</GradientText>{' '}
            <GradientText variant="amber">{coach.firstName}</GradientText> 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Gérez votre activité de coaching
          </p>
        </div>
        {hasActiveSubscription && (
          <Link href={`/${locale}/coach/${coach.slug}`} target="_blank">
            <GradientButton variant="ghost" size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir mon profil public
            </GradientButton>
          </Link>
        )}
      </div>

      {/* Status Alerts */}
      {!hasActiveSubscription && (
        <GlassCard className="mb-6 border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="mb-6">
            <h2 className="text-white flex items-center gap-2 text-2xl font-bold mb-3">
              <Sparkles className="h-6 w-6 text-amber-400" />
              Activez votre abonnement coach
            </h2>
            <p className="text-gray-300 text-base">
              Votre profil est créé mais pas encore actif. Activez votre abonnement pour débloquer tous les avantages :
            </p>
          </div>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Profil public visible</p>
                  <p className="text-sm text-gray-400">Apparaissez dans les résultats de recherche</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Réservations illimitées</p>
                  <p className="text-sm text-gray-400">Recevez autant de réservations que vous le souhaitez</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Gestion des disponibilités</p>
                  <p className="text-sm text-gray-400">Calendrier intelligent et synchronisation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">Paiements sécurisés</p>
                  <p className="text-sm text-gray-400">Recevez vos paiements directement</p>
                </div>
              </div>
            </div>
            <GradientButton
              size="lg"
              variant="amber"
              className="w-full md:w-auto"
              onClick={() => setIsOnboardingModalOpen(true)}
            >
              <Zap className="mr-2 h-5 w-5" />
              Activer mon abonnement maintenant
            </GradientButton>
          </div>
        </GlassCard>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Revenus totaux</h3>
            <Euro className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalRevenue.toFixed(2)}€</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.monthlyRevenue.toFixed(2)}€ ce mois
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Réservations</h3>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalReservations}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.upcomingReservations} à venir
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Heures de coaching</h3>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalHours}h</div>
          <p className="text-xs text-gray-500 mt-1">
            Total cumulé
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Annonces actives</h3>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.activeAnnouncements}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.pendingReservations} en attente
          </p>
        </GlassCard>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4" />
            Vue d&apos;ensemble
          </TabsTrigger>
          <TabsTrigger value="profile">
            <UserCircle2 className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="announcements">
            <Megaphone className="h-4 w-4" />
            Annonces
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <DashboardStats stats={stats} />
        </TabsContent>

        <TabsContent value="profile">
          <DashboardProfile coach={coach} />
        </TabsContent>

        <TabsContent value="announcements">
          <DashboardAnnouncements
            coach={coach}
            onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Onboarding Modal */}
      <CoachOnboardingModal
        open={isOnboardingModalOpen}
        onOpenChange={setIsOnboardingModalOpen}
      />
    </CoachLayout>
  );
}
