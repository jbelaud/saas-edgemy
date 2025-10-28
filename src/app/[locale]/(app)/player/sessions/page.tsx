'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, Clock, User, Loader2, Package } from 'lucide-react';
import Image from 'next/image';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';

interface Reservation {
  id: string;
  startDate: Date;
  endDate: Date;
  status: string;
  type: 'reservation' | 'pack-session';
  coach: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatarUrl: string | null;
    slug: string;
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
  const { data: session, isPending } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const { upcoming = [], past = [] } = data;

      // Combiner et formater toutes les sessions
      const allSessions: Reservation[] = [...upcoming, ...past].map((r: {
        id: string;
        startDate: string;
        endDate: string;
        status: string;
        packId: string | null;
        coach: {
          id: string;
          firstName: string;
          lastName: string;
          avatarUrl: string | null;
        };
        announcement: {
          title: string;
          durationMin: number;
        };
        pack?: {
          hours: number;
        };
      }) => ({
        id: r.id,
        startDate: new Date(r.startDate),
        endDate: new Date(r.endDate),
        status: r.status,
        type: r.packId ? 'pack-session' : 'reservation',
        coach: {
          id: r.coach.id,
          firstName: r.coach.firstName,
          lastName: r.coach.lastName,
          avatarUrl: r.coach.avatarUrl,
          slug: '', // TODO: ajouter slug dans l'API
        },
        announcement: {
          title: r.announcement.title,
          durationMin: r.announcement.durationMin,
        },
        packageInfo: r.pack ? {
          totalHours: r.pack.hours,
          remainingHours: r.pack.hours, // TODO: calculer les heures restantes
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
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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

  return (
    <PlayerLayout>
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Sessions</h1>
        <p className="text-gray-600 mt-2">
          Consultez vos sessions de coaching réservées
        </p>
      </div>

      <div className="space-y-8">
        {/* Prochaines sessions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Prochaines sessions ({upcomingSessions.length})
          </h2>
          
          {upcomingSessions.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-8 text-center">
              <p className="text-gray-500">Aucune session à venir</p>
              <p className="text-sm text-gray-400 mt-2">
                Explorez les coachs disponibles pour réserver une session
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcomingSessions.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
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
                            className="w-10 h-10 rounded-full"
                          />
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">
                              {reservation.announcement.title}
                            </h3>
                            {reservation.type === 'pack-session' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                                <Package className="h-3 w-3" />
                                Pack
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <User className="h-4 w-4" />
                            avec {reservation.coach.firstName} {reservation.coach.lastName}
                          </p>
                          {reservation.packageInfo && (
                            <p className="text-xs text-purple-600 mt-1">
                              Heures restantes: {reservation.packageInfo.remainingHours}h / {reservation.packageInfo.totalHours}h
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(reservation.startDate), "EEEE d MMMM yyyy", { locale: fr })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(reservation.startDate), "HH:mm", { locale: fr })}
                          {' - '}
                          {format(new Date(reservation.endDate), "HH:mm", { locale: fr })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        reservation.status === 'CONFIRMED' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {reservation.status === 'CONFIRMED' ? 'Confirmée' : 'En attente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sessions passées */}
        {pastSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Sessions passées ({pastSessions.length})
            </h2>
            
            <div className="grid gap-4">
              {pastSessions.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-gray-50 shadow-sm rounded-lg p-6 opacity-75"
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
                            className="w-10 h-10 rounded-full grayscale"
                          />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {reservation.announcement.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            avec {reservation.coach.firstName} {reservation.coach.lastName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(reservation.startDate), "d MMMM yyyy", { locale: fr })}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(reservation.startDate), "HH:mm", { locale: fr })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </PlayerLayout>
  );
}
