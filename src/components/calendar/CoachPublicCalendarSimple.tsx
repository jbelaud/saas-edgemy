"use client";

import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-custom.css";
import { useEffect, useState } from "react";
import { localizer } from "./localizer";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface AvailabilitySlot {
  id: string;
  start: Date;
  end: Date;
}

interface CoachPublicCalendarSimpleProps {
  coachId: string;
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

export default function CoachPublicCalendarSimple({ coachId, onSelectSlot }: CoachPublicCalendarSimpleProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/coach/${coachId}/availability`);
        if (!res.ok) throw new Error("Erreur lors du chargement");
        
        const data = await res.json();
        setEvents(
          data.map((slot: any) => ({
            id: slot.id,
            title: "Disponible",
            start: new Date(slot.start),
            end: new Date(slot.end),
          }))
        );
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailabilities();
  }, [coachId]);

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    onSelectSlot({
      id: event.id,
      start: event.start,
      end: event.end,
    });
  };

  if (loading) {
    return (
      <div className="p-4 bg-white border rounded-lg">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Chargement des disponibilités...</p>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4 bg-white border rounded-lg">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Aucune disponibilité pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-white border rounded-lg">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable={false}
          onSelectEvent={handleSelectEvent}
          style={{ height: 500 }}
          views={["month", "week", "day"]}
          defaultView="week"
          step={30}
          timeslots={2}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour",
            agenda: "Agenda",
            date: "Date",
            time: "Heure",
            event: "Événement",
            noEventsInRange: "Aucune disponibilité dans cette période",
            showMore: (total: number) => `+ ${total} de plus`,
          }}
          culture="fr"
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: selectedEvent?.id === event.id ? '#3b82f6' : '#10b981',
              borderColor: selectedEvent?.id === event.id ? '#2563eb' : '#059669',
            },
          })}
        />
      </div>
      
      {selectedEvent && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-900">
            <strong>✓ Créneau sélectionné :</strong>{' '}
            {format(selectedEvent.start, "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}
            {' → '}
            {format(selectedEvent.end, "HH:mm", { locale: fr })}
          </p>
        </div>
      )}
    </div>
  );
}
