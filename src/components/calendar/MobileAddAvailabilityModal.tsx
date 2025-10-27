"use client";

import { useState } from "react";
import { X, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";

interface MobileAddAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (start: Date, end: Date) => Promise<void>;
}

export default function MobileAddAvailabilityModal({
  isOpen,
  onClose,
  onAdd,
}: MobileAddAvailabilityModalProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);

    if (end <= start) {
      alert("❌ L'heure de fin doit être après l'heure de début");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd(start, end);
      onClose();
      // Reset
      setDate(format(new Date(), "yyyy-MM-dd"));
      setStartTime("09:00");
      setEndTime("17:00");
    } catch (error) {
      console.error("Erreur:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 border-t sm:border border-white/10 rounded-t-3xl sm:rounded-xl shadow-2xl w-full sm:max-w-md sm:mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Nouvelle disponibilité</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <Calendar className="w-4 h-4 text-green-400" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          {/* Heure de début */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <Clock className="w-4 h-4 text-green-400" />
              Heure de début
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          {/* Heure de fin */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
              <Clock className="w-4 h-4 text-green-400" />
              Heure de fin
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          {/* Résumé */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Résumé</p>
            <p className="text-white font-semibold">
              {format(new Date(date), "EEEE d MMMM yyyy", { locale: require("date-fns/locale/fr") })}
            </p>
            <p className="text-green-400 font-semibold mt-1">
              {startTime} - {endTime}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-white/10 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Ajout..." : "Ajouter"}
          </button>
        </div>
      </div>
    </div>
  );
}
