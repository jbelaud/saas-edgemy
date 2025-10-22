'use client';

import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { fr } from 'date-fns/locale';

interface TimezoneBadgeProps {
  date: Date | string;
  coachTimezone?: string; // ex: "America/Montreal"
  showDate?: boolean;
}

export function TimezoneBadge({ 
  date, 
  coachTimezone = 'Europe/Paris',
  showDate = false 
}: TimezoneBadgeProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Convertir en heure locale du coach
  const coachTime = toZonedTime(dateObj, coachTimezone);
  
  // Convertir en heure française (Europe/Paris)
  const parisTime = toZonedTime(dateObj, 'Europe/Paris');
  
  const coachTimeStr = format(coachTime, 'HH:mm');
  const parisTimeStr = format(parisTime, 'HH:mm');
  
  // Si les deux fuseaux sont identiques, afficher une seule fois
  const isSameTimezone = coachTimeStr === parisTimeStr;
  
  return (
    <div className="inline-flex items-center gap-2 text-sm">
      <Clock className="h-4 w-4 text-gray-500" />
      <div className="flex items-center gap-2">
        {showDate && (
          <span className="font-medium text-gray-700">
            {format(dateObj, 'EEE d MMM', { locale: fr })}
          </span>
        )}
        <span className="font-medium text-gray-900">
          {coachTimeStr}
        </span>
        {!isSameTimezone && (
          <>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {parisTimeStr} <span className="text-xs text-gray-500">(Paris)</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
