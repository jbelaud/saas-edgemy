"use client";

import { useState } from "react";
import { X, Edit2, Trash2, User, Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ManageSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    id: string;
    sessionId: string;
    title: string;
    start: Date;
    end: Date;
    playerName: string;
  };
  onSuccess: () => void;
}

export default function ManageSessionModal({
  isOpen,
  onClose,
  session,
  onSuccess,
}: ManageSessionModalProps) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [startDate, setStartDate] = useState(format(session.start, "yyyy-MM-dd'T'HH:mm"));
  const [endDate, setEndDate] = useState(format(session.end, "yyyy-MM-dd'T'HH:mm"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const duration = Math.round((session.end.getTime() - session.start.getTime()) / (1000 * 60));

  const handleEdit = async () => {
    setIsSubmitting(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        alert("❌ L'heure de fin doit être après l'heure de début");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`/api/coach/sessions/${session.sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: start, endDate: end }),
      });

      if (res.ok) {
        alert("✅ Session modifiée avec succès");
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        alert(`❌ ${error.error || "Erreur lors de la modification"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de la modification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`🗑️ Annuler cette session ?\n\nLes heures seront recréditées au pack du joueur.`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/coach/sessions/${session.sessionId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✅ ${data.message}\n\n⏱️ Heures recréditées: ${data.creditedHours}h`);
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        alert(`❌ ${error.error || "Erreur lors de l'annulation"}`);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ Erreur lors de l'annulation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setMode("view");
    setStartDate(format(session.start, "yyyy-MM-dd'T'HH:mm"));
    setEndDate(format(session.end, "yyyy-MM-dd'T'HH:mm"));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {mode === "view" ? "Gérer la session" : "Modifier la session"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Info de la session */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <User className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-xs text-gray-400">Joueur</p>
              <p className="text-white font-medium">{session.playerName}</p>
            </div>
          </div>

          {mode === "view" ? (
            <>
              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-white font-medium">
                    {format(session.start, "EEEE d MMMM yyyy", { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Horaire</p>
                  <p className="text-white font-medium">
                    {format(session.start, "HH:mm")} - {format(session.end, "HH:mm")}
                    <span className="text-gray-400 text-sm ml-2">({duration} min)</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Début
                </label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Fin
                </label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {mode === "view" ? (
          <div className="space-y-3">
            <button
              onClick={() => setMode("edit")}
              className="w-full px-4 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              Modifier
            </button>

            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Annuler la session
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
            >
              Fermer
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setMode("view")}
              className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
            >
              Annuler
            </button>
            <button
              onClick={handleEdit}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Enregistrer"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
