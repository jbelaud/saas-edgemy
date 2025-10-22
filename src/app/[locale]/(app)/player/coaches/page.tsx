'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { Loader2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900">Erreur</CardTitle>
            <CardDescription className="text-red-700">{error}</CardDescription>
          </CardHeader>
        </Card>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Mes coachs
        </h1>
        <p className="text-gray-600">
          Retrouve tous les coachs avec qui tu as travaillé
        </p>
      </div>

      {coaches.length === 0 ? (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2 text-2xl">
              <Search className="h-6 w-6" />
              Tu n&apos;as pas encore réservé de coach
            </CardTitle>
            <CardDescription className="text-emerald-800 text-base mt-3">
              Commence ton parcours de progression en réservant ta première session avec un coach professionnel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${locale}/player/coaches/explore`}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold"
              >
                <Search className="mr-2 h-5 w-5" />
                Trouver un coach
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <PlayerCoachesList coaches={coaches} />
      )}
    </PlayerLayout>
  );
}
