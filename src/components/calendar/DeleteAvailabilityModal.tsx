"use client";

import { useState } from "react";
import { X, Trash2, Scissors } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface DeleteAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  availability: {
    id: string;
    start: Date;
    end: Date;
  };
  onDeleteFull: () => void;
  onDeletePartial: (start: Date, end: Date) => void;
}

export default function DeleteAvailabilityModal({
  isOpen,
  onClose,
  availability,
  onDeleteFull,
  onDeletePartial,
}: DeleteAvailabilityModalProps) {
  const [mode, setMode] = useState<"choice" | "partial">("choice");
  const [partialStart, setPartialStart] = useState(
    format(availability.start, "yyyy-MM-dd'T'HH:mm")
  );
  const [partialEnd, setPartialEnd] = useState(
    format(availability.end, "yyyy-MM-dd'T'HH:mm")
  );

  if (!isOpen) return null;

  const handlePartialDelete = () => {
    const start = new Date(partialStart);
    const end = new Date(partialEnd);

    // Validation
    if (start >= end) {
      alert("❌ L'heure de fin doit être après l'heure de début");
      return;
    }

    if (start < availability.start || end > availability.end) {
      alert("❌ La plage doit être comprise dans le créneau existant");
      return;
    }

    if (start.getTime() === availability.start.getTime() && end.getTime() === availability.end.getTime()) {
      alert("❌ Vous essayez de supprimer tout le créneau. Utilisez plutôt 'Supprimer tout'");
      return;
    }

    onDeletePartial(start, end);
  };

  const duration = Math.round((availability.end.getTime() - availability.start.getTime()) / (1000 * 60));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {mode === "choice" ? "Supprimer la disponibilité" : "Supprimer une partie"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Info du créneau */}
        <div className="mb-6 p-4 bg-slate-700/50 rounded-lg border border-white/5">
          <p className="text-sm text-gray-400 mb-2">Créneau actuel</p>
          <p className="text-white font-medium">
            📅 {format(availability.start, "EEEE d MMMM yyyy", { locale: fr })}
          </p>
          <p className="text-white font-medium">
            ⏰ {format(availability.start, "HH:mm")} - {format(availability.end, "HH:mm")}
          </p>
          <p className="text-gray-400 text-sm mt-1">⏱️ Durée: {duration} minutes</p>
        </div>

        {mode === "choice" ? (
          // Mode choix
          <div className="space-y-3">
            <button
              onClick={onDeleteFull}
              className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Supprimer tout le créneau
            </button>

            <button
              onClick={() => setMode("partial")}
              className="w-full px-4 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Scissors className="w-5 h-5" />
              Supprimer une partie
            </button>

            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
            >
              Annuler
            </button>
          </div>
        ) : (
          // Mode suppression partielle
          <div className="space-y-4">
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 Choisissez la plage horaire à supprimer. Les parties restantes seront conservées.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Début suppression
                </label>
                <input
                  type="datetime-local"
                  value={partialStart}
                  onChange={(e) => setPartialStart(e.target.value)}
                  min={format(availability.start, "yyyy-MM-dd'T'HH:mm")}
                  max={format(availability.end, "yyyy-MM-dd'T'HH:mm")}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fin suppression
                </label>
                <input
                  type="datetime-local"
                  value={partialEnd}
                  onChange={(e) => setPartialEnd(e.target.value)}
                  min={format(availability.start, "yyyy-MM-dd'T'HH:mm")}
                  max={format(availability.end, "yyyy-MM-dd'T'HH:mm")}
                  className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMode("choice")}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
              >
                Retour
              </button>
              <button
                onClick={handlePartialDelete}
                className="flex-1 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-all"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
