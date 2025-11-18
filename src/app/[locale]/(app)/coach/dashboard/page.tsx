'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2, TrendingUp, Users, Clock, Euro, Eye, BarChart3, UserCircle2, Megaphone, Plus } from 'lucide-react';
import { GlassCard, GradientText } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from '@/components/coach/dashboard/DashboardStats';
import { DashboardProfile } from '@/components/coach/dashboard/DashboardProfile';
import { DashboardAnnouncements } from '@/components/coach/dashboard/DashboardAnnouncements';
import { FreeTrialBanner } from '@/components/coach/dashboard/FreeTrialBanner';
import type { CoachDashboardData } from '@/types/dashboard';
import { useCoachRoleSetup } from '@/hooks/useCoachRoleSetup';
import { useSearchParams } from 'next/navigation';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { OnboardingChecklist } from '@/components/coach/onboarding/OnboardingChecklist';
import { useCoachAccess } from '@/hooks/useCoachAccess';
import { CoachAccessGuard } from '@/components/coach/guards/CoachAccessGuard';
import { CreateAnnouncementModalV2 } from '@/components/coach/announcements/CreateAnnouncementModalV2';

export default function CoachDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Hook pour créer le profil coach lors de la première connexion Google
  useCoachRoleSetup();

  // Hook pour gérer les accès coach
  const {
    hasActiveSubscription,
    isStripeConnected,
    isDiscordConnected,
    isLitePlan,
    checkAccess,
    blockReason,
    isGuardOpen,
    closeGuard,
  } = useCoachAccess(data?.coach ?? null);

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

  // Confirmer l'abonnement immédiatement au retour de Stripe
  useEffect(() => {
    const subscriptionStatus = searchParams.get('subscription');
    const sessionId = searchParams.get('session_id');

    if (subscriptionStatus === 'success' && sessionId && !isLoading && data) {
      // Nettoyer l'URL immédiatement
      const url = new URL(window.location.href);
      url.searchParams.delete('subscription');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.toString());

      // Confirmer l'abonnement immédiatement via l'API
      const confirmSubscription = async () => {
        try {
          const response = await fetch('/api/subscription/confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          if (response.ok) {
            const result = await response.json();
            console.log('✅ Abonnement confirmé:', result.message);
            // Recharger la page pour afficher le nouveau statut
            window.location.reload();
          } else {
            const error = await response.json();
            console.error('Erreur confirmation abonnement:', error);
            // Même en cas d'erreur, recharger pour laisser le webhook gérer
            setTimeout(() => window.location.reload(), 2000);
          }
        } catch (error) {
          console.error('Erreur lors de la confirmation:', error);
          // En cas d'erreur, recharger pour laisser le webhook gérer
          setTimeout(() => window.location.reload(), 2000);
        }
      };

      confirmSubscription();
    }
  }, [searchParams, isLoading, data]);

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

  const { coach, stats } = data;

  const handleConnectStripe = async () => {
    try {
      const response = await fetch('/api/stripe/connect/account-link', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création du lien Stripe');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la connexion à Stripe');
    }
  };

  const handleConnectDiscord = () => {
    window.location.href = `/${locale}/coach/settings`;
  };

  const handleCreateAnnouncement = () => {
    // Vérifier l'accès avant d'ouvrir la modal
    // LITE: subscription + discord (pas besoin de Stripe)
    // PRO: subscription + stripe + discord
    if (checkAccess({ subscription: true, stripe: true, discord: true })) {
      setIsCreateModalOpen(true);
    }
  };

  return (
    <CoachLayout>
      {/* Header simplifié */}
      <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.open(`/${locale}/coach/${coach.slug}`, '_blank')}
              className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              Voir mon profil public
            </button>
            <button
              onClick={handleCreateAnnouncement}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Créer une annonce
            </button>
          </div>
        )}
      </div>

      {/* Free Trial Banner */}
      <FreeTrialBanner
        freeTrialEndDate={coach.freeTrialEndDate}
        subscriptionPlan={coach.subscriptionPlan}
        subscriptionStatus={coach.subscriptionStatus}
      />

      {/* Checklist d'onboarding */}
      {(!hasActiveSubscription || !isStripeConnected || !isDiscordConnected) && (
        <div className="mb-8">
          <OnboardingChecklist
            hasActiveSubscription={hasActiveSubscription ?? false}
            isStripeConnected={isStripeConnected ?? false}
            isDiscordConnected={isDiscordConnected ?? false}
            planKey={coach.planKey}
            onConnectStripe={handleConnectStripe}
            onConnectDiscord={handleConnectDiscord}
            onCreateAnnouncement={handleCreateAnnouncement}
          />
        </div>
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
            key={refreshKey}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de création d'annonce */}
      {hasActiveSubscription && (isLitePlan || isStripeConnected) && isDiscordConnected && (
        <CreateAnnouncementModalV2
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {/* Guard pour les accès bloqués */}
      <CoachAccessGuard
        reason={blockReason}
        open={isGuardOpen}
        onOpenChange={closeGuard}
        onConnectStripe={handleConnectStripe}
        onConnectDiscord={handleConnectDiscord}
      />
    </CoachLayout>
  );
}
