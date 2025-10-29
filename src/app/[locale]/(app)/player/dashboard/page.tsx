'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2, TrendingUp, Users, Clock, Search } from 'lucide-react';
import { GlassCard, GradientButton, GradientText } from '@/components/ui';
import Link from 'next/link';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';

export default function PlayerDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, isPending } = useSession();
  const [playerData, setPlayerData] = useState<{ player?: { firstName?: string; lastName?: string } } | null>(null);
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
      <PlayerLayout>
        <GlassCard className="border-red-500/20 bg-red-500/10">
          <h2 className="text-red-400 text-xl font-bold mb-2">Erreur</h2>
          <p className="text-red-300">{error}</p>
        </GlassCard>
      </PlayerLayout>
    );
  }

  const firstName = playerData?.player?.firstName || session.user.name?.split(' ')[0] || 'Joueur';

  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <GradientText variant="white">Salut</GradientText>{' '}
          <GradientText variant="emerald">{firstName}</GradientText> 👋
        </h1>
        <p className="text-gray-400 text-lg">
          Prêt à progresser aujourd&apos;hui ?
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Heures coachées</h3>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">0h</div>
          <p className="text-xs text-gray-500 mt-1">
            Total cumulé
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Coachs suivis</h3>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">0</div>
          <p className="text-xs text-gray-500 mt-1">
            Aucun coach pour le moment
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">Sessions planifiées</h3>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">0</div>
          <p className="text-xs text-gray-500 mt-1">
            À venir
          </p>
        </GlassCard>
      </div>

      {/* CTA Trouver un coach */}
      <GlassCard className="mb-8 border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="mb-6">
          <h2 className="text-white flex items-center gap-2 text-2xl font-bold mb-3">
            <Search className="h-6 w-6 text-emerald-400" />
            Trouve ton prochain coach
          </h2>
          <p className="text-gray-300 text-base">
            Explore notre sélection de coachs professionnels et réserve ta première session de coaching.
          </p>
        </div>
        <Link href={`/${locale}/player/coaches/explore`}>
          <GradientButton 
            size="lg" 
            variant="emerald"
          >
            <Search className="mr-2 h-5 w-5" />
            Explorer les coachs
          </GradientButton>
        </Link>
      </GlassCard>

      {/* Placeholder futur */}
      <GlassCard>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Ton suivi de progression</h2>
          <p className="text-gray-400 text-sm">
            Visualise ton évolution et tes statistiques de coaching
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-lg font-medium mb-2 text-gray-300">Bientôt disponible 🚀</p>
            <p className="text-sm text-gray-500">
              Ton suivi de progression personnalisé arrivera prochainement
            </p>
          </div>
        </div>
      </GlassCard>
    </PlayerLayout>
  );
}
