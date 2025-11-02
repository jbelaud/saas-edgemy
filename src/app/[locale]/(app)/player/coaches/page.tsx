'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2, Search } from 'lucide-react';
import { GlassCard, GradientText, GradientButton } from '@/components/ui';
import Link from 'next/link';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerCoachesList } from '@/components/player/coaches/PlayerCoachesList';

interface Coach {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  formats: string[];
  languages: string[];
  status: string;
  sessionsCount: number;
  types: string[];
}

export default function PlayerCoachesPage() {
  const router = useRouter();
  const locale = useLocale();
  const { data: session, isPending } = useSession();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        // Récupérer le profil joueur d'abord
        const profileResponse = await fetch('/api/player/profile');
        if (!profileResponse.ok) {
          throw new Error('Erreur lors du chargement du profil');
        }
        const profileData = await profileResponse.json();
        
        // Récupérer les coachs associés
        const coachesResponse = await fetch(`/api/player/${profileData.player.id}/coaches`);
        if (!coachesResponse.ok) {
          throw new Error('Erreur lors du chargement des coachs');
        }

        const coachesData = await coachesResponse.json();
        setCoaches(coachesData.coaches);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchCoaches();
    }
  }, [session]);

  if (isPending || isLoading) {
    return (
      <PlayerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PlayerLayout>
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

  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <GradientText variant="emerald">Mes Coachs</GradientText>
        </h1>
        <p className="text-gray-400 text-lg">
          Retrouve tous les coachs avec qui tu as travaillé
        </p>
      </div>

      {coaches.length === 0 ? (
        <GlassCard className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
          <div className="mb-6">
            <h2 className="text-white text-2xl font-bold mb-3">
              Tu n&apos;as pas encore réservé de coach
            </h2>
            <p className="text-gray-300 text-base">
              Commence ton parcours de progression en réservant ta première session avec un coach professionnel.
            </p>
          </div>
          <Link href={`/${locale}/player/coaches/explore`}>
            <GradientButton 
              size="lg" 
              variant="emerald"
            >
              <Search className="mr-2 h-5 w-5" />
              Trouver un coach
            </GradientButton>
          </Link>
        </GlassCard>
      ) : (
        <PlayerCoachesList coaches={coaches} />
      )}
    </PlayerLayout>
  );
}
