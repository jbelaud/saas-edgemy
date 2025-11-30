'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
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
import { fr } from 'date-fns/locale';
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
  const [data, setData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  // Filtres
  // Par défaut, afficher uniquement les sessions payées pour le coach
  const [periodFilter, setPeriodFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [studentFilter, setStudentFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'unpaid'>('paid');

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

  const getStatusBadge = (session: Session) => {
    const isPast = new Date(session.endDate) <= new Date();

    if (session.status === 'COMPLETED') {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-500/40">
          <CheckCircle className="h-3 w-3 mr-1" />
          Complétée
        </Badge>
      );
    }

    if (isPast && session.status === 'CONFIRMED') {
      return (
        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
          <CheckCircle className="h-3 w-3 mr-1" />
          Terminée
        </Badge>
      );
    }

    if (session.type === 'package_session' && session.status === 'SCHEDULED') {
      return (
        <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40">
          <Clock className="h-3 w-3 mr-1" />
          Planifiée
        </Badge>
      );
    }

    return (
      <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40">
        <Clock className="h-3 w-3 mr-1" />
        À venir
      </Badge>
    );
  };

  const getPaymentBadge = (session: Session) => {
    if (session.paymentStatus === 'PAID') {
      return (
        <Badge className="bg-green-500/10 text-green-400 border-green-500/30">
          <CreditCard className="h-3 w-3 mr-1" />
          Payé
        </Badge>
      );
    }

    if (session.paymentStatus === 'EXTERNAL_PAID') {
      return (
        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
          <CreditCard className="h-3 w-3 mr-1" />
          Payé (externe)
        </Badge>
      );
    }

    if (session.paymentStatus === 'PENDING' || session.paymentStatus === 'EXTERNAL_PENDING') {
      return (
        <Badge className="bg-orange-500/10 text-orange-400 border-orange-500/30">
          <AlertCircle className="h-3 w-3 mr-1" />
          Non payé
        </Badge>
      );
    }

    if (session.paymentStatus === 'FAILED') {
      return (
        <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
          <AlertCircle className="h-3 w-3 mr-1" />
          Échoué
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

    // Filtre par statut de paiement
    if (paymentFilter === 'paid' && session.paymentStatus !== 'PAID' && session.paymentStatus !== 'EXTERNAL_PAID') return false;
    if (paymentFilter === 'unpaid' && (session.paymentStatus === 'PAID' || session.paymentStatus === 'EXTERNAL_PAID')) return false;

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
            Mes Sessions
          </GradientText>
          <p className="text-gray-400">
            Gérez toutes vos sessions passées et à venir
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
                  <p className="text-sm text-gray-400">Total sessions</p>
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
                  <p className="text-sm text-gray-400">À venir</p>
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
                  <p className="text-sm text-gray-400">Complétées</p>
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
                <h3 className="text-lg font-bold text-white">Filtres</h3>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Période</label>
                <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as 'all' | 'week' | 'month' | 'year')}>
                  <SelectTrigger className="text-white w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les périodes</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Type</label>
                <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | 'upcoming' | 'past')}>
                  <SelectTrigger className="text-white w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="upcoming">À venir</SelectItem>
                    <SelectItem value="past">Passées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Élève</label>
                <Select value={studentFilter} onValueChange={setStudentFilter}>
                  <SelectTrigger className="text-white w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les élèves</SelectItem>
                    {data?.students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name || student.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Paiement</label>
                <Select value={paymentFilter} onValueChange={(value) => setPaymentFilter(value as 'all' | 'paid' | 'unpaid')}>
                  <SelectTrigger className="text-white w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="paid">Payées</SelectItem>
                    <SelectItem value="unpaid">Non payées</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </GlassCard>

          {/* Liste des sessions */}
          {displayedSessions.length === 0 ? (
            <GlassCard className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-white mb-2">Aucune session</p>
              <p className="text-gray-400">
                Aucune session ne correspond aux filtres sélectionnés
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
                              {session.player.name || 'Joueur'}
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
                              {format(new Date(session.startDate), 'PPP', { locale: fr })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(session.startDate), 'HH:mm', { locale: fr })}
                            </div>
                            <div>
                              Durée: {session.durationMinutes}min
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
                                      🎯 1ère session
                                    </Badge>
                                  )}
                                  {/* Heures cumulatives utilisées */}
                                  {session.cumulativeHoursUsed !== null && (
                                    <span className="text-xs font-medium text-purple-300">
                                      {session.cumulativeHoursUsed.toFixed(1)}h utilisées / {session.coachingPackage.totalHours}h
                                    </span>
                                  )}
                                </div>
                                {/* Durée de cette session */}
                                {session.sessionDurationHours !== null && (
                                  <span className="text-xs text-gray-400">
                                    Cette session: {session.sessionDurationHours.toFixed(1)}h
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
          title="Détails de la session"
          maxWidth="lg"
        >
          <div className="space-y-6">
            {/* Élève */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Élève</h3>
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
                    {selectedSession.player.name || 'Joueur'}
                  </p>
                  <p className="text-sm text-gray-400">{selectedSession.player.email}</p>
                </div>
              </div>
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Date</h3>
                <p className="text-white">
                  {format(new Date(selectedSession.startDate), 'PPP', { locale: fr })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-2">Heure</h3>
                <p className="text-white">
                  {format(new Date(selectedSession.startDate), 'HH:mm', { locale: fr })} - {format(new Date(selectedSession.endDate), 'HH:mm', { locale: fr })}
                </p>
              </div>
            </div>

            {/* Durée */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Durée</h3>
              <p className="text-white">{selectedSession.durationMinutes} minutes</p>
            </div>

            {/* Type de session */}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-2">Type</h3>
              <p className="text-white">
                {selectedSession.announcement.title}
              </p>
            </div>

            {/* Informations pack */}
            {selectedSession.coachingPackage && (
              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <h3 className="text-sm font-semibold text-purple-300 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Informations du pack
                  {selectedSession.isFirstSession && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs ml-2">
                      1ère session
                    </Badge>
                  )}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Heures totales</span>
                    <span className="text-white font-semibold">
                      {selectedSession.coachingPackage.totalHours}h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cette session</span>
                    <span className="text-white font-semibold">
                      {selectedSession.sessionDurationHours?.toFixed(1) || (selectedSession.durationMinutes / 60).toFixed(1)}h
                    </span>
                  </div>
                  {selectedSession.cumulativeHoursUsed !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Heures utilisées (cumul)</span>
                      <span className="text-white font-semibold">
                        {selectedSession.cumulativeHoursUsed.toFixed(1)}h / {selectedSession.coachingPackage.totalHours}h
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Heures restantes (pack)</span>
                    <span className="text-white font-semibold">
                      {selectedSession.coachingPackage.remainingHours.toFixed(1)}h
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progression</span>
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
                Ouvrir le canal Discord
              </Button>
            )}
          </div>
        </Modal>
      )}
    </CoachLayout>
  );
}
