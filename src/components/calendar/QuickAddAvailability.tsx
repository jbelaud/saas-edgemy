"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui";
import { Plus, Clock, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface QuickAddAvailabilityProps {
  coachId: string;
  onSuccess: () => void;
}

export default function QuickAddAvailability({ coachId, onSuccess }: QuickAddAvailabilityProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const start = new Date(`${date}T${startTime}`);
      const end = new Date(`${date}T${endTime}`);

      if (end <= start) {
        alert("L'heure de fin doit être après l'heure de début");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`/api/coach/${coachId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start, end }),
      });

      if (res.ok) {
        onSuccess();
        // Réinitialiser le formulaire avec la même date mais horaires suivants
        const nextStart = format(end, "HH:mm");
        const nextEnd = format(new Date(end.getTime() + 60 * 60 * 1000), "HH:mm");
        setStartTime(nextStart);
        setEndTime(nextEnd);
      } else {
        const error = await res.json();
        alert(error.error || "Erreur lors de l'ajout de la disponibilité");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de l'ajout de la disponibilité");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
          <Plus className="w-5 h-5 text-green-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Ajout rapide</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <CalendarIcon className="w-4 h-4 inline mr-1" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              required
            />
          </div>

          {/* Heure début */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Début
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              step="1800"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              required
            />
          </div>

          {/* Heure fin */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Fin
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              step="1800"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all"
              required
            />
          </div>
        </div>

        {/* Bouton d'ajout */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Ajout en cours...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Ajouter cette disponibilité
            </>
          )}
        </button>
      </form>

      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-medium text-blue-400">💡 Astuce :</span> Après l&apos;ajout, les horaires s&apos;ajustent automatiquement pour enchaîner rapidement plusieurs créneaux.
        </p>
      </div>
    </GlassCard>
  );
}
