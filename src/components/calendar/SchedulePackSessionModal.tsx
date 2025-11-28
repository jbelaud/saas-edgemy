"use client";

import { useState, useEffect } from "react";
import { X, Users, Package, Clock, Calendar as CalendarIcon } from "lucide-react";
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';
import { fromZonedTime } from 'date-fns-tz';

interface Player {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

interface PackageInfo {
  id: string;
  totalHours: number;
  remainingHours: number;
  usedHours: number;
  sessionsCount: number;
  createdAt: string;
}

interface PlayerWithPackages {
  player: Player;
  packages: PackageInfo[];
}

interface SchedulePackSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SchedulePackSessionModal({
  isOpen,
  onClose,
  onSuccess,
}: SchedulePackSessionModalProps) {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState<PlayerWithPackages[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerWithPackages | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coachTimezone, setCoachTimezone] = useState<string>('Europe/Paris');
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

  useEffect(() => {
    if (isOpen) {
      fetchPlayersWithPacks();
    }
  }, [isOpen]);

  const fetchPlayersWithPacks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/coach/players-with-packs');
      if (res.ok) {
        const data = await res.json();
        setPlayers(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPackage) {
      showError("Sélection requise", "Veuillez sélectionner un pack");
      return;
    }

    setIsSubmitting(true);

    try {
      // Les dates sont au format "YYYY-MM-DDTHH:mm" depuis les inputs datetime-local
      // On les traite comme des heures locales du coach, puis on convertit en UTC
      const startLocal = new Date(startDate);
      const endLocal = new Date(endDate);

      // Convertir au fuseau horaire du coach puis en UTC
      // fromZonedTime lit les getters de la date et les interprète comme étant dans le fuseau du coach
      const startUTC = fromZonedTime(startLocal, coachTimezone);
      const endUTC = fromZonedTime(endLocal, coachTimezone);

      const durationHours = (endUTC.getTime() - startUTC.getTime()) / (1000 * 60 * 60);

      if (durationHours > selectedPackage.remainingHours) {
        showError(
          "Heures insuffisantes",
          `Restant: ${selectedPackage.remainingHours}h\nDemandé: ${durationHours}h`
        );
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('/api/coach/schedule-pack-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          startDate: startUTC,
          endDate: endUTC,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        showSuccess(
          "Session planifiée avec succès",
          `${data.message}\n\nHeures restantes: ${data.remainingHours.toFixed(1)}h`
        );
        onSuccess();
        handleClose();
      } else {
        const error = await res.json();
        showError("Erreur de planification", error.error || 'Erreur lors de la planification');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showError("Erreur de planification", "Une erreur est survenue lors de la planification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedPlayer(null);
    setSelectedPackage(null);
    setStartDate("");
    setEndDate("");
    onClose();
  };

  if (!isOpen) return null;

  const calculateDuration = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
  };

  const duration = calculateDuration();
  const durationHours = duration / 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full my-8 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-400" />
            Planifier une session de pack
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">Aucun joueur avec des packs actifs</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sélection du joueur */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Joueur
              </label>
              <select
                value={selectedPlayer?.player.id || ""}
                onChange={(e) => {
                  const player = players.find(p => p.player.id === e.target.value);
                  setSelectedPlayer(player || null);
                  setSelectedPackage(null);
                }}
                className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                required
              >
                <option value="">Sélectionner un joueur</option>
                {players.map((p) => (
                  <option key={p.player.id} value={p.player.id}>
                    {p.player.name || p.player.email} ({p.packages.length} pack{p.packages.length > 1 ? 's' : ''})
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection du pack */}
            {selectedPlayer && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Package className="w-4 h-4 inline mr-1" />
                  Pack
                </label>
                <div className="space-y-2">
                  {selectedPlayer.packages.map((pkg) => (
                    <button
                      key={pkg.id}
                      type="button"
                      onClick={() => setSelectedPackage(pkg)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        selectedPackage?.id === pkg.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/10 bg-slate-900/30 hover:border-purple-500/50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-white font-medium">Pack {pkg.totalHours}h</p>
                          <p className="text-sm text-gray-400">
                            {pkg.sessionsCount} session{pkg.sessionsCount > 1 ? 's' : ''} planifiée{pkg.sessionsCount > 1 ? 's' : ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-400 font-semibold">{pkg.remainingHours}h restantes</p>
                          <p className="text-xs text-gray-500">{pkg.usedHours}h utilisées</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${(pkg.usedHours / pkg.totalHours) * 100}%` }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date et heure */}
            {selectedPackage && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Début
                    </label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Fin
                    </label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      required
                    />
                  </div>
                </div>

                {/* Résumé */}
                {duration > 0 && (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <p className="text-sm text-purple-400 mb-2">📊 Résumé</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Durée session</p>
                        <p className="text-white font-medium">{durationHours.toFixed(1)}h ({duration} min)</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Après cette session</p>
                        <p className="text-white font-medium">
                          {(selectedPackage.remainingHours - durationHours).toFixed(1)}h restantes
                        </p>
                      </div>
                    </div>
                    {durationHours > selectedPackage.remainingHours && (
                      <p className="text-red-400 text-sm mt-2">
                        ⚠️ Heures insuffisantes!
                      </p>
                    )}
                  </div>
                )}

                {/* Boutons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || durationHours > selectedPackage.remainingHours}
                    className="flex-1 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Planification...
                      </>
                    ) : (
                      'Planifier la session'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
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
    </div>
  );
}
