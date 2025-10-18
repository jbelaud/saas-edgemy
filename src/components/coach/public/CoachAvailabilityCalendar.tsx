'use client';

import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface CoachAvailabilityCalendarProps {
  coachId: string;
  isInactive?: boolean;
}

// TODO: Remplacer par de vraies données de disponibilités depuis la DB
const MOCK_AVAILABILITIES = [
  { date: '2025-10-20', slots: ['09:00', '14:00', '16:00'] },
  { date: '2025-10-21', slots: ['10:00', '15:00'] },
  { date: '2025-10-22', slots: ['09:00', '11:00', '14:00', '17:00'] },
  { date: '2025-10-23', slots: ['13:00', '15:00', '18:00'] },
  { date: '2025-10-24', slots: ['09:00', '10:00', '14:00'] },
];

export function CoachAvailabilityCalendar({ isInactive = false }: CoachAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedAvailability = MOCK_AVAILABILITIES.find((a) => a.date === selectedDate);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Disponibilités</h3>
      </div>

      {isInactive && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Coach temporairement indisponible</p>
            <p className="text-xs mt-1">Les réservations sont actuellement suspendues.</p>
          </div>
        </div>
      )}

      {/* Mini calendrier */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">Prochaines disponibilités :</p>
        <div className="grid grid-cols-1 gap-2">
          {MOCK_AVAILABILITIES.slice(0, 5).map((availability) => {
            const date = new Date(availability.date);
            const isSelected = selectedDate === availability.date;
            
            return (
              <button
                key={availability.date}
                onClick={() => setSelectedDate(isSelected ? null : availability.date)}
                disabled={isInactive}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                  ${isInactive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {date.toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {availability.slots.length} créneaux
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Créneaux horaires */}
      {selectedAvailability && !isInactive && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Créneaux disponibles :
          </p>
          <div className="grid grid-cols-2 gap-2">
            {selectedAvailability.slots.map((slot) => (
              <button
                key={slot}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note pour développement futur */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 italic">
          💡 À implémenter : Synchronisation avec Google Calendar / Calendly
        </p>
      </div>
    </div>
  );
}
