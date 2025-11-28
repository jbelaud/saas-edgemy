"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui";
import { Plus, Clock, Calendar as CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { fromZonedTime } from 'date-fns-tz';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';
import { convertLocalToUTC } from '@/lib/timezone';
import { useCoachTimezone } from '@/hooks/useTimezone';

interface QuickAddAvailabilityProps {
  coachId: string;
  onSuccess: () => void;
}

export default function QuickAddAvailability({ coachId, onSuccess }: QuickAddAvailabilityProps) {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coachTimezone, setCoachTimezone] = useState<string>('Europe/Paris');
  const { alertState, confirmState, showError, showSuccess, closeAlert, closeConfirm } = useAlertDialog();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parser les valeurs du formulaire
      const [year, month, day] = date.split('-').map(Number);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);

      // Validation
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        showError("Erreur de validation", "L'heure de fin doit être après l'heure de début");
        setIsSubmitting(false);
        return;
      }

      // Créer des objets Date où les getters (.getHours(), .getDate(), etc.) retournent
      // les valeurs entrées dans le formulaire
      // fromZonedTime va lire ces getters et interpréter les valeurs comme étant dans le fuseau du coach
      const startLocal = new Date(year, month - 1, day, startHour, startMinute, 0);
      const endLocal = new Date(year, month - 1, day, endHour, endMinute, 0);

      // Convertir au timezone du coach puis en UTC
      // fromZonedTime lit startLocal.getHours() (qui retourne 9), l'interprète comme 9h Bangkok,
      // et retourne l'équivalent UTC (02:00 UTC)
      const startUTC = fromZonedTime(startLocal, coachTimezone);
      const endUTC = fromZonedTime(endLocal, coachTimezone);

      const res = await fetch(`/api/coach/${coachId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: startUTC.toISOString(),
          end: endUTC.toISOString()
        }),
      });

      if (res.ok) {
        showSuccess("Disponibilité ajoutée", "La disponibilité a été ajoutée avec succès");
        onSuccess();
        // Réinitialiser le formulaire avec la même date mais horaires suivants
        const nextStart = format(endLocal, "HH:mm");
        const nextEnd = format(new Date(endLocal.getTime() + 60 * 60 * 1000), "HH:mm");
        setStartTime(nextStart);
        setEndTime(nextEnd);
      } else {
        const error = await res.json();
        showError("Erreur d'ajout", error.error || "Erreur lors de l'ajout de la disponibilité");
      }
    } catch (error) {
      console.error("Erreur:", error);
      showError("Erreur d'ajout", "Une erreur est survenue lors de l'ajout de la disponibilité");
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
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <CalendarIcon className="w-4 h-4 text-green-400" />
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all [color-scheme:dark]"
              required
            />
          </div>

          {/* Heure début */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 text-green-400" />
              Début
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              step="1800"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all [color-scheme:dark]"
              required
            />
          </div>

          {/* Heure fin */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock className="w-4 h-4 text-green-400" />
              Fin
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              step="1800"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all [color-scheme:dark]"
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
