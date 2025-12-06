'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { useTranslations } from 'next-intl';
import { Calendar, Clock, User, Loader2, Package, Globe, Filter } from 'lucide-react';
import { SessionActionsButtons } from '@/components/sessions/SessionActionsButtons';
import Image from 'next/image';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { GlassCard, GradientText } from '@/components/ui';
import { useTimezone } from '@/hooks/useTimezone';
import { formatTimezoneDisplay } from '@/lib/timezone';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/button';

type FilterType = 'all' | 'upcoming' | 'past';

interface Reservation {
  id: string;
  startDate: Date;
  endDate: Date;
  status: string;
  type: 'reservation' | 'pack-session';
  discordChannelId?: string | null;
  coachId: string;
  coach: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    slug: string;
    planKey?: string | null;
  };
  announcement: {
    title: string;
    durationMin?: number;
  };
  packageInfo?: {
    totalHours: number;
    remainingHours: number;
  };
}

export default function PlayerSessionsPage() {
  const router = useRouter();
  const t = useTranslations('player.sessions');
  const { data: session, isPending } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [playerDiscordId, setPlayerDiscordId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const { timezone, formatLocal, isLoaded: timezoneLoaded } = useTimezone();

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/sign-in');
      return;
    }

    if (session) {
      fetchReservations();
    }
  }, [session, isPending, router]);

  const fetchReservations = async () => {
    try {
      // Récupérer toutes les sessions (upcoming + past)
      const response = await fetch('/api/player/sessions');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des sessions');
      }

      const data = await response.json();
      const { upcoming = [], past = [], playerDiscordId: discordId = null } = data;
      
      // Sauvegarder le discordId du joueur
      setPlayerDiscordId(discordId);

      // Combiner et formater toutes les sessions
      const allSessions: Reservation[] = [...upcoming, ...past].map((r: {
        id: string;
        startDate: string;
        endDate: string;
        status: string;
        paymentStatus?: string;
        packId: string | null;
        discordChannelId?: string | null;
        coachId: string;
        coach: {
          id: string;
          firstName: string;
          lastName: string;
          avatarUrl: string | null;
          planKey?: string | null;
        };
        announcement: {
          title: string;
          durationMin: number;
        };
        pack?: {
          hours: number;
        };
        coachingPackage?: {
          id: string;
          totalHours: number;
          remainingHours: number;
          sessionsCompletedCount: number;
          sessionsTotalCount: number;
          progressPercent: number;
        };
      }) => ({
        id: r.id,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        status: r.status,
        paymentStatus: r.paymentStatus,
        type: r.packId ? 'pack-session' : 'reservation',
        discordChannelId: r.discordChannelId || null,
        coachId: r.coachId,
        coach: {
          id: r.coach.id,
          firstName: r.coach.firstName,
          lastName: r.coach.lastName,
          avatarUrl: r.coach.avatarUrl,
          slug: '',
          planKey: r.coach.planKey,
        },
        announcement: {
          title: r.announcement.title,
          durationMin: r.announcement.durationMin,
        },
        packageInfo: r.coachingPackage ? {
          totalHours: r.coachingPackage.totalHours,
          remainingHours: r.coachingPackage.remainingHours,
        } : undefined,
      }));

      setReservations(allSessions);
    } catch (error) {
      console.error('Erreur chargement sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <PlayerLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PlayerLayout>
    );
  }

  if (!session) {
    return null;
  }

  // Séparer les sessions futures et passées
  const now = new Date();
  const upcomingSessions = reservations.filter(r => new Date(r.startDate) >= now);
  const pastSessions = reservations.filter(r => new Date(r.startDate) < now);

  // Appliquer le filtre
  const getFilteredSessions = () => {
    switch (filter) {
      case 'upcoming':
        return upcomingSessions;
      case 'past':
        return pastSessions;
      default:
        return reservations;
    }
  };

  const filteredSessions = getFilteredSessions();

  // Helper pour afficher le badge de statut
  const getStatusBadge = (reservation: Reservation) => {
    const isPast = new Date(reservation.startDate) < now;

    if (reservation.status === 'COMPLETED' || isPast) {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400 border border-gray-500/30">
          Terminée
        </span>
      );
    }

    // CONFIRMED ou PENDING (anciennes réservations LITE) = Confirmée
    if (reservation.status === 'CONFIRMED' || reservation.status === 'PENDING') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
          {t('status.confirmed')}
        </span>
      );
    }

    return (
      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
        {t('status.pending')}
      </span>
    );
  };

  return (
    <PlayerLayout>
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <GradientText variant="emerald">{t('title')}</GradientText>
            </h1>
            <p className="text-gray-400 text-lg">
              {t('subtitle')}
            </p>
          </div>
          {timezoneLoaded && (
            <Tooltip content={t('timezone')} position="bottom">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg cursor-help">
                <Globe className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {formatTimezoneDisplay(timezone)}
                </span>
              </div>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-400" />
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
            className={filter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            Toutes ({reservations.length})
          </Button>
          <Button
            variant={filter === 'upcoming' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('upcoming')}
            className={filter === 'upcoming' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
          >
            À venir ({upcomingSessions.length})
          </Button>
          <Button
            variant={filter === 'past' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('past')}
            className={filter === 'past' ? 'bg-gray-600 hover:bg-gray-700' : ''}
          >
            Passées ({pastSessions.length})
          </Button>
        </div>
      </div>

      {/* Liste des sessions filtrées */}
      {filteredSessions.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <p className="text-gray-300">
            {filter === 'upcoming' ? t('upcoming.empty') : filter === 'past' ? 'Aucune session passée' : 'Aucune session'}
          </p>
          {filter === 'upcoming' && (
            <p className="text-sm text-gray-400 mt-2">
              {t('upcoming.emptyHint')}
            </p>
          )}
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {filteredSessions.map((reservation) => {
            const isPast = new Date(reservation.startDate) < now;
            return (
              <GlassCard
                key={reservation.id}
                className={`p-6 transition-all ${isPast ? 'opacity-60' : 'hover:border-emerald-500/30'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {reservation.coach.avatarUrl && (
                        <Image
                          src={reservation.coach.avatarUrl}
                          alt={`${reservation.coach.firstName} ${reservation.coach.lastName}`}
                          width={40}
                          height={40}
                          className={`w-10 h-10 rounded-full ${isPast ? 'grayscale' : ''}`}
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-white">
                            {reservation.announcement.title}
                          </h3>
                          {reservation.type === 'pack-session' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                              <Package className="h-3 w-3" />
                              {t('pack')}
                            </span>
                          )}
                          {reservation.coach.planKey === 'LITE' ? (
                            <Tooltip content="Coach LITE : Le paiement s'effectue directement avec le coach" position="top">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs font-medium rounded border border-blue-500/30 cursor-help">
                                💡 LITE
                              </span>
                            </Tooltip>
                          ) : (
                            <Tooltip content="Coach PRO : Paiement sécurisé via Edgemy" position="top">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded border border-amber-500/30 cursor-help">
                                ⭐ PRO
                              </span>
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {t('with')} {reservation.coach.firstName} {reservation.coach.lastName}
                        </p>
                        {reservation.packageInfo && (
                          <div className="mt-2 p-2 bg-purple-500/10 rounded-lg border border-purple-500/30">
                            <p className="text-xs text-purple-300 mb-1">
                              {t('packRemaining', { remaining: reservation.packageInfo.remainingHours.toFixed(1), total: reservation.packageInfo.totalHours })}
                            </p>
                            <div className="w-full bg-purple-900/50 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${((reservation.packageInfo.totalHours - reservation.packageInfo.remainingHours) / reservation.packageInfo.totalHours) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-300 mt-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatLocal(reservation.startDate, "EEEE d MMMM yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatLocal(reservation.startDate, "HH:mm")}
                        {' - '}
                        {formatLocal(reservation.endDate, "HH:mm")}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(reservation)}

                    {/* Bouton Discord uniquement */}
                    <SessionActionsButtons
                      discordChannelId={reservation.discordChannelId || null}
                      playerHasDiscord={!!playerDiscordId}
                    />
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
    </PlayerLayout>
  );
}
