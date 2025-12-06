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

      {/* Liste des disponibilités */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {groupedAvailabilities.map((group, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100"
          >
            {/* En-tête du jour */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex flex-col items-center justify-center shadow-sm flex-shrink-0">
                <span className="text-[10px] text-amber-600 font-medium uppercase leading-none">
                  {format(group.date, 'MMM', { locale: fr })}
                </span>
                <span className="text-base font-bold text-amber-900 leading-none">
                  {format(group.date, 'd')}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 capitalize text-sm">
                  {format(group.date, 'EEEE d MMMM', { locale: fr })}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                  {group.totalHours.toFixed(0)}h dispo
                </span>
              </div>
            </div>

            {/* Créneaux horaires en ligne */}
            <div className="flex flex-wrap gap-2">
              {group.slots.map((slot, slotIdx) => (
                <div 
                  key={slotIdx} 
                  className="inline-flex items-center gap-1.5 text-sm bg-white rounded-lg px-3 py-1.5 border border-amber-200"
                >
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span className="font-medium text-gray-800">
                    {formatInTimezone(slot.start, visitorTimezone, 'HH:mm')} - {formatInTimezone(slot.end, visitorTimezone, 'HH:mm')}
                  </span>
                </div>
              ))}
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
