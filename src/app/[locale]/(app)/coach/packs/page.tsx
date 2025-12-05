'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useTranslations, useLocale } from 'next-intl';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { GlassCard, GradientText } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, Clock, Loader2, Calendar, TrendingUp, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { SubscriptionGate } from '@/components/coach/dashboard/SubscriptionGate';

interface CoachPackage {
  id: string;
  player: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  announcement: {
    title: string;
  };
  totalHours: number;
  remainingHours: number;
  usedHours: number;
  priceCents: number;
  status: string;
  createdAt: string;
  sessions: {
    id: string;
    startDate: string;
    endDate: string;
    durationMinutes: number;
    status: string;
    reservationStatus?: string;
  }[];
  totalSessions: number;
  completedSessions: number;
}

export default function CoachPacksPage() {
  const { data: session, isPending } = useSession();
  const t = useTranslations('coach.packs');
  const locale = useLocale();
  const dateLocale = locale === 'fr' ? fr : enUS;
  const [packages, setPackages] = useState<CoachPackage[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchCoachProfile();
      fetchPackages();
    }
  }, [session]);

  const fetchCoachProfile = async () => {
    try {
      const response = await fetch('/api/coach/profile');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionStatus(data.coach?.subscriptionStatus || null);
      }
    } catch (error) {
      console.error('Erreur chargement profil coach:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/coach/packages');
      if (response.ok) {
        const data = await response.json();
        setPackages(data.packages || []);
        setStats({
          total: data.total || 0,
          active: data.active || 0,
          completed: data.completed || 0,
        });
      }
    } catch (error) {
      console.error('Erreur chargement packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500/20 text-green-300">{t('status.active')}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-blue-500/20 text-blue-300">{t('status.completed')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSessionStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-500/20 text-green-300">{t('sessionStatus.completed')}</Badge>;
      case 'SCHEDULED':
        return <Badge className="bg-blue-500/20 text-blue-300">{t('sessionStatus.scheduled')}</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500/20 text-red-300">{t('sessionStatus.cancelled')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleCancelSession = async (packageSessionId: string) => {
    if (!confirm(t('cancelConfirm'))) {
      return;
    }

    setCancellingSessionId(packageSessionId);
    try {
      const response = await fetch('/api/coach/cancel-pack-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageSessionId }),
      });

      if (response.ok) {
        // Recharger les packs pour afficher les données mises à jour
        await fetchPackages();
        alert(t('cancelSuccess'));
      } else {
        const data = await response.json();
        alert(`${t('cancelError')}: ${data.error || ''}`);
      }
    } catch (error) {
      console.error('Erreur annulation session:', error);
      alert(t('cancelError'));
    } finally {
      setCancellingSessionId(null);
    }
  };

  if (isPending || isLoading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CoachLayout>
    );
  }


  return (
    <CoachLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <GradientText variant="amber" className="text-4xl font-bold mb-2">
            📦 {t('title')}
          </GradientText>
          <p className="text-gray-400 text-lg">
            {t('subtitle')}
          </p>
        </div>

        <SubscriptionGate isActive={subscriptionStatus === 'ACTIVE'}>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Package className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{t('stats.total')}</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{t('stats.active')}</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">{t('stats.completed')}</p>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Liste des packs */}
        {packages.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium text-white mb-2">{t('empty.title')}</p>
            <p className="text-gray-400">
              {t('empty.description')}
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {packages.map((pkg) => {
              const initials = pkg.player.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U';

              const progressPercent = (pkg.usedHours / pkg.totalHours) * 100;

              return (
                <GlassCard key={pkg.id} className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={pkg.player.image || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Package className="h-5 w-5 text-purple-400" />
                          <h3 className="text-xl font-bold text-white">
                            {t('packTitle', { hours: pkg.totalHours, player: pkg.player.name || t('player') })}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">
                          {pkg.announcement.title}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(pkg.status)}
                          <Badge variant="secondary">
                            {pkg.totalSessions} {pkg.totalSessions > 1 ? t('sessionsPlural') : t('sessions')}
                          </Badge>
                          <Badge variant="secondary">
                            {pkg.completedSessions} {pkg.completedSessions > 1 ? t('completedSessionsPlural') : t('completedSession')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">{t('price')}</p>
                      <p className="text-xl font-bold text-white">
                        {(pkg.priceCents / 100).toFixed(2)} €
                      </p>
                    </div>
                  </div>

                  {/* Progression */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-white">
                        {t('progress')}
                      </p>
                      <p className="text-sm text-gray-400">
                        {t('hoursUsed', { used: pkg.usedHours, total: pkg.totalHours })}
                      </p>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    {pkg.remainingHours > 0 && (
                      <p className="text-xs text-gray-400 mt-1">
                        {t('hoursRemaining', { hours: pkg.remainingHours })}
                      </p>
                    )}
                  </div>

                  {/* Sessions */}
                  {pkg.sessions.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-400" />
                        {t('sessionsTitle', { count: pkg.sessions.length })}
                      </h4>
                      <div className="space-y-2">
                        {pkg.sessions.map((sessionItem, index) => {
                          // La session la plus ancienne (index le plus élevé car tri par desc) est la première
                          const isFirstSession = index === pkg.sessions.length - 1;

                          const canCancel = sessionItem.status === 'SCHEDULED' && new Date(sessionItem.startDate) > new Date();

                          return (
                            <div
                              key={sessionItem.id}
                              className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-white">
                                      {format(new Date(sessionItem.startDate), 'PPP', { locale: dateLocale })}
                                    </p>
                                    {isFirstSession && (
                                      <Badge className="bg-amber-500/20 text-amber-300 text-xs">
                                        {t('firstSession')}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-400">
                                    {format(new Date(sessionItem.startDate), 'HH:mm', { locale: dateLocale })} - {format(new Date(sessionItem.endDate), 'HH:mm', { locale: dateLocale })}
                                    {' '}({sessionItem.durationMinutes}min)
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getSessionStatusBadge(sessionItem.status)}
                                {canCancel && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelSession(sessionItem.id)}
                                    disabled={cancellingSessionId === sessionItem.id}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  >
                                    {cancellingSessionId === sessionItem.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CTA Planifier */}
                  {pkg.remainingHours > 0 && (
                    <Link href={`/${locale}/coach/agenda`}>
                      <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <Calendar className="mr-2 h-4 w-4" />
                        {t('scheduleSession', { hours: pkg.remainingHours })}
                      </Button>
                    </Link>
                  )}

                  {pkg.remainingHours === 0 && (
                    <div className="text-center py-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-sm font-medium text-green-300">
                        ✅ {t('allHoursUsed')}
                      </p>
                    </div>
                  )}
                </GlassCard>
              );
            })}
          </div>
        )}
        </SubscriptionGate>
      </div>
    </CoachLayout>
  );
}
