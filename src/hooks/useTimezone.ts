/**
 * Hook React pour la gestion du fuseau horaire de l'utilisateur
 *
 * Ce hook:
 * - Détecte automatiquement le fuseau horaire du navigateur
 * - Permet de le surcharger manuellement (via le profil utilisateur)
 * - Fournit des utilitaires de conversion pour l'affichage
 */

import { useState, useEffect } from 'react';
import { detectBrowserTimezone, convertUTCToLocal, formatInTimezone } from '@/lib/timezone';

interface UseTimezoneReturn {
  /** Fuseau horaire actuel de l'utilisateur */
  timezone: string;
  /** Fuseau horaire détecté par le navigateur */
  detectedTimezone: string;
  /** Indique si le fuseau horaire a été détecté */
  isLoaded: boolean;
  /** Convertit une date UTC vers le fuseau horaire de l'utilisateur */
  toLocalTime: (utcDate: Date | string) => Date;
  /** Formate une date UTC dans le fuseau horaire de l'utilisateur */
  formatLocal: (utcDate: Date | string, formatString?: string) => string;
  /** Met à jour le fuseau horaire manuellement */
  setTimezone: (timezone: string) => void;
}

/**
 * Hook pour gérer le fuseau horaire de l'utilisateur
 *
 * @param userTimezone - Fuseau horaire stocké dans le profil utilisateur (optionnel)
 * @returns Objet contenant le fuseau horaire et les utilitaires de conversion
 *
 * @example
 * // Dans un composant Player
 * function PlayerCalendar() {
 *   const { timezone, toLocalTime, formatLocal } = useTimezone();
 *
 *   // Convertir une disponibilité UTC en heure locale
 *   const localStart = toLocalTime(availability.start);
 *
 *   // Ou formater directement
 *   const timeString = formatLocal(availability.start, 'HH:mm');
 *
 *   return <div>Disponible à {timeString}</div>
 * }
 */
export function useTimezone(userTimezone?: string | null): UseTimezoneReturn {
  const [detectedTimezone, setDetectedTimezone] = useState<string>('UTC');
  const [timezone, setTimezone] = useState<string>(userTimezone || 'UTC');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Détecter le fuseau horaire du navigateur
    const detected = detectBrowserTimezone();
    setDetectedTimezone(detected);

    // Si l'utilisateur n'a pas de fuseau horaire configuré, utiliser celui détecté
    if (!userTimezone) {
      setTimezone(detected);
    }

    setIsLoaded(true);
  }, [userTimezone]);

  // Mettre à jour si userTimezone change (après connexion ou mise à jour du profil)
  useEffect(() => {
    if (userTimezone) {
      setTimezone(userTimezone);
    }
  }, [userTimezone]);

  const toLocalTime = (utcDate: Date | string): Date => {
    return convertUTCToLocal(utcDate, timezone);
  };

  const formatLocal = (utcDate: Date | string, formatString: string = 'PPpp'): string => {
    return formatInTimezone(utcDate, timezone, formatString);
  };

  return {
    timezone,
    detectedTimezone,
    isLoaded,
    toLocalTime,
    formatLocal,
    setTimezone,
  };
}

/**
 * Hook pour obtenir le fuseau horaire du coach
 * Utilisé dans le dashboard coach pour afficher/créer des disponibilités
 *
 * @param coachTimezone - Fuseau horaire stocké dans le profil du coach
 * @returns Fuseau horaire du coach (ou détecté si non configuré)
 */
export function useCoachTimezone(coachTimezone?: string | null): string {
  const [timezone, setTimezone] = useState<string>(coachTimezone || 'UTC');

  useEffect(() => {
    if (!coachTimezone) {
      // Si le coach n'a pas configuré son fuseau horaire, détecter celui du navigateur
      const detected = detectBrowserTimezone();
      setTimezone(detected);
    } else {
      setTimezone(coachTimezone);
    }
  }, [coachTimezone]);

  return timezone;
}
