/**
 * Utilitaires de gestion des fuseaux horaires pour Edgemy
 *
 * Principes:
 * - Toutes les dates sont stockées en UTC dans la base de données
 * - Les coaches ont un timezone configuré dans leur profil
 * - Les joueurs ont un timezone détecté automatiquement (ou configuré manuellement)
 * - Les conversions se font toujours: Local → UTC (stockage) et UTC → Local (affichage)
 */

import { toZonedTime, fromZonedTime, format as formatTz } from 'date-fns-tz';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Liste des fuseaux horaires les plus courants
 */
export const COMMON_TIMEZONES = [
  { value: 'Europe/Paris', label: 'Paris (Europe/Paris)', offset: 'UTC+1/+2' },
  { value: 'Europe/London', label: 'Londres (Europe/London)', offset: 'UTC+0/+1' },
  { value: 'America/New_York', label: 'New York (America/New_York)', offset: 'UTC-5/-4' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (America/Los_Angeles)', offset: 'UTC-8/-7' },
  { value: 'America/Chicago', label: 'Chicago (America/Chicago)', offset: 'UTC-6/-5' },
  { value: 'America/Toronto', label: 'Toronto (America/Toronto)', offset: 'UTC-5/-4' },
  { value: 'America/Sao_Paulo', label: 'São Paulo (America/Sao_Paulo)', offset: 'UTC-3' },
  { value: 'Asia/Tokyo', label: 'Tokyo (Asia/Tokyo)', offset: 'UTC+9' },
  { value: 'Asia/Shanghai', label: 'Shanghai (Asia/Shanghai)', offset: 'UTC+8' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong (Asia/Hong_Kong)', offset: 'UTC+8' },
  { value: 'Asia/Singapore', label: 'Singapour (Asia/Singapore)', offset: 'UTC+8' },
  { value: 'Asia/Dubai', label: 'Dubai (Asia/Dubai)', offset: 'UTC+4' },
  { value: 'Asia/Jakarta', label: 'Jakarta (Asia/Jakarta)', offset: 'UTC+7' },
  { value: 'Asia/Bangkok', label: 'Bangkok (Asia/Bangkok)', offset: 'UTC+7' },
  { value: 'Asia/Manila', label: 'Manila (Asia/Manila)', offset: 'UTC+8' },
  { value: 'Australia/Sydney', label: 'Sydney (Australia/Sydney)', offset: 'UTC+10/+11' },
  { value: 'Pacific/Auckland', label: 'Auckland (Pacific/Auckland)', offset: 'UTC+12/+13' },
  { value: 'UTC', label: 'UTC (Temps Universel)', offset: 'UTC+0' },
] as const;

/**
 * Détecte le fuseau horaire du navigateur de l'utilisateur
 * Utilise l'API Intl.DateTimeFormat pour obtenir le fuseau horaire IANA
 */
export function detectBrowserTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || 'UTC';
  } catch (error) {
    console.error('Erreur lors de la détection du fuseau horaire:', error);
    return 'UTC';
  }
}

/**
 * Convertit une date locale (dans le fuseau horaire spécifié) vers UTC
 * Utilisé côté backend lors de la création de disponibilités
 *
 * @param localDate - Date dans le fuseau horaire local
 * @param timezone - Fuseau horaire IANA (ex: 'Asia/Jakarta')
 * @returns Date UTC pour stockage en base de données
 *
 * @example
 * // Un coach à Jakarta ajoute une disponibilité de 18:00 à 22:00 (heure locale)
 * const startLocal = new Date('2025-01-20T18:00:00'); // 18:00 Jakarta
 * const startUTC = convertLocalToUTC(startLocal, 'Asia/Jakarta');
 * // startUTC = 2025-01-20T11:00:00.000Z (11:00 UTC = 18:00 Jakarta)
 */
export function convertLocalToUTC(localDate: Date, timezone: string): Date {
  try {
    // fromZonedTime traite la date comme étant dans le fuseau horaire spécifié
    // et la convertit en UTC
    return fromZonedTime(localDate, timezone);
  } catch (error) {
    console.error('Erreur lors de la conversion local → UTC:', error);
    return localDate; // Fallback: retourner la date originale
  }
}

/**
 * Convertit une date UTC vers le fuseau horaire local
 * Utilisé côté frontend pour afficher les disponibilités
 *
 * @param utcDate - Date UTC (depuis la base de données)
 * @param timezone - Fuseau horaire IANA de destination
 * @returns Date dans le fuseau horaire local
 *
 * @example
 * // Un joueur à Paris voit la disponibilité d'un coach à Jakarta
 * const utcDate = new Date('2025-01-20T11:00:00.000Z'); // 11:00 UTC
 * const parisDate = convertUTCToLocal(utcDate, 'Europe/Paris');
 * // parisDate représente 12:00 à Paris (11:00 UTC + 1h)
 */
export function convertUTCToLocal(utcDate: Date | string, timezone: string): Date {
  try {
    const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
    // toZonedTime convertit une date UTC vers le fuseau horaire spécifié
    return toZonedTime(date, timezone);
  } catch (error) {
    console.error('Erreur lors de la conversion UTC → local:', error);
    const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
    return date;
  }
}

/**
 * Formate une date UTC pour l'affichage dans un fuseau horaire spécifique
 *
 * @param utcDate - Date UTC
 * @param timezone - Fuseau horaire IANA
 * @param formatString - Format date-fns (défaut: 'PPpp' = date + heure complète)
 * @returns Chaîne formatée dans le fuseau horaire local
 *
 * @example
 * const utcDate = new Date('2025-01-20T11:00:00.000Z');
 * formatInTimezone(utcDate, 'Asia/Jakarta', 'HH:mm')
 * // Retourne: "18:00"
 */
export function formatInTimezone(
  utcDate: Date | string,
  timezone: string,
  formatString: string = 'PPpp'
): string {
  try {
    const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
    return formatTz(date, formatString, { timeZone: timezone, locale: fr });
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    const date = typeof utcDate === 'string' ? parseISO(utcDate) : utcDate;
    return format(date, formatString, { locale: fr });
  }
}

/**
 * Obtient le décalage horaire (offset) en heures par rapport à UTC
 *
 * @param timezone - Fuseau horaire IANA
 * @param date - Date de référence (pour gérer le DST)
 * @returns Décalage en heures (ex: +7 pour Jakarta, +1 pour Paris en hiver)
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  try {
    const zonedDate = toZonedTime(date, timezone);
    const utcDate = fromZonedTime(zonedDate, timezone);
    const offsetMs = zonedDate.getTime() - utcDate.getTime();
    return offsetMs / (1000 * 60 * 60);
  } catch (error) {
    console.error('Erreur lors du calcul du décalage horaire:', error);
    return 0;
  }
}

/**
 * Vérifie si deux créneaux horaires se chevauchent (dans le même fuseau horaire)
 *
 * @param start1 - Début du premier créneau
 * @param end1 - Fin du premier créneau
 * @param start2 - Début du second créneau
 * @param end2 - Fin du second créneau
 * @returns true si les créneaux se chevauchent
 */
export function doTimeSlotsOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Formate un fuseau horaire pour l'affichage (avec offset)
 *
 * @param timezone - Fuseau horaire IANA
 * @returns Chaîne formatée (ex: "UTC+7" ou "UTC-5")
 */
export function formatTimezoneDisplay(timezone: string): string {
  const offset = getTimezoneOffset(timezone);
  const sign = offset >= 0 ? '+' : '';
  return `UTC${sign}${offset}`;
}

/**
 * Valide qu'une chaîne représente un fuseau horaire IANA valide
 *
 * @param timezone - Fuseau horaire à valider
 * @returns true si le fuseau horaire est valide
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtient le fuseau horaire par défaut (Europe/Paris pour l'Europe, UTC sinon)
 */
export function getDefaultTimezone(): string {
  const detected = detectBrowserTimezone();

  // Si le fuseau détecté est européen, on le garde
  if (detected.startsWith('Europe/')) {
    return detected;
  }

  // Sinon, on suggère Europe/Paris comme défaut pour les coachs francophones
  return 'Europe/Paris';
}
