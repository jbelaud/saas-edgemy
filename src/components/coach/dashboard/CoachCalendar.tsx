'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Package, Ban, Loader2 } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Availability {
  id: string;
  type: 'RECURRING' | 'SPECIFIC' | 'EXCEPTION';
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  specificDate?: Date;
  isBlocked: boolean;
}

interface Reservation {
  id: string;
  startDate: Date;
  endDate: Date;
  status: string;
  player: {
    name: string;
  };
  announcement: {
    title: string;
  };
  packId?: string;
}

interface CoachCalendarProps {
  coachId: string;
}

export function CoachCalendar({ coachId }: CoachCalendarProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [coachId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les disponibilités
      const availResponse = await fetch('/api/coach/availability');
      if (availResponse.ok) {
        const availData = await availResponse.json();
        setAvailabilities(availData.availabilities || []);
      }

      // Récupérer les réservations
      const resResponse = await fetch('/api/reservations');
      if (resResponse.ok) {
        const resData = await resResponse.json();
        setReservations(resData.reservations || []);
      }
    } catch (error) {
      console.error('Erreur chargement données calendrier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Lundi
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Grouper les disponibilités par jour de la semaine
  const availabilitiesByDay = availabilities.reduce((acc, avail) => {
    if (avail.type === 'RECURRING' && avail.dayOfWeek !== undefined) {
      if (!acc[avail.dayOfWeek]) {
        acc[avail.dayOfWeek] = [];
      }
      acc[avail.dayOfWeek].push(avail);
    }
    return acc;
  }, {} as Record<number, Availability[]>);

  // Grouper les réservations par jour
  const reservationsByDate = reservations.reduce((acc, res) => {
    const dateKey = format(new Date(res.startDate), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(res);
    return acc;
  }, {} as Record<string, Reservation[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Mon Calendrier</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Semaine précédente
          </button>
          <button
            onClick={() => setCurrentWeek(new Date())}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Semaine suivante →
          </button>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-200 border border-green-400 rounded"></div>
          <span>Disponibilité</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-orange-200 border border-orange-400 rounded"></div>
          <span>Réservation</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-200 border border-blue-400 rounded"></div>
          <span>Session pack</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-200 border border-red-400 rounded"></div>
          <span>Bloqué</span>
        </div>
      </div>

      {/* Vue hebdomadaire */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const dayOfWeek = day.getDay();
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayAvailabilities = availabilitiesByDay[dayOfWeek] || [];
          const dayReservations = reservationsByDate[dateKey] || [];
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

          return (
            <div
              key={dateKey}
              className={`border rounded-lg p-2 min-h-[200px] ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="text-center mb-2">
                <p className="text-xs font-medium text-gray-600">
                  {format(day, 'EEE', { locale: fr })}
                </p>
                <p className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </p>
              </div>

              <div className="space-y-1">
                {/* Disponibilités */}
                {dayAvailabilities.map((avail) => (
                  <div
                    key={avail.id}
                    className={`text-xs p-1 rounded ${
                      avail.isBlocked
                        ? 'bg-red-100 border border-red-300 text-red-700'
                        : 'bg-green-100 border border-green-300 text-green-700'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {avail.isBlocked ? (
                        <Ban className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      <span>
                        {avail.startTime} - {avail.endTime}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Réservations */}
                {dayReservations.map((res) => (
                  <div
                    key={res.id}
                    className={`text-xs p-1 rounded ${
                      res.packId
                        ? 'bg-blue-100 border border-blue-300 text-blue-700'
                        : 'bg-orange-100 border border-orange-300 text-orange-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-0.5">
                      {res.packId ? (
                        <Package className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      <span className="font-medium truncate">
                        {format(new Date(res.startDate), 'HH:mm')}
                      </span>
                    </div>
                    <p className="truncate text-[10px]">{res.player.name}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions rapides */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            + Ajouter une disponibilité
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            Bloquer un créneau
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
            Planifier une session pack
          </button>
        </div>
      </div>
    </div>
  );
}
