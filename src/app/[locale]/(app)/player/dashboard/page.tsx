'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2, TrendingUp, Users, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';

export default function PlayerDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, isPending } = useSession();
  const [playerData, setPlayerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        // Récupérer le profil joueur
        const response = await fetch('/api/player/profile');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du profil');
        }

        const data = await response.json();
        setPlayerData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchPlayerData();
    }
  }, [session]);

  if (isPending || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!session?.user) {
    router.push('/');
    return null;
  }

  if (error) {
    return (
      <PlayerLayout>
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Erreur</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
        </Card>
      </PlayerLayout>
    );
  }

  const firstName = playerData?.player?.firstName || session.user.name?.split(' ')[0] || 'Joueur';

  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Salut {firstName} 👋
        </h1>
        <p className="text-gray-600">
          Prêt à progresser aujourd'hui ?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heures coachées</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0h</div>
            <p className="text-xs text-muted-foreground">
              Total cumulé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coachs suivis</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Aucun coach pour le moment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions planifiées</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              À venir
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CTA Trouver un coach */}
      <Card className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardHeader>
          <CardTitle className="text-emerald-900 flex items-center gap-2 text-2xl">
            <Search className="h-6 w-6" />
            Trouve ton prochain coach
          </CardTitle>
          <CardDescription className="text-emerald-800 text-base mt-3">
            Explore notre sélection de coachs professionnels et réserve ta première session de coaching.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href={`/${locale}/player/coaches/explore`}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
            >
              <Search className="mr-2 h-5 w-5" />
              Explorer les coachs
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Placeholder futur */}
      <Card>
        <CardHeader>
          <CardTitle>Ton suivi de progression</CardTitle>
          <CardDescription>
            Visualise ton évolution et tes statistiques de coaching
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-gray-500">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Bientôt disponible 🚀</p>
              <p className="text-sm">
                Ton suivi de progression personnalisé arrivera prochainement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </PlayerLayout>
  );
}
