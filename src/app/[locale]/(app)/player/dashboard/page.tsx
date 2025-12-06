'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, TrendingUp, Users, Clock, Search } from 'lucide-react';
import { GlassCard, GradientButton, GradientText } from '@/components/ui';
import Link from 'next/link';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerOnboardingChecklist } from '@/components/player/onboarding/PlayerOnboardingChecklist';

interface PlayerStats {
  totalHours: number;
  coachesCount: number;
  upcomingSessionsCount: number;
  completedSessionsCount: number;
  totalReservations: number;
}

interface PlayerDashboardData {
  player: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    isDiscordConnected: boolean;
  };
  stats: PlayerStats;
}

export default function PlayerDashboardPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('player.dashboard');
  const { data: session, isPending } = useSession();
  const [dashboardData, setDashboardData] = useState<PlayerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('/api/player/dashboard');

        if (!response.ok) {
          throw new Error(t('error.loadingError'));
        }

        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error.loadingError'));
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchDashboard();
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
          <h2 className="text-red-400 text-xl font-bold mb-2">{t('error.title')}</h2>
          <p className="text-red-300">{error}</p>
        </GlassCard>
      </PlayerLayout>
    );
  }

  const firstName = dashboardData?.player?.firstName || session.user.name?.split(' ')[0] || t('greeting.defaultName');
  const stats = dashboardData?.stats || {
    totalHours: 0,
    coachesCount: 0,
    upcomingSessionsCount: 0,
    completedSessionsCount: 0,
    totalReservations: 0,
  };

  return (
    <PlayerLayout>
      {/* Onboarding Checklist - Discord */}
      <PlayerOnboardingChecklist
        isDiscordConnected={dashboardData?.player?.isDiscordConnected ?? false}
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <GradientText variant="white">{t('greeting.hello')}</GradientText>{' '}
          <GradientText variant="emerald">{firstName}</GradientText> 👋
        </h1>
        <p className="text-gray-400 text-lg">
          {t('greeting.ready')}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">{t('stats.coachedHours')}</h3>
            <Clock className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalHours}h</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.completedSessionsCount > 1 
              ? t('stats.sessionsCompletedPlural', { count: stats.completedSessionsCount })
              : t('stats.sessionsCompleted', { count: stats.completedSessionsCount })}
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">{t('stats.coachesFollowed')}</h3>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.coachesCount}</div>
          <p className="text-xs text-gray-500 mt-1">
            {stats.coachesCount === 0
              ? t('stats.noCoach')
              : stats.coachesCount > 1 ? t('stats.coachesActive') : t('stats.coachActive')
            }
          </p>
        </GlassCard>

        <GlassCard>
          <div className="flex flex-row items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-400">{t('stats.scheduledSessions')}</h3>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-bold text-white">{stats.upcomingSessionsCount}</div>
          <p className="text-xs text-gray-500 mt-1">
            {t('stats.upcoming')}
          </p>
        </GlassCard>
      </div>

      {/* CTA Trouver un coach */}
      <GlassCard className="mb-8 border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10">
        <div className="mb-6">
          <h2 className="text-white text-2xl font-bold mb-3">
            {stats.coachesCount === 0 ? t('cta.findFirstCoach') : t('cta.findNextCoach')}
          </h2>
          <p className="text-gray-300 text-base">
            {stats.coachesCount === 0
              ? t('cta.descriptionFirst')
              : t('cta.descriptionNext')
            }
          </p>
        </div>
        <Link href={`/${locale}/player/coaches/explore`}>
          <GradientButton
            size="lg"
            variant="emerald"
          >
            <Search className="mr-2 h-5 w-5" />
            {t('cta.exploreCoaches')}
          </GradientButton>
        </Link>
      </GlassCard>

      {/* Placeholder futur */}
      <GlassCard>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-2">{t('progress.title')}</h2>
          <p className="text-gray-400 text-sm">
            {t('progress.subtitle')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-500" />
            <p className="text-lg font-medium mb-2 text-gray-300">{t('progress.comingSoon')}</p>
            <p className="text-sm text-gray-500">
              {t('progress.description')}
            </p>
          </div>
        </div>
      </GlassCard>
    </PlayerLayout>
  );
}
