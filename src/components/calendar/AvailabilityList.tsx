"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui";
import { List, Trash2, Edit2, Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';
import DeleteAvailabilityModal from './DeleteAvailabilityModal';
import { formatInTimezone } from '@/lib/timezone';

interface Availability {
  id: string;
  start: Date;
  end: Date;
}

interface AvailabilityListProps {
  availabilities: Availability[];
  coachId: string;
  onUpdate: () => void;
}

export default function AvailabilityList({ availabilities, coachId, onUpdate }: AvailabilityListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAvailability, setSelectedAvailability] = useState<Availability | null>(null);
  const [coachTimezone, setCoachTimezone] = useState<string>('Europe/Paris');
  const { alertState, confirmState, showError, closeAlert, closeConfirm } = useAlertDialog();

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

  // Trier par date croissante
  const sortedAvailabilities = [...availabilities].sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
  );

  // Filtrer les disponibilités futures
  const now = new Date();
  const upcomingAvailabilities = sortedAvailabilities.filter(
    (av) => new Date(av.end) > now
  );

  const openDeleteModal = (availability: Availability) => {
    setSelectedAvailability(availability);
    setDeleteModalOpen(true);
  };

  const handleDeleteFull = async () => {
    if (!selectedAvailability) return;

    setDeletingId(selectedAvailability.id);
    try {
      const res = await fetch(`/api/coach/${coachId}/availability/${selectedAvailability.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setDeleteModalOpen(false);
        setSelectedAvailability(null);
        onUpdate();
      } else {
        showError("Erreur de suppression", "Impossible de supprimer cette disponibilité");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur de suppression", "Une erreur est survenue lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeletePartial = async (start: Date, end: Date) => {
    if (!selectedAvailability) return;

    setDeletingId(selectedAvailability.id);
    try {
      // 1. Supprimer l'ancienne dispo
      await fetch(`/api/coach/${coachId}/availability/${selectedAvailability.id}`, {
        method: "DELETE",
      });

      // 2. Recréer les parties conservées
      const originalStart = new Date(selectedAvailability.start);
      const originalEnd = new Date(selectedAvailability.end);

      // Partie avant
      if (start > originalStart) {
        await fetch(`/api/coach/${coachId}/availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ start: originalStart, end: start }),
        });
      }

      // Partie après
      if (end < originalEnd) {
        await fetch(`/api/coach/${coachId}/availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ start: end, end: originalEnd }),
        });
      }

      setDeleteModalOpen(false);
      setSelectedAvailability(null);
      onUpdate();
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur de suppression", "Une erreur est survenue lors de la suppression partielle");
    } finally {
      setDeletingId(null);
    }
  };

  const startEdit = (availability: Availability) => {
    setEditingId(availability.id);
    setEditStart(format(new Date(availability.start), "yyyy-MM-dd'T'HH:mm"));
    setEditEnd(format(new Date(availability.end), "yyyy-MM-dd'T'HH:mm"));
  };

  const handleEdit = async (id: string) => {
    try {
      const start = new Date(editStart);
      const end = new Date(editEnd);

      if (end <= start) {
        showError("Erreur de validation", "L'heure de fin doit être après l'heure de début");
        return;
      }

      // Supprimer l'ancienne et créer la nouvelle
      await fetch(`/api/coach/${coachId}/availability/${id}`, {
        method: "DELETE",
      });

      const res = await fetch(`/api/coach/${coachId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });

      if (res.ok) {
        setEditingId(null);
        onUpdate();
      } else {
        showError("Erreur de modification", "Impossible de modifier cette disponibilité");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur de modification", "Une erreur est survenue lors de la modification");
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
          <List className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white">Mes disponibilités</h2>
          <p className="text-sm text-gray-400">
            {upcomingAvailabilities.length} créneau{upcomingAvailabilities.length > 1 ? "x" : ""} à venir
          </p>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {upcomingAvailabilities.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Aucune disponibilité à venir</p>
            <p className="text-sm text-gray-500 mt-1">
              Ajoutez des créneaux pour que les joueurs puissent réserver
            </p>
          </div>
        ) : (
          upcomingAvailabilities.map((availability) => (
            <div
              key={availability.id}
              className="bg-slate-800/50 border border-white/10 rounded-lg p-4 hover:border-purple-500/30 transition-all"
            >
              {editingId === availability.id ? (
                // Mode édition
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Début</label>
                      <input
                        type="datetime-local"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Fin</label>
                      <input
                        type="datetime-local"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(availability.id)}
                      className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                // Mode affichage
                <>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-white font-medium mb-1">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        {formatInTimezone(availability.start, coachTimezone, "EEEE d MMMM yyyy")}
                      </div>
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatInTimezone(availability.start, coachTimezone, "HH:mm")} - {formatInTimezone(availability.end, coachTimezone, "HH:mm")}
                        <span className="text-gray-500">
                          ({Math.round((new Date(availability.end).getTime() - new Date(availability.start).getTime()) / (1000 * 60))} min)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => startEdit(availability)}
                      className="w-full sm:flex-1 px-3 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => openDeleteModal(availability)}
                      disabled={deletingId === availability.id}
                      className="w-full sm:flex-1 px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {deletingId === availability.id ? (
                        <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>

      {/* Modal de suppression */}
      {selectedAvailability && (
        <DeleteAvailabilityModal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedAvailability(null);
          }}
          availability={selectedAvailability}
          onDeleteFull={handleDeleteFull}
          onDeletePartial={handleDeletePartial}
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
