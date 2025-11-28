'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Loader2, AlertCircle, Globe } from 'lucide-react';
import { format, parseISO, isSameDay, startOfDay, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTimezone } from '@/hooks/useTimezone';
import { formatTimezoneDisplay } from '@/lib/timezone';
import { Tooltip } from '@/components/ui/Tooltip';

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
}

interface SessionSelectorProps {
  coachId: string;
  duration: number;
  selectedSlot: TimeSlot | null;
  onSlotSelect: (slot: TimeSlot | null) => void;
}

export function SessionSelector({ coachId, duration, selectedSlot, onSlotSelect }: SessionSelectorProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { timezone, toLocalTime, formatLocal, isLoaded: timezoneLoaded } = useTimezone();

  useEffect(() => {
    const fetchSlots = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/coach/${coachId}/availability?duration=${duration}`
        );

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des créneaux');
        }

        const data = await response.json();

        // Convertir les slots en objets Date
        const parsedSlots = (data.availabilities || [])
          .map((slot: { id: string; start: string; end: string; isBooked?: boolean }) => ({
            id: slot.id,
            start: parseISO(slot.start),
            end: parseISO(slot.end),
            isBooked: slot.isBooked || false,
          }))
          .filter((slot: TimeSlot & { isBooked: boolean }) => !slot.isBooked && slot.start > new Date());

        setSlots(parsedSlots);
      } catch (err) {
        console.error('Erreur chargement créneaux:', err);
        setError('Impossible de charger les disponibilités');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [coachId, duration]);

  // Grouper les slots par date
  const slotsByDate = slots.reduce((acc, slot) => {
    const localDate = toLocalTime(slot.start);
    const dateKey = format(startOfDay(localDate), 'yyyy-MM-dd');

    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const availableDates = Object.keys(slotsByDate)
    .map(dateKey => parseISO(dateKey))
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, 14); // Limiter à 14 jours

  const selectedDateKey = format(selectedDate, 'yyyy-MM-dd');
  const daySlots = slotsByDate[selectedDateKey] || [];

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Choisir un créneau</h3>
        </div>
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Aucun créneau disponible pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Choisir un créneau</h3>
        </div>
        {timezoneLoaded && (
          <Tooltip content="Les horaires sont affichés dans votre fuseau horaire" position="bottom">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg cursor-help">
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">
                {formatTimezoneDisplay(timezone)}
              </span>
            </div>
          </Tooltip>
        )}
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <div className="grid grid-cols-7 gap-2">
          {availableDates.map((date) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            const dateSlots = slotsByDate[format(date, 'yyyy-MM-dd')] || [];

            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded-lg text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-xs font-medium uppercase">
                  {format(date, 'EEE', { locale: fr })}
                </div>
                <div className={`text-lg font-bold ${isToday && !isSelected ? 'text-amber-500' : ''}`}>
                  {format(date, 'd')}
                </div>
                <div className={`text-xs ${isSelected ? 'text-amber-100' : 'text-amber-600'}`}>
                  {dateSlots.length}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
        </h4>

        {daySlots.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Clock className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Aucun créneau disponible ce jour</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {daySlots.map((slot) => {
              const isSelected = selectedSlot?.id === slot.id;
              const startTime = formatLocal(slot.start, 'HH:mm');
              const endTime = formatLocal(slot.end, 'HH:mm');

              return (
                <button
                  key={slot.id}
                  onClick={() => onSlotSelect(isSelected ? null : slot)}
                  className={`p-3 rounded-lg border-2 transition-all text-center ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className={`h-4 w-4 ${isSelected ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span className={`font-semibold ${isSelected ? 'text-amber-900' : 'text-gray-900'}`}>
                      {startTime}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {endTime}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
