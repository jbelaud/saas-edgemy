'use client';

import { Calendar, Clock, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format, parseISO, startOfWeek, addDays, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTimezone } from '@/hooks/useTimezone';
import { formatTimezoneDisplay } from '@/lib/timezone';

interface Availability {
  id: string;
  start: string;
  end: string;
  isBooked: boolean;
}

interface CoachCalendarProps {
  coachId: string;
  coachName: string;
  sessionDuration?: number; // Durée par défaut des sessions en minutes (optionnel)
}

export function CoachCalendar({ coachId, coachName, sessionDuration = 60 }: CoachCalendarProps) {
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Utiliser le fuseau horaire du joueur (détecté automatiquement)
  const { timezone, toLocalTime, formatLocal, isLoaded: timezoneLoaded } = useTimezone();

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        // Découper les disponibilités en créneaux de la durée spécifiée
        const response = await fetch(`/api/coach/${coachId}/availability?duration=${sessionDuration}`);
        if (response.ok) {
          const data = await response.json();
          setAvailabilities(data.availabilities || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des disponibilités:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailabilities();
  }, [coachId, sessionDuration]);

  // Obtenir les 7 prochains jours
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Filtrer les disponibilités du jour sélectionné (en utilisant le fuseau horaire du joueur)
  const selectedDayAvailabilities = availabilities.filter((availability) => {
    // Convertir l'heure UTC en heure locale du joueur
    const availabilityDate = toLocalTime(availability.start);
    return isSameDay(availabilityDate, selectedDate);
  });

  // Compter les créneaux disponibles par jour
  const getAvailableCount = (day: Date) => {
    return availabilities.filter((availability) => {
      const availabilityDate = toLocalTime(availability.start);
      return isSameDay(availabilityDate, day) && !availability.isBooked;
    }).length;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Disponibilités</h2>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (availabilities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900">Disponibilités</h2>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {coachName} n&apos;a pas encore configuré ses disponibilités.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-amber-500" />
            <h2 className="text-2xl font-bold text-gray-900">Disponibilités</h2>
          </div>
          {timezoneLoaded && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {formatTimezoneDisplay(timezone)}
              </span>
            </div>
          )}
        </div>

        {/* Sélecteur de jour */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((day) => {
            const availableCount = getAvailableCount(day);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`p-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-md'
                    : availableCount > 0
                    ? 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                    : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                }`}
                disabled={availableCount === 0}
              >
                <div className="text-xs font-medium uppercase">
                  {format(day, 'EEE', { locale: fr })}
                </div>
                <div className={`text-lg font-bold ${isToday && !isSelected ? 'text-amber-500' : ''}`}>
                  {format(day, 'd')}
                </div>
                {availableCount > 0 && (
                  <div className={`text-xs ${isSelected ? 'text-amber-100' : 'text-amber-600'}`}>
                    {availableCount} créneau{availableCount > 1 ? 'x' : ''}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Créneaux horaires du jour sélectionné */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
          </h3>
          {selectedDayAvailabilities.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Aucun créneau disponible ce jour</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {selectedDayAvailabilities.map((availability) => {
                // Convertir les heures UTC en heure locale du joueur pour l'affichage
                const startTime = formatLocal(availability.start, 'HH:mm');
                const endTime = formatLocal(availability.end, 'HH:mm');

                return (
                  <div
                    key={availability.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      availability.isBooked
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className={`h-4 w-4 ${availability.isBooked ? 'text-gray-400' : 'text-emerald-600'}`} />
                      <span className={`font-medium ${availability.isBooked ? 'text-gray-500' : 'text-gray-900'}`}>
                        {startTime} - {endTime}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded ${
                        availability.isBooked
                          ? 'bg-gray-200 text-gray-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {availability.isBooked ? 'Réservé' : 'Disponible'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
