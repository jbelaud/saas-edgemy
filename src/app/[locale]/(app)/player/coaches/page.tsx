'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, Search, Users, Sparkles, ArrowRight, Clock, BarChart3 } from 'lucide-react';

import { GlassCard, GradientText, GradientButton } from '@/components/ui';
import Link from 'next/link';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerCoachesList } from '@/components/player/coaches/PlayerCoachesList';
import { Button } from '@/components/ui/button';

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
  lastSessionDate?: string | null;
  discordChannelId?: string | null;
}

export default function PlayerCoachesPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('player.coaches');
  const { data: session, isPending } = useSession();
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasData = coaches.length > 0;
  const totalSessions = useMemo(() => coaches.reduce((acc, coach) => acc + coach.sessionsCount, 0), [coaches]);

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
    } catch (error) {
      console.error('Erreur formatage date coach:', error);
      return date.toLocaleDateString();
    }
  };

  const mostRecentSession = useMemo(() => {
    const sessions = coaches
      .map((coach) => coach.lastSessionDate ? new Date(coach.lastSessionDate) : null)
      .filter((date): date is Date => date instanceof Date && !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime());

    if (sessions.length === 0) {
      return null;
    }

    return sessions[0];
  }, [coaches]);

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
        <div className="min-h-[400px]">
          <GlassCard className="flex h-full flex-col items-center justify-center gap-4 border-white/5 bg-slate-900/60 py-16">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/40">
                <Loader2 className="h-7 w-7 animate-spin text-emerald-400" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-medium text-white">{t('loading.title')}</p>
              <p className="text-sm text-slate-300/80 max-w-xs">
                {t('loading.subtitle')}
              </p>
            </div>
          </GlassCard>
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
        <GlassCard className="border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-4">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <Sparkles className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-red-200 text-xl font-semibold mb-2">
                {t('errors.title')}
              </h2>
              <p className="text-red-300/80 max-w-2xl">
                {error}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" className="border-red-500/20 text-red-200 hover:bg-red-500/10" onClick={() => window.location.reload()}>
                  {t('actions.retry')}
                </Button>
                <Link href={`/${locale}/player/coaches/explore`}>
                  <Button className="bg-red-500/80 text-white hover:bg-red-500">
                    <Search className="mr-2 h-4 w-4" />
                    {t('actions.discover')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      </PlayerLayout>
    );
  }

  return (
    <PlayerLayout>
      <div className="mb-10 flex flex-col gap-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-5 py-2 text-sm font-medium text-emerald-200">
              <Users className="h-4 w-4" />
              {t('section.badge')}
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold text-white tracking-tight">
                <GradientText variant="emerald">{t('section.title')}</GradientText>
              </h1>
              <p className="text-base text-slate-300/90 max-w-2xl">
                {t('section.subtitle')}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/player/coaches/explore`}>
              <GradientButton size="lg" variant="emerald" className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                {t('actions.find')}
              </GradientButton>
            </Link>
          </div>
        </div>

        {hasData && (
          <div className="grid gap-4 md:grid-cols-2">
            <GlassCard className="border-white/5 bg-slate-900/60 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">{t('metrics.totalSessions')}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{totalSessions}</p>
                  <p className="text-xs text-slate-300/80">{t('metrics.totalSessionsHint')}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="border-white/5 bg-slate-900/60 p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">{t('metrics.lastSession')}</p>
                  <p className="mt-1 text-2xl font-semibold text-white">
                    {mostRecentSession ? formatDate(mostRecentSession) : t('metrics.noSession')}
                  </p>
                  <p className="text-xs text-slate-300/80">{t('metrics.lastSessionHint')}</p>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {!hasData ? (
        <GlassCard className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-slate-900/60 to-teal-500/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_65%)]" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-semibold text-white">
                  {t('empty.title')}
                </h2>
                <p className="mt-3 text-base text-emerald-50/90 leading-relaxed max-w-xl">
                  {t('empty.description')}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {['highlight1', 'highlight2', 'highlight3', 'highlight4'].map((key) => (
                  <GlassCard key={key} className="border-white/10 bg-white/10 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-emerald-500/20 p-2">
                        <Sparkles className="h-4 w-4 text-emerald-300" />
                      </div>
                      <p className="text-sm text-white/90">
                        {t(`empty.${key}`)}
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Link href={`/${locale}/player/coaches/explore`}>
                  <GradientButton size="lg" variant="emerald" className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    {t('actions.find')}
                  </GradientButton>
                </Link>
                <Link href={`/${locale}/player/dashboard`}>
                  <Button variant="ghost" className="text-emerald-100 hover:text-white">
                    {t('actions.backToDashboard')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <GlassCard className="border-emerald-500/20 bg-slate-900/60 p-6">
              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-wider text-emerald-300">
                  {t('empty.guide.badge')}
                </p>
                <h3 className="text-2xl font-semibold text-white">
                  {t('empty.guide.title')}
                </h3>
                <p className="text-sm text-slate-300/90 leading-relaxed">
                  {t('empty.guide.description')}
                </p>

                <div className="space-y-3">
                  {['step1', 'step2', 'step3'].map((stepKey, index) => (
                    <div key={stepKey} className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/90">
                          {t(`empty.guide.${stepKey}.title`)}
                        </p>
                        <p className="text-xs text-slate-300/80 mt-1">
                          {t(`empty.guide.${stepKey}.description`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-8">
          <PlayerCoachesList coaches={coaches} />
        </div>
      )}
    </PlayerLayout>
  );
}
