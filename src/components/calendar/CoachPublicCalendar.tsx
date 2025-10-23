"use client";

import { Calendar } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-custom.css";
import { useEffect, useState } from "react";
import { localizer } from "./localizer";

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

interface CoachPublicCalendarProps {
  coachId: string;
  onSelectSlot: (slot: AvailabilitySlot) => void;
}

export default function CoachPublicCalendar({ coachId, onSelectSlot }: CoachPublicCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/coach/${coachId}/availability`);
        if (!res.ok) throw new Error("Erreur lors du chargement");
        
        const data = await res.json();
        setEvents(
          data.map((slot: { id: string; start: string; end: string }) => ({
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
    onSelectSlot({
      id: event.id,
      start: event.start,
      end: event.end,
    });
  };

  if (loading) {
    return (
      <div className="p-4 bg-white shadow rounded-2xl">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Chargement des disponibilités...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-2xl">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Disponibilités du coach</h2>
        <p className="text-sm text-gray-600 mt-1">
          Cliquez sur un créneau pour réserver une session
        </p>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        selectable={false}
        onSelectEvent={handleSelectEvent}
        style={{ height: 600 }}
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
          showMore: (total) => `+ ${total} de plus`,
        }}
        culture="fr"
      />
    </div>
  );
}
