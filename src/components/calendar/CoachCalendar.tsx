"use client";

import { Calendar, SlotInfo } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-custom.css";
import { useEffect, useState, useCallback } from "react";
import { localizer } from "./localizer";
import { GlassCard } from "@/components/ui";
import { CalendarDays, Info } from "lucide-react";

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

  const fetchAvailabilities = useCallback(async () => {
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
  }, [coachId]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  const handleSelectSlot = async ({ start, end }: SlotInfo) => {
    // Vérifier que c'est dans le futur
    if (start < new Date()) {
      alert("❌ Vous ne pouvez pas ajouter de disponibilité dans le passé");
      return;
    }

    try {
      const res = await fetch(`/api/coach/${coachId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });
      
      if (res.ok) {
        await fetchAvailabilities();
        // Feedback visuel positif
        const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        alert(`✅ Disponibilité ajoutée avec succès !\n📅 ${start.toLocaleDateString("fr-FR")} de ${start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} à ${end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}\n⏱️ Durée: ${duration} minutes`);
      } else {
        const error = await res.json();
        alert(`❌ ${error.error || "Erreur lors de l'ajout de la disponibilité"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de l'ajout de la disponibilité");
    }
  };

  const handleSelectEvent = async (event: CalendarEvent) => {
    const startDate = new Date(event.start);
    const endDate = new Date(event.end);
    const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
    
    if (confirm(`🗑️ Supprimer cette disponibilité ?\n\n📅 ${startDate.toLocaleDateString("fr-FR")}\n⏰ ${startDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} - ${endDate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}\n⏱️ Durée: ${duration} minutes`)) {
      try {
        const res = await fetch(`/api/coach/${coachId}/availability/${event.id}`, {
          method: "DELETE",
        });
        
        if (res.ok) {
          await fetchAvailabilities();
          alert("✅ Disponibilité supprimée avec succès");
        } else {
          alert("❌ Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur:", error);
        alert("❌ Erreur lors de la suppression");
      }
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
            <p className="text-gray-400">Chargement du calendrier...</p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-6 h-6 text-amber-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white mb-2">Calendrier interactif</h2>
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <Info className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-green-400">➕ Ajouter :</span> Cliquez et glissez sur le calendrier pour créer un créneau
              </p>
            </div>
            <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <Info className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-red-400">🗑️ Supprimer :</span> Cliquez sur un créneau existant pour le supprimer
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
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
    </GlassCard>
  );
}
