'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Globe } from 'lucide-react';
import { format, parseISO, isSameDay, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { formatTimezoneDisplay, formatInTimezone } from '@/lib/timezone';
import { useTimezone } from '@/hooks/useTimezone';
import { Tooltip } from '@/components/ui/Tooltip';

interface Availability {
  id: string;
  start: string;
  end: string;
  isBooked?: boolean;
}

interface GroupedAvailability {
  date: Date;
  slots: { start: Date; end: Date; hours: number }[];
  totalHours: number;
}

interface CoachAvailabilityPreviewProps {
  coachId: string;
  coachTimezone: string;
}

export function CoachAvailabilityPreview({ coachId, coachTimezone }: CoachAvailabilityPreviewProps) {
  const [groupedAvailabilities, setGroupedAvailabilities] = useState<GroupedAvailability[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Détecter le fuseau horaire du visiteur (connecté ou non)
  const { timezone: visitorTimezone, toLocalTime, isLoaded: timezoneLoaded } = useTimezone();

  useEffect(() => {
    const fetchAvailabilities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/coach/${coachId}/availability`);
        if (response.ok) {
          const data = await response.json();
          const availabilities: Availability[] = data.availabilities || [];

          // Filtrer les disponibilités non réservées et futures
          const now = new Date();
          const futureAvailabilities = availabilities
            .filter(a => !a.isBooked && new Date(a.start) > now)
            .slice(0, 20); // Limiter aux 20 prochaines

          // Grouper par jour
          const grouped = new Map<string, GroupedAvailability>();

          futureAvailabilities.forEach(avail => {
            // Garder les dates UTC, on les convertira à l'affichage
            const startDateUTC = parseISO(avail.start);
            const endDateUTC = parseISO(avail.end);

            // Convertir pour le groupement par jour uniquement
            const startDate = toLocalTime(startDateUTC);
            const endDate = toLocalTime(endDateUTC);

            const dayKey = format(startOfDay(startDate), 'yyyy-MM-dd');

            const hours = (endDateUTC.getTime() - startDateUTC.getTime()) / (1000 * 60 * 60);

            if (!grouped.has(dayKey)) {
              grouped.set(dayKey, {
                date: startOfDay(startDate),
                slots: [],
                totalHours: 0,
              });
            }

            const group = grouped.get(dayKey)!;
            // Stocker les dates UTC originales
            group.slots.push({ start: startDateUTC, end: endDateUTC, hours });
            group.totalHours += hours;
          });

          // Convertir en tableau et trier par date
          const sortedGroups = Array.from(grouped.values())
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .slice(0, 7); // Limiter à 7 jours

          setGroupedAvailabilities(sortedGroups);
        }
      } catch (error) {
        console.error('Erreur chargement disponibilités:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailabilities();
  }, [coachId]);

  const handleViewOffers = () => {
    const offersSection = document.getElementById('offers');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Disponibilités à venir</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
        </div>
      </div>
    );
  }

  if (groupedAvailabilities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Disponibilités à venir</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">Aucune disponibilité pour le moment</p>
          <p className="text-gray-400 text-xs mt-1">Revenez bientôt !</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Disponibilités à venir</h3>
        </div>
        {timezoneLoaded && (
          <Tooltip content="Les horaires sont affichés dans votre fuseau horaire" position="bottom">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg cursor-help">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {formatTimezoneDisplay(visitorTimezone)}
              </span>
            </div>
          </Tooltip>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {groupedAvailabilities.map((group, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 hover:border-amber-300 transition-all hover:shadow-md"
          >
            {/* En-tête du jour */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b border-amber-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center shadow-sm">
                  <span className="text-xs text-amber-600 font-medium uppercase">
                    {format(group.date, 'MMM', { locale: fr })}
                  </span>
                  <span className="text-lg font-bold text-amber-900">
                    {format(group.date, 'd')}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 capitalize text-sm leading-tight">
                  {format(group.date, 'EEEE', { locale: fr })}
                </h4>
                <p className="text-xs text-gray-600">
                  {format(group.date, 'd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            {/* Plages horaires */}
            <div className="space-y-2 mb-3">
              {group.slots.map((slot, slotIdx) => (
                <div key={slotIdx} className="flex items-center gap-2 text-sm bg-white rounded-lg px-3 py-2 shadow-sm">
                  <Clock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  <span className="font-medium text-gray-900">
                    {formatInTimezone(slot.start, visitorTimezone, 'HH:mm')} - {formatInTimezone(slot.end, visitorTimezone, 'HH:mm')}
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {slot.hours.toFixed(1)}h
                  </span>
                </div>
              ))}
            </div>

            {/* Total heures */}
            <div className="text-center py-2 bg-amber-100 rounded-lg">
              <span className="text-xs font-bold text-amber-800">
                {group.totalHours.toFixed(1)}h disponibles
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bouton voir offres */}
      <button
        onClick={handleViewOffers}
        className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md"
      >
        Voir les offres et réserver →
      </button>

      {/* Note */}
      <p className="text-xs text-gray-500 text-center mt-3 italic">
        Créneaux affichés selon les disponibilités générales du coach
      </p>
    </div>
  );
}
