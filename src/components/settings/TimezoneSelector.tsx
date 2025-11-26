'use client';

import { useState, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';
import { COMMON_TIMEZONES, detectBrowserTimezone, formatTimezoneDisplay } from '@/lib/timezone';

interface TimezoneSelectorProps {
  /** Fuseau horaire actuellement sélectionné */
  value?: string | null;
  /** Callback appelé lors du changement de fuseau horaire */
  onChange: (timezone: string) => void;
  /** Désactiver le sélecteur */
  disabled?: boolean;
  /** Afficher le bouton de détection automatique */
  showAutoDetect?: boolean;
}

/**
 * Composant de sélection de fuseau horaire
 *
 * @example
 * // Dans les paramètres du coach
 * <TimezoneSelector
 *   value={coach.timezone}
 *   onChange={(tz) => updateCoachTimezone(tz)}
 *   showAutoDetect
 * />
 */
export function TimezoneSelector({
  value,
  onChange,
  disabled = false,
  showAutoDetect = true,
}: TimezoneSelectorProps) {
  const [selectedTimezone, setSelectedTimezone] = useState(value || 'UTC');
  const [detectedTimezone, setDetectedTimezone] = useState<string>('');

  useEffect(() => {
    // Détecter le fuseau horaire du navigateur
    const detected = detectBrowserTimezone();
    setDetectedTimezone(detected);

    // Si aucune valeur n'est définie, utiliser celle détectée
    if (!value) {
      setSelectedTimezone(detected);
      onChange(detected);
    }
  }, [value, onChange]);

  const handleChange = (timezone: string) => {
    setSelectedTimezone(timezone);
    onChange(timezone);
  };

  const handleAutoDetect = () => {
    if (detectedTimezone) {
      handleChange(detectedTimezone);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Globe className="w-4 h-4 text-amber-500" />
          Fuseau horaire
        </label>
        {showAutoDetect && detectedTimezone && detectedTimezone !== selectedTimezone && (
          <button
            type="button"
            onClick={handleAutoDetect}
            disabled={disabled}
            className="text-xs text-amber-500 hover:text-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Détecter automatiquement
          </button>
        )}
      </div>

      <select
        value={selectedTimezone}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label} - {tz.offset}
          </option>
        ))}
      </select>

      {detectedTimezone && (
        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-gray-300">
            <span className="font-medium text-blue-400">Fuseau détecté:</span>{' '}
            {detectedTimezone} ({formatTimezoneDisplay(detectedTimezone)})
            {detectedTimezone === selectedTimezone && (
              <span className="ml-1 text-green-400">✓ Utilisé actuellement</span>
            )}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Toutes vos disponibilités seront affichées dans ce fuseau horaire.
        Les joueurs verront les horaires convertis dans leur propre fuseau horaire.
      </p>
    </div>
  );
}
