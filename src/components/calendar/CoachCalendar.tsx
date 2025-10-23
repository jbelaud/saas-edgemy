"use client";

import { Calendar, SlotInfo } from "react-big-calendar";
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

interface CoachCalendarProps {
  coachId: string;
}

export default function CoachCalendar({ coachId }: CoachCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchAvailabilities();
  }, [coachId]);

  const handleSelectSlot = async ({ start, end }: SlotInfo) => {
    try {
      const res = await fetch(`/api/coach/${coachId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });
      
      if (res.ok) {
        await fetchAvailabilities();
      } else {
        alert("Erreur lors de l'ajout de la disponibilité");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout de la disponibilité");
    }
  };

  const handleSelectEvent = async (event: CalendarEvent) => {
    if (confirm("Supprimer cette disponibilité ?")) {
      try {
        const res = await fetch(`/api/coach/${coachId}/availability/${event.id}`, {
          method: "DELETE",
        });
        
        if (res.ok) {
          await fetchAvailabilities();
        } else {
          alert("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("Erreur lors de la suppression");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-4 bg-white shadow rounded-2xl">
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white shadow rounded-2xl">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Mes disponibilités</h2>
        <p className="text-sm text-gray-600 mt-1">
          Cliquez et glissez sur le calendrier pour ajouter un créneau. Cliquez sur un créneau existant pour le supprimer.
        </p>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
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
