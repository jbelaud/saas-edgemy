'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Loader2, TrendingUp, Users, Clock, Euro, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardStats } from '@/components/coach/dashboard/DashboardStats';
import { DashboardProfile } from '@/components/coach/dashboard/DashboardProfile';
import { DashboardAnnouncements } from '@/components/coach/dashboard/DashboardAnnouncements';
import type { CoachDashboardData } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CoachDashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<CoachDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/coach/dashboard');
        
        if (!response.ok) {
          if (response.status === 404) {
            // Pas de profil coach, rediriger vers onboarding
            router.push('/coach/onboarding');
            return;
          }
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
  }, [session, router]);

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
    <div className="container mx-auto py-8 px-6">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Coach
          </h1>
          <p className="text-gray-600">
            Bienvenue, {coach.firstName} {coach.lastName}
          </p>
        </div>
        <Link href={`/coach/${coach.slug}`} target="_blank">
          <Button variant="outline" size="lg">
            <ExternalLink className="mr-2 h-4 w-4" />
            Voir mon profil public
          </Button>
        </Link>
      </div>

      {/* Status Alerts */}
      {isInactive && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Profil inactif</CardTitle>
            <CardDescription className="text-red-700">
              Votre profil est actuellement inactif. Veuillez renouveler votre abonnement pour continuer à recevoir des réservations.
            </CardDescription>
          </CardHeader>
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
    </div>
  );
}
