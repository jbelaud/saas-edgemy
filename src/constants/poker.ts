// Formats de poker standardisés
export const POKER_FORMATS = [
  { value: 'MTT', label: 'MTT (Tournoi Multi-Tables)' },
  { value: 'CASH_GAME', label: 'Cash Game' },
  { value: 'SNG', label: 'Sit & Go' },
  { value: 'SPIN', label: 'Spin & Go' },
  { value: 'BOUNTY', label: 'Bounty' },
  { value: 'HYPER', label: 'Hyper Turbo' },
  { value: 'REBUY', label: 'Rebuy' },
];

// Variantes de poker
export const POKER_VARIANTS = [
  { value: 'NLHE', label: 'NLHE (No Limit Hold\'em)' },
  { value: 'PLO', label: 'PLO (Pot Limit Omaha)' },
  { value: 'PLO5', label: 'PLO5 (Pot Limit Omaha 5 cartes)' },
  { value: 'PLO6', label: 'PLO6 (Pot Limit Omaha 6 cartes)' },
  { value: 'BIG_O', label: 'Big O' },
  { value: 'STUD', label: 'Stud' },
  { value: 'RAZZ', label: 'Razz' },
  { value: 'MIXED', label: 'Mixed (Mixte)' },
];

// Catégories de coaching
export const COACHING_CATEGORIES = [
  { value: 'STRATEGY', label: 'Stratégie' },
  { value: 'REVIEW', label: 'Analyse de main' },
  { value: 'TOOL', label: 'Outil/Logiciel' },
  { value: 'MENTAL', label: 'Mental' },
  { value: 'GTO', label: 'GTO' },
  { value: 'EXPLOITATIVE', label: 'Jeu exploitatif' },
  { value: 'BANKROLL', label: 'Gestion de bankroll' },
  { value: 'ICM', label: 'ICM' },
  { value: 'POSTFLOP', label: 'Postflop' },
  { value: 'PREFLOP', label: 'Préflop' },
  { value: 'TILT', label: 'Gestion du tilt' },
];

// Langues supportées (au format ISO 639-1)
export const SUPPORTED_LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
];

// Mappage des formats pour la compatibilité ascendante
// Permet de gérer les anciennes valeurs dans la base de données
export const FORMAT_ALIASES: Record<string, string> = {
  'CASH': 'CASH_GAME',
  'Cash Game': 'CASH_GAME',
  'Cash': 'CASH_GAME',
  'MTT': 'MTT',
  'SNG': 'SNG',
  'SPIN': 'SPIN',
};

// Fonction pour normaliser un format
// Remplace les alias par les valeurs standardisées
export function normalizeFormat(format: string): string {
  return FORMAT_ALIASES[format.toUpperCase()] || format;
}

// Fonction pour normaliser une liste de formats
export function normalizeFormats(formats: string[]): string[] {
  const normalized = formats.map(format => {
    const trimmed = format.trim();
    return FORMAT_ALIASES[trimmed.toUpperCase()] || trimmed;
  });
  
  // Supprimer les doublons
  return [...new Set(normalized)];
}

// Mappage des alias de langues (pour gérer les anciennes valeurs)
export const LANGUAGE_ALIASES: Record<string, string> = {
  'french': 'fr',
  'français': 'fr',
  'francais': 'fr',
  'english': 'en',
  'anglais': 'en',
  'spanish': 'es',
  'espagnol': 'es',
  'portuguese': 'pt',
  'portugais': 'pt',
  'german': 'de',
  'allemand': 'de',
  'italian': 'it',
  'italien': 'it',
};

// Fonction pour normaliser une langue
export function normalizeLanguage(language: string): string | null {
  const trimmed = language.trim().toLowerCase();

  // Vérifier si c'est déjà un code valide
  if (SUPPORTED_LANGUAGES.some(l => l.value === trimmed)) {
    return trimmed;
  }

  // Vérifier les alias
  if (LANGUAGE_ALIASES[trimmed]) {
    return LANGUAGE_ALIASES[trimmed];
  }

  return null; // Invalide
}

// Fonction pour normaliser les langues (en minuscules)
export function normalizeLanguages(languages: string[]): string[] {
  const normalized = languages
    .map(normalizeLanguage)
    .filter((lang): lang is string => lang !== null);

  // Supprimer les doublons
  return [...new Set(normalized)];
}

// Fonction pour obtenir le libellé d'affichage d'une langue
export function getLanguageDisplayLabel(langCode: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.value === langCode.toLowerCase());
  return lang ? lang.label : langCode.toUpperCase();
}
