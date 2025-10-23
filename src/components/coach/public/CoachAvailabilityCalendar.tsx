'use client';

import { Calendar, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Slot {
  start: string;
  end: string;
}

interface CoachAvailabilityCalendarProps {
  coachId: string;
  announcementId?: string;
  onSelectSlot?: (slot: Slot) => void;
  isInactive?: boolean;
}

export function CoachAvailabilityCalendar({ 
  coachId, 
  announcementId, 
  onSelectSlot,
  isInactive = false 
}: CoachAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  useEffect(() => {
    if (!isInactive) {
      fetchSlots(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isInactive]);

  const fetchSlots = async (date: Date) => {
    setIsLoading(true);
    try {
      // Récupérer les créneaux pour les 30 prochains jours
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      endDate.setHours(23, 59, 59, 999);

      // Si pas d'announcementId, ne pas charger les créneaux (affichage simple des disponibilités)
      if (!announcementId) {
        setSlots([]);
        return;
      }

      const response = await fetch(
        `/api/coach/${coachId}/available-slots?` +
        `startDate=${startDate.toISOString()}&` +
        `endDate=${endDate.toISOString()}&` +
        `announcementId=${announcementId}`
      );

      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Erreur chargement créneaux:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    if (onSelectSlot) {
      onSelectSlot(slot);
    }
  };

  // Grouper les créneaux par date
  const slotsByDate = slots.reduce((acc, slot) => {
    const dateKey = slot.start.split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, Slot[]>);

  const availableDates = Object.keys(slotsByDate).sort();
  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const selectedDaySlots = slotsByDate[selectedDateKey] || [];

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
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : availableDates.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            Aucun créneau disponible pour le moment
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {availableDates.slice(0, 7).map((dateKey) => {
              const date = new Date(dateKey);
              const isSelected = selectedDateKey === dateKey;
              const daySlots = slotsByDate[dateKey];
              
              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(date)}
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
                        {format(date, 'EEE d MMM', { locale: fr })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {daySlots.length} créneaux
                      </p>
                    </div>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Créneaux horaires */}
      {selectedDaySlots.length > 0 && !isInactive && (
        <div className="pt-4 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Créneaux disponibles le {format(selectedDate, 'PPP', { locale: fr })} :
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {selectedDaySlots.map((slot, index) => {
              const startTime = format(new Date(slot.start), 'HH:mm');
              const endTime = format(new Date(slot.end), 'HH:mm');
              const isSelected = selectedSlot?.start === slot.start;

              return (
                <button
                  key={index}
                  onClick={() => handleSelectSlot(slot)}
                  className={`
                    px-3 py-2 text-sm border-2 rounded-lg transition-all flex items-center justify-center gap-2
                    ${isSelected
                      ? 'border-blue-500 bg-blue-500 text-white'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                    }
                  `}
                >
                  <Clock className="h-4 w-4" />
                  {startTime} - {endTime}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
