'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2, TrendingUp, Users, Clock, Euro, ExternalLink, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from '@/components/coach/dashboard/DashboardStats';
import { DashboardProfile } from '@/components/coach/dashboard/DashboardProfile';
import { DashboardAnnouncements } from '@/components/coach/dashboard/DashboardAnnouncements';
import type { CoachDashboardData } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCoachRoleSetup } from '@/hooks/useCoachRoleSetup';
import { useSearchParams } from 'next/navigation';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';

export default function CoachDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hook pour créer le profil coach lors de la première connexion Google
  useCoachRoleSetup();
  
  // Vérifier si on est en mode setup
  const isSettingUp = searchParams.get('setupCoach') === 'true' || localStorage.getItem('pendingCoachRole') === 'true';

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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Erreur</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Vérifier le statut du coach
  const { coach, stats } = data;
  const isInactive = coach.status === 'INACTIVE';

  return (
    <CoachLayout>
      {/* Header simplifié */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Bienvenue, {coach.firstName} 👋
          </h1>
          <p className="text-gray-600">
            Gérez votre activité de coaching
          </p>
        </div>
        {!isInactive && (
          <Link href={`/${locale}/coach/${coach.slug}`} target="_blank">
            <Button variant="outline" size="lg">
              <ExternalLink className="mr-2 h-4 w-4" />
              Voir mon profil public
            </Button>
          </Link>
        )}
      </div>

      {/* Status Alerts */}
      {isInactive && (
        <Card className="mb-6 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="text-orange-900 flex items-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6" />
              Activez votre abonnement coach
            </CardTitle>
            <CardDescription className="text-orange-800 text-base mt-3">
              Votre profil est créé mais pas encore actif. Activez votre abonnement pour débloquer tous les avantages :
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Profil public visible</p>
                  <p className="text-sm text-gray-600">Apparaissez dans les résultats de recherche</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Réservations illimitées</p>
                  <p className="text-sm text-gray-600">Recevez autant de réservations que vous le souhaitez</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Gestion des disponibilités</p>
                  <p className="text-sm text-gray-600">Calendrier intelligent et synchronisation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Paiements sécurisés</p>
                  <p className="text-sm text-gray-600">Recevez vos paiements directement</p>
                </div>
              </div>
            </div>
            <Button 
              size="lg" 
              className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
              onClick={() => router.push(`/${locale}/coach/onboarding`)}
            >
              <Zap className="mr-2 h-5 w-5" />
              Activer mon abonnement maintenant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground">
              {stats.monthlyRevenue.toFixed(2)}€ ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Réservations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReservations}</div>
            <p className="text-xs text-muted-foreground">
              {stats.upcomingReservations} à venir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures de coaching</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours}h</div>
            <p className="text-xs text-muted-foreground">
              Total cumulé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annonces actives</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingReservations} en attente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stats">Vue d&apos;ensemble</TabsTrigger>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="announcements">Annonces</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <DashboardStats stats={stats} />
        </TabsContent>

        <TabsContent value="profile">
          <DashboardProfile coach={coach} />
        </TabsContent>

        <TabsContent value="announcements">
          <DashboardAnnouncements coach={coach} />
        </TabsContent>
      </Tabs>
    </CoachLayout>
  );
}
