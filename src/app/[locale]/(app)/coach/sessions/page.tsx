'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useTranslations, useLocale } from 'next-intl';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { GlassCard, GradientText, Modal } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Loader2,
  Clock,
  CheckCircle,
  Filter,
  User,
  MessageCircle,
  TrendingUp,
  Calendar as CalendarIcon,
  Euro,
  AlertCircle,
  CreditCard,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { SubscriptionGate } from '@/components/coach/dashboard/SubscriptionGate';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CoachingPackage {
  id: string;
  totalHours: number;
  remainingHours: number;
  sessionsCompletedCount: number;
  sessionsTotalCount: number;
  progressPercent: number;
}

interface Session {
  id: string;
  startDate: string;
  endDate: string;
  status: string;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'EXTERNAL_PENDING' | 'EXTERNAL_PAID';
  priceCents: number;
  coachAmountCents: number;
  type: 'reservation' | 'package_session';
  reservationType: 'SINGLE' | 'PACK';
  discordChannelId: string | null;
  durationMinutes: number;
  // Infos spécifiques aux packs - heures cumulatives
  sessionNumber: number | null;
  isFirstSession: boolean;
  cumulativeHoursUsed: number | null;
  sessionDurationHours: number | null;
  packProgressPercent: number | null;
  player: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  announcement: {
    id: string;
    title: string;
    durationMin: number;
  };
  coachingPackage: CoachingPackage | null;
}

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface ApiResponse {
  sessions: Session[];
  upcoming: Session[];
  past: Session[];
  students: Student[];
  stats: {
    total: number;
    upcoming: number;
    past: number;
  };
}

export default function CoachSessionsPage() {
  const { data: session, isPending } = useSession();
  const t = useTranslations('coach.sessions');
  const locale = useLocale();
  const dateLocale = locale === 'fr' ? fr : enUS;
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  // Filtres
  const [periodFilter, setPeriodFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<'all' | 'single' | 'pack'>('all');

  useEffect(() => {
    if (session?.user) {
      fetchCoachProfile();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchSessions();
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

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      // Récupérer toutes les sessions sans filtres
      const response = await fetch(`/api/coach/sessions-complete`);
      if (response.ok) {
        const data = await response.json();
        setData(data);
      }
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsDetailModalOpen(true);
  };

  const getStatusBadge = (sessionItem: Session) => {
    const isPast = new Date(sessionItem.endDate) <= new Date();

    if (sessionItem.status === 'COMPLETED') {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/40">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('status.completed')}
        </Badge>
      );
    }

    if (isPast && sessionItem.status === 'CONFIRMED') {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('status.finished')}
        </Badge>
      );
    }

    if (sessionItem.type === 'package_session' && sessionItem.status === 'SCHEDULED') {
      return (
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">
          <Clock className="h-3 w-3 mr-1" />
          {t('status.scheduled')}
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">
        <Clock className="h-3 w-3 mr-1" />
        {t('status.upcoming')}
      </Badge>
    );
  };

  const getPaymentBadge = (sessionItem: Session) => {
    const now = new Date();
    const sessionEnd = new Date(sessionItem.endDate);
    const isUpcoming = sessionEnd > now;

    // Session future payée = "Confirmée" (le joueur a payé, session garantie)
    if (isUpcoming && (sessionItem.paymentStatus === 'PAID' || sessionItem.paymentStatus === 'EXTERNAL_PAID')) {
      return (
        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
          <CreditCard className="h-3 w-3 mr-1" />
          {t('status.confirmed')}
        </Badge>
      );
    }

    // Session passée payée = "Payé" (le coach a été/sera payé)
    if (!isUpcoming && sessionItem.paymentStatus === 'PAID') {
      return (
        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
          <CreditCard className="h-3 w-3 mr-1" />
          {t('status.paid')}
        </Badge>
      );
    }

    if (!isUpcoming && sessionItem.paymentStatus === 'EXTERNAL_PAID') {
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
          <CreditCard className="h-3 w-3 mr-1" />
          {t('status.paidExternal')}
        </Badge>
      );
    }

    return null;
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

  // Filtrage côté client pour éviter le rechargement
  const filteredSessions = (data?.sessions || []).filter((session) => {
    const now = new Date();
    const sessionStart = new Date(session.startDate);
    const sessionEnd = new Date(session.endDate);

    // Filtre par type
    if (typeFilter === 'upcoming' && sessionEnd <= now) return false;
    if (typeFilter === 'past' && sessionEnd > now) return false;

    // Filtre par élève
    if (studentFilter !== 'all' && session.player.id !== studentFilter) return false;

    // Filtre par type de session (unique ou pack)
    if (sessionTypeFilter === 'single' && session.reservationType !== 'SINGLE') return false;
    if (sessionTypeFilter === 'pack' && session.reservationType !== 'PACK') return false;

    // Filtre par période
    if (periodFilter !== 'all') {
      const startOfWeekDate = new Date(now);
      startOfWeekDate.setDate(now.getDate() - now.getDay() + 1);
      startOfWeekDate.setHours(0, 0, 0, 0);

      const endOfWeekDate = new Date(startOfWeekDate);
      endOfWeekDate.setDate(startOfWeekDate.getDate() + 6);
      endOfWeekDate.setHours(23, 59, 59, 999);

      const startOfMonthDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const startOfYearDate = new Date(now.getFullYear(), 0, 1);
      const endOfYearDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

      if (periodFilter === 'week') {
        if (sessionStart < startOfWeekDate || sessionStart > endOfWeekDate) return false;
      } else if (periodFilter === 'month') {
        if (sessionStart < startOfMonthDate || sessionStart > endOfMonthDate) return false;
      } else if (periodFilter === 'year') {
        if (sessionStart < startOfYearDate || sessionStart > endOfYearDate) return false;
      }
    }

    return true;
  });

  const displayedSessions = filteredSessions;

  // Recalculer les stats basées sur les sessions filtrées
  const filteredStats = {
    total: filteredSessions.length,
    upcoming: filteredSessions.filter(s => new Date(s.endDate) > new Date()).length,
    past: filteredSessions.filter(s => new Date(s.endDate) <= new Date()).length,
  };

  return (
    <CoachLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <GradientText className="text-4xl font-bold mb-2">
            {t('title')}
          </GradientText>
          <p className="text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <SubscriptionGate isActive={subscriptionStatus === 'ACTIVE'}>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t('stats.total')}</p>
                  <p className="text-2xl font-bold text-white">{filteredStats.total}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t('stats.upcoming')}</p>
                  <p className="text-2xl font-bold text-white">{filteredStats.upcoming}</p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">{t('stats.completed')}</p>
                  <p className="text-2xl font-bold text-white">{filteredStats.past}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Filtres */}
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-purple-400" />
                <h3 className="text-lg font-bold text-white">{t('filters.title')}</h3>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">{t('filters.period')}</label>
                <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as 'all' | 'week' | 'month' | 'year')}>
                  <SelectTrigger className="text-white w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allPeriods')}</SelectItem>
                    <SelectItem value="week">{t('filters.thisWeek')}</SelectItem>
                    <SelectItem value="month">{t('filters.thisMonth')}</SelectItem>
                    <SelectItem value="year">{t('filters.thisYear')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">{t('filters.status')}</label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | 'upcoming' | 'past')}>
                  <SelectTrigger className="text-white w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.all')}</SelectItem>
                    <SelectItem value="upcoming">{t('filters.upcomingOnly')}</SelectItem>
                    <SelectItem value="past">{t('filters.pastOnly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">{t('filters.student')}</label>
                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger className="text-white w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allStudents')}</SelectItem>
                    {data?.students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name || student.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">{t('filters.type')}</label>
                <Select value={sessionTypeFilter} onValueChange={(value) => setSessionTypeFilter(value as 'all' | 'single' | 'pack')}>
                  <SelectTrigger className="text-white w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('filters.allTypes')}</SelectItem>
                    <SelectItem value="single">{t('filters.singleSession')}</SelectItem>
                    <SelectItem value="pack">{t('filters.pack')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>

          {/* Liste des sessions */}
          {displayedSessions.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-white mb-2">{t('empty.title')}</p>
              <p className="text-gray-400">
                {t('empty.description')}
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {displayedSessions.map((session) => {
                const initials = session.player.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'U';

                return (
                  <GlassCard
                    key={session.id}
                    className="p-4 cursor-pointer hover:bg-white/5 transition-all"
                    onClick={() => handleSessionClick(session)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Info principale */}
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={session.player.image || undefined} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="font-semibold text-white">
                              {session.player.name || t('player')}
                            </p>
                            {getStatusBadge(session)}
                            {getPaymentBadge(session)}
                            {session.coachAmountCents > 0 && (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                                <Euro className="h-3 w-3 mr-1" />
                                {(session.coachAmountCents / 100).toFixed(0)}€
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-gray-400 mb-2">
                            {session.announcement.title}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(session.startDate), 'PPP', { locale: dateLocale })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(session.startDate), 'HH:mm', { locale: dateLocale })}
                            </div>
                            <div>
                              {t('duration')}: {t('durationMinutes', { minutes: session.durationMinutes })}
                            </div>
                          </div>

                          {/* Info pack si applicable - Affichage heures cumulatives */}
                          {session.coachingPackage && (
                            <div className="mt-3 p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {/* Badge 1ère session */}
                                  {session.isFirstSession && (
                                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                                      🎯 {t('firstSession')}
                                    </Badge>
                                  )}
                                  {/* Heures cumulatives utilisées */}
                                  {session.cumulativeHoursUsed !== null && (
                                    <span className="text-xs font-medium text-purple-300">
                                      {t('hoursUsed', { used: session.cumulativeHoursUsed.toFixed(1), total: session.coachingPackage.totalHours })}
                                    </span>
                                  )}
                                </div>
                                {/* Durée de cette session */}
                                {session.sessionDurationHours !== null && (
                                  <span className="text-xs text-gray-400">
                                    {t('thisSession', { hours: session.sessionDurationHours.toFixed(1) })}
                                  </span>
                                )}
                              </div>
                              {/* Barre de progression basée sur les heures cumulatives */}
                              <div className="w-full bg-purple-900/50 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                                  style={{ 
                                    width: `${session.packProgressPercent !== null 
                                      ? Math.min(session.packProgressPercent, 100)
                                      : session.coachingPackage.progressPercent}%` 
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {session.discordChannelId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`https://discord.com/channels/${session.discordChannelId}`, '_blank');
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Discord
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </SubscriptionGate>
      </div>

      {/* Modal de détails */}
      {selectedSession && (
        <Modal
          open={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedSession(null);
          }}
          title={t('modal.title')}
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Élève */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('modal.student')}</h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedSession.player.image || undefined} />
                  <AvatarFallback>
                    {selectedSession.player.name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">
                    {selectedSession.player.name || t('player')}
                  </p>
                  <p className="text-sm text-gray-400">{selectedSession.player.email}</p>
                </div>
              </div>
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('modal.date')}</h3>
                <p className="text-white">
                  {format(new Date(selectedSession.startDate), 'PPP', { locale: dateLocale })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('modal.time')}</h3>
                <p className="text-white">
                  {format(new Date(selectedSession.startDate), 'HH:mm', { locale: dateLocale })} - {format(new Date(selectedSession.endDate), 'HH:mm', { locale: dateLocale })}
                </p>
              </div>
            </div>

            {/* Durée */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('modal.duration')}</h3>
              <p className="text-white">{t('modal.minutes', { minutes: selectedSession.durationMinutes })}</p>
            </div>

            {/* Type de session */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('modal.type')}</h3>
              <p className="text-white">
                {selectedSession.announcement.title}
              </p>
            </div>

            {/* Informations pack */}
            {selectedSession.coachingPackage && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  {t('modal.packInfo.title')}
                  {selectedSession.isFirstSession && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs ml-2">
                      {t('firstSession')}
                    </Badge>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('modal.packInfo.totalHours')}</span>
                    <span className="text-white font-semibold">
                      {selectedSession.coachingPackage.totalHours}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('modal.packInfo.thisSession')}</span>
                    <span className="text-white font-semibold">
                      {selectedSession.sessionDurationHours?.toFixed(1) || (selectedSession.durationMinutes / 60).toFixed(1)}h
                    </span>
                  </div>
                  {selectedSession.cumulativeHoursUsed !== null && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('modal.packInfo.hoursUsed')}</span>
                        <span className="text-white font-semibold">
                          {selectedSession.cumulativeHoursUsed.toFixed(1)}h / {selectedSession.coachingPackage.totalHours}h
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">{t('modal.packInfo.hoursRemaining')}</span>
                        <span className="text-white font-semibold">
                          {(selectedSession.coachingPackage.totalHours - selectedSession.cumulativeHoursUsed).toFixed(1)}h
                        </span>
                      </div>
                    </>
                  )}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{t('modal.packInfo.progress')}</span>
                      <span>{(selectedSession.packProgressPercent ?? selectedSession.coachingPackage.progressPercent).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-purple-900/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(selectedSession.packProgressPercent ?? selectedSession.coachingPackage.progressPercent, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {selectedSession.discordChannelId && (
              <Button
                className="w-full"
                onClick={() => {
                  window.open(`https://discord.com/channels/${selectedSession.discordChannelId}`, '_blank');
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {t('modal.openDiscord')}
              </Button>
            )}
          </div>
        </Modal>
      )}
    </CoachLayout>
  );
}
