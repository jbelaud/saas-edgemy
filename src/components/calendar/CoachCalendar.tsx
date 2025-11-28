"use client";

import { Calendar, SlotInfo, View } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar-custom.css";
import { useEffect, useState, useCallback, useRef } from "react";
import { localizer } from "./localizer";
import { GlassCard } from "@/components/ui";
import { Info, Move } from "lucide-react";
import DeleteAvailabilityModal from "./DeleteAvailabilityModal";
import ManageSessionModal from "./ManageSessionModal";
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';
import { toZonedTime } from 'date-fns-tz';

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'availability' | 'session';
  playerName?: string;
  sessionId?: string;
}

interface CoachCalendarProps {
  coachId: string;
  onAvailabilityChange?: () => void;
}

export default function CoachCalendar({ coachId, onAvailabilityChange }: CoachCalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [coachTimezone, setCoachTimezone] = useState<string>('Europe/Paris');
  const calendarRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isManageSessionModalOpen, setIsManageSessionModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [moveNewStart, setMoveNewStart] = useState("");
  const [moveNewEnd, setMoveNewEnd] = useState("");
  const { alertState, confirmState, showSuccess, showError, closeAlert, closeConfirm } = useAlertDialog();

  // Récupérer le fuseau horaire du coach
  useEffect(() => {
    const fetchCoachTimezone = async () => {
      try {
        const res = await fetch('/api/coach/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.coach?.timezone) {
            setCoachTimezone(data.coach.timezone);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du fuseau horaire:', error);
      }
    };
    fetchCoachTimezone();
  }, []);

  const fetchAvailabilities = useCallback(async () => {
    try {
      setLoading(true);

      // Récupérer les disponibilités
      const availRes = await fetch(`/api/coach/${coachId}/availability`);
      const availData = availRes.ok ? await availRes.json() : { availabilities: [] };
      const availabilities = availData.availabilities || [];

      // Récupérer les sessions
      const sessRes = await fetch(`/api/coach/sessions`);
      const sessions = sessRes.ok ? await sessRes.json() : [];

      // Combiner les deux types d'événements
      // IMPORTANT: Convertir les dates UTC vers le fuseau horaire du coach
      const allEvents: CalendarEvent[] = [
        ...availabilities.map((slot: { id: string; start: string; end: string }) => ({
          id: `avail-${slot.id}`,
          title: "Disponible",
          start: toZonedTime(new Date(slot.start), coachTimezone),
          end: toZonedTime(new Date(slot.end), coachTimezone),
          type: 'availability' as const,
        })),
        ...sessions.map((session: {
          id: string;
          startDate: string;
          endDate: string;
          package: {
            player: {
              name: string | null;
              email: string;
            };
          };
        }) => ({
          id: `session-${session.id}`,
          sessionId: session.id,
          title: `Session - ${session.package.player.name || session.package.player.email}`,
          start: toZonedTime(new Date(session.startDate), coachTimezone),
          end: toZonedTime(new Date(session.endDate), coachTimezone),
          type: 'session' as const,
          playerName: session.package.player.name || session.package.player.email,
        })),
      ];

      setEvents(allEvents);
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }, [coachId, coachTimezone]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  // Scroller automatiquement à 7h00 au chargement
  useEffect(() => {
    if (!loading && calendarRef.current) {
      const timer = setTimeout(() => {
        const timeGutter = calendarRef.current?.querySelector('.rbc-time-content');
        if (timeGutter) {
          // Chaque heure fait environ 60px de hauteur (step=30, timeslots=2)
          // 7 heures * 60px = 420px
          timeGutter.scrollTop = 420;
        }
      }, 100); // Petit délai pour s'assurer que le DOM est prêt

      return () => clearTimeout(timer);
    }
  }, [loading]);

  const handleSelectSlot = async ({ start, end }: SlotInfo) => {
    // Vérifier que c'est dans le futur
    if (start < new Date()) {
      showError("Erreur de validation", "Vous ne pouvez pas ajouter de disponibilité dans le passé");
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
        onAvailabilityChange?.(); // Notifier le parent
        // Feedback visuel positif
        const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        showSuccess(
          "Disponibilité ajoutée",
          `${start.toLocaleDateString("fr-FR")} de ${start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} à ${end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}\n\nDurée: ${duration} minutes`
        );
      } else {
        const error = await res.json();
        showError("Erreur d'ajout", error.error || "Erreur lors de l'ajout de la disponibilité");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur d'ajout", "Une erreur est survenue lors de l'ajout de la disponibilité");
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);

    if (event.type === 'availability') {
      // Pour les disponibilités, ouvrir le modal de gestion (supprimer ou déplacer)
      setIsDeleteModalOpen(true);
    } else {
      // Pour les sessions, ouvrir le modal de gestion
      setIsManageSessionModalOpen(true);
    }
  };

  const handleOpenMoveModal = () => {
    if (!selectedEvent || selectedEvent.type !== 'availability') return;

    setIsDeleteModalOpen(false);
    const start = new Date(selectedEvent.start);
    const end = new Date(selectedEvent.end);

    // Format pour datetime-local
    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setMoveNewStart(formatDateTime(start));
    setMoveNewEnd(formatDateTime(end));
    setIsMoveModalOpen(true);
  };

  const handleMove = async () => {
    if (!selectedEvent || selectedEvent.type !== 'availability') return;

    const newStart = new Date(moveNewStart);
    const newEnd = new Date(moveNewEnd);

    // Validation
    if (newStart >= newEnd) {
      showError("Erreur de validation", "L'heure de fin doit être après l'heure de début");
      return;
    }

    if (newStart < new Date()) {
      showError("Erreur de validation", "Vous ne pouvez pas déplacer une disponibilité dans le passé");
      return;
    }

    const realId = selectedEvent.id.replace('avail-', '');

    try {
      // Supprimer l'ancienne et créer la nouvelle
      await fetch(`/api/coach/${coachId}/availability/${realId}`, {
        method: "DELETE",
      });

      const res = await fetch(`/api/coach/${coachId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: newStart, end: newEnd }),
      });

      if (res.ok) {
        await fetchAvailabilities();
        onAvailabilityChange?.(); // Notifier le parent
        setIsMoveModalOpen(false);
        setSelectedEvent(null);
        showSuccess("Disponibilité déplacée", "La disponibilité a été déplacée avec succès");
      } else {
        const error = await res.json();
        showError("Erreur de déplacement", error.error || "Erreur lors du déplacement de la disponibilité");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur de déplacement", "Une erreur est survenue lors du déplacement");
    }
  };

  const handleDeleteFull = async () => {
    if (!selectedEvent || selectedEvent.type !== 'availability') return;

    // Extraire le vrai ID (enlever le préfixe "avail-")
    const realId = selectedEvent.id.replace('avail-', '');

    try {
      const res = await fetch(`/api/coach/${coachId}/availability/${realId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchAvailabilities();
        onAvailabilityChange?.(); // Notifier le parent
        setIsDeleteModalOpen(false);
        setSelectedEvent(null);
        showSuccess("Disponibilité supprimée", "La disponibilité a été supprimée avec succès");
      } else {
        showError("Erreur de suppression", "Impossible de supprimer cette disponibilité");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur de suppression", "Une erreur est survenue lors de la suppression");
    }
  };

  const handleDeletePartial = async (deleteStart: Date, deleteEnd: Date) => {
    if (!selectedEvent || selectedEvent.type !== 'availability') return;

    const originalStart = new Date(selectedEvent.start);
    const originalEnd = new Date(selectedEvent.end);

    // Extraire le vrai ID (enlever le préfixe "avail-")
    const realId = selectedEvent.id.replace('avail-', '');

    try {
      // 1. Supprimer le créneau original
      await fetch(`/api/coach/${coachId}/availability/${realId}`, {
        method: "DELETE",
      });

      // 2. Recréer les parties restantes
      const promises = [];

      // Partie avant (si elle existe)
      if (deleteStart > originalStart) {
        promises.push(
          fetch(`/api/coach/${coachId}/availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start: originalStart,
              end: deleteStart,
            }),
          })
        );
      }

      // Partie après (si elle existe)
      if (deleteEnd < originalEnd) {
        promises.push(
          fetch(`/api/coach/${coachId}/availability`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              start: deleteEnd,
              end: originalEnd,
            }),
          })
        );
      }

      await Promise.all(promises);
      await fetchAvailabilities();
      onAvailabilityChange?.(); // Notifier le parent
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
      showSuccess("Disponibilité modifiée", "La disponibilité a été modifiée avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur de modification", "Une erreur est survenue lors de la modification");
      // En cas d'erreur, recharger pour revenir à l'état cohérent
      await fetchAvailabilities();
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
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white mb-2">Calendrier interactif</h2>
          <div className="space-y-2">
            <div className="flex items-start gap-2 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <Info className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-green-400">➕ Ajouter :</span> Cliquez et glissez sur le calendrier pour créer un créneau
              </p>
            </div>
            <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-blue-400">✏️ Modifier :</span> Cliquez sur une disponibilité pour la déplacer, modifier ou supprimer
              </p>
            </div>
            <div className="flex items-start gap-2 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
              <Info className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">
                <span className="font-medium text-purple-400">👁️ Consulter :</span> Cliquez sur une session planifiée pour voir les détails
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl border border-white/10">
        <p className="text-sm font-semibold text-gray-300 mr-2">Légende:</p>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-green-600 rounded shadow-sm"></div>
          <span className="text-sm font-medium text-green-400">Disponibilités</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <div className="w-3 h-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded shadow-sm border-l-2 border-purple-700"></div>
          <span className="text-sm font-medium text-purple-400">Sessions planifiées</span>
        </div>
      </div>

      {/* Calendrier */}
      <div ref={calendarRef} className="bg-slate-800/50 rounded-xl p-4 border border-white/10">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 700 }}
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
            showMore: (total: number) => `+ ${total} de plus`,
          }}
          culture="fr"
        />
      </div>

      {/* Modal de suppression/modification */}
      {selectedEvent && selectedEvent.type === 'availability' && (
        <DeleteAvailabilityModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedEvent(null);
          }}
          availability={{
            id: selectedEvent.id,
            start: selectedEvent.start,
            end: selectedEvent.end,
          }}
          onDeleteFull={handleDeleteFull}
          onDeletePartial={handleDeletePartial}
          onMove={handleOpenMoveModal}
        />
      )}

      {/* Modal de déplacement */}
      {isMoveModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
          <div className="bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-w-md w-full my-8 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Move className="w-5 h-5 text-blue-400" />
                Déplacer la disponibilité
              </h3>
              <button
                onClick={() => setIsMoveModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <span className="text-gray-400 text-xl">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nouvelle date et heure de début
                </label>
                <input
                  type="datetime-local"
                  value={moveNewStart}
                  onChange={(e) => setMoveNewStart(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nouvelle date et heure de fin
                </label>
                <input
                  type="datetime-local"
                  value={moveNewEnd}
                  onChange={(e) => setMoveNewEnd(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 [color-scheme:dark]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setIsMoveModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleMove}
                  className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                >
                  <Move className="w-4 h-4" />
                  Déplacer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de gestion de session */}
      {selectedEvent && selectedEvent.type === 'session' && selectedEvent.sessionId && (
        <ManageSessionModal
          isOpen={isManageSessionModalOpen}
          onClose={() => {
            setIsManageSessionModalOpen(false);
            setSelectedEvent(null);
          }}
          session={{
            id: selectedEvent.id,
            sessionId: selectedEvent.sessionId,
            title: selectedEvent.title,
            start: selectedEvent.start,
            end: selectedEvent.end,
            playerName: selectedEvent.playerName || 'Joueur inconnu',
          }}
          onSuccess={fetchAvailabilities}
        />
      )}

      {/* Modals de notification */}
      <AlertDialogCustom
        open={alertState.open}
        onOpenChange={closeAlert}
        title={alertState.title}
        description={alertState.description}
        type={alertState.type}
      />

      <AlertDialogCustom
        open={confirmState.open}
        onOpenChange={closeConfirm}
        title={confirmState.title}
        description={confirmState.description}
        type="warning"
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={confirmState.onConfirm}
        showCancel={true}
      />
    </GlassCard>
  );
}
