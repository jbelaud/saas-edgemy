'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search, Filter } from 'lucide-react';
import { GlassCard, GradientText } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerExploreCoaches } from '@/components/player/coaches/PlayerExploreCoaches';

interface Coach {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  formats: string[];
  languages: string[];
  experience?: number;
  roi?: number;
  stakes?: string;
  badges: string[];
  announcements: unknown[];
  priceRange?: {
    min: number;
    max: number;
  };
  announcementTypes: string[];
}

export default function PlayerCoachesExplorePage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        const response = await fetch('/api/coach/explore');
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des coachs');
        }

        const data = await response.json();
        setCoaches(data.coaches);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  if (isLoading) {
    return (
      <PlayerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PlayerLayout>
    );
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
          <GradientText variant="emerald">Trouve ton coach idéal</GradientText>
        </h1>
        <p className="text-gray-400 text-lg">
          Explore notre sélection de coachs professionnels
        </p>
      </div>

      {/* Search and Filters */}
      <GlassCard className="mb-6 p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un coach..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="md:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
      </GlassCard>

      {/* Coaches List */}
      <PlayerExploreCoaches coaches={coaches} searchQuery={searchQuery} />
    </PlayerLayout>
  );
}
