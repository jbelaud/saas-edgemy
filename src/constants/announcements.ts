/**
 * ═══════════════════════════════════════════════════════════════════════
 * CONSTANTES DES ANNONCES DE COACHING
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ce fichier contient TOUTES les valeurs canoniques utilisées dans les
 * formulaires de création d'annonces. Ces valeurs sont la SOURCE UNIQUE
 * DE VÉRITÉ pour le système de filtrage.
 *
 * ⚠️ IMPORTANT : Toute modification ici doit être synchronisée avec :
 *    - Les formulaires de création d'annonces
 *    - Le schéma Prisma (prisma/schema.prisma)
 *    - Le système de filtrage (src/lib/coachFilters.ts)
 */

// ═══════════════════════════════════════════════════════════════════════
// TYPES D'ANNONCES (Niveau principal)
// ═══════════════════════════════════════════════════════════════════════

export const ANNOUNCEMENT_TYPES = [
  { value: 'STRATEGY', label: 'Stratégie' },
  { value: 'REVIEW', label: 'Review' },
  { value: 'TOOL', label: 'Outil / Prise en main' },
  { value: 'MENTAL', label: 'Mental' },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// CHAMPS POUR ANNONCES "STRATEGY"
// ═══════════════════════════════════════════════════════════════════════

/**
 * Variantes de poker pour stratégie
 * Source: StrategyForm.tsx ligne 41-46
 */
export const STRATEGY_VARIANTS = [
  { value: 'NLHE', label: 'NLHE (No Limit Hold\'em)' },
  { value: 'PLO', label: 'PLO (Pot Limit Omaha)' },
  { value: 'PLO5', label: 'PLO5 (Pot Limit Omaha 5 cartes)' },
  { value: 'MIXED', label: 'Mixed (Mixte)' },
] as const;

/**
 * Formats de jeu pour stratégie
 * Source: StrategyForm.tsx ligne 48-53
 */
export const STRATEGY_FORMATS = [
  { value: 'MTT', label: 'MTT (Tournoi Multi-Tables)' },
  { value: 'CASH_GAME', label: 'Cash Game' },
  { value: 'SNG', label: 'Sit & Go' },
  { value: 'SPIN', label: 'Spin & Go' },
] as const;

/**
 * Tags communs pour stratégie
 * Source: StrategyForm.tsx ligne 62
 */
export const STRATEGY_COMMON_TAGS = [
  'ICM',
  '3-bet pot',
  'Postflop',
  'Preflop',
  'GTO',
  'Exploitant',
  'Multi-tables',
  'Bankroll',
] as const;

// ═══════════════════════════════════════════════════════════════════════
// CHAMPS POUR ANNONCES "REVIEW"
// ═══════════════════════════════════════════════════════════════════════

/**
 * Types de review
 * Source: ReviewForm.tsx ligne 40-45
 */
export const REVIEW_TYPES = [
  { value: 'SESSION_MTT', label: 'Session MTT' },
  { value: 'SESSION_CASH', label: 'Session Cash Game' },
  { value: 'HAND_SPECIFIC', label: 'Main spécifique' },
  { value: 'DATABASE', label: 'Database Review' },
] as const;

/**
 * Variantes pour review (identiques à strategy)
 * Source: ReviewForm.tsx ligne 47-52
 */
export const REVIEW_FORMATS = [
  { value: 'NLHE', label: 'NLHE (No Limit Hold\'em)' },
  { value: 'PLO', label: 'PLO (Pot Limit Omaha)' },
  { value: 'PLO5', label: 'PLO5 (Pot Limit Omaha 5 cartes)' },
  { value: 'MIXED', label: 'Mixed (Mixte)' },
] as const;

/**
 * Supports de review
 * Source: ReviewForm.tsx ligne 54-59
 */
export const REVIEW_SUPPORTS = [
  { value: 'VIDEO_REPLAY', label: 'Replay vidéo' },
  { value: 'SCREEN_SHARE', label: 'Partage d\'écran' },
  { value: 'HAND_IMPORT', label: 'Main importée' },
  { value: 'SOFTWARE', label: 'Via logiciel (HM3, PT4, etc.)' },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// CHAMPS POUR ANNONCES "TOOL"
// ═══════════════════════════════════════════════════════════════════════

/**
 * Noms d'outils
 * Source: ToolForm.tsx ligne 39-48
 */
export const TOOL_NAMES = [
  { value: 'GTO_WIZARD', label: 'GTO Wizard' },
  { value: 'HM3', label: 'Hold\'em Manager 3' },
  { value: 'PT4', label: 'PokerTracker 4' },
  { value: 'PIOSOLVER', label: 'PioSolver' },
  { value: 'FLOPZILLA', label: 'Flopzilla' },
  { value: 'ICMIZER', label: 'ICMizer' },
  { value: 'MENTAL', label: 'Mental' },
  { value: 'OTHER', label: 'Autre' },
] as const;

/**
 * Objectifs de formation outil
 * Source: ToolForm.tsx ligne 50-54
 */
export const TOOL_OBJECTIVES = [
  { value: 'ONBOARDING', label: 'Prise en main' },
  { value: 'ADVANCED', label: 'Optimisation avancée' },
  { value: 'SPOT_ANALYSIS', label: 'Analyse de spots' },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// CHAMPS POUR ANNONCES "MENTAL"
// ═══════════════════════════════════════════════════════════════════════

/**
 * Domaines de focus mental
 * Source: MentalForm.tsx ligne 38-46
 */
export const MENTAL_FOCUS_AREAS = [
  { value: 'TILT_MANAGEMENT', label: 'Gestion du tilt' },
  { value: 'CONFIDENCE', label: 'Confiance en soi' },
  { value: 'CONCENTRATION', label: 'Concentration' },
  { value: 'STRESS_MANAGEMENT', label: 'Gestion du stress' },
  { value: 'DECISION_MAKING', label: 'Prise de décision' },
  { value: 'BANKROLL_PSYCHOLOGY', label: 'Psychologie de la bankroll' },
  { value: 'PERFORMANCE', label: 'Performance globale' },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// LANGUES SUPPORTÉES
// ═══════════════════════════════════════════════════════════════════════

export const SUPPORTED_LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
] as const;

// ═══════════════════════════════════════════════════════════════════════
// HELPERS POUR OBTENIR LES LIBELLÉS
// ═══════════════════════════════════════════════════════════════════════

export function getAnnouncementTypeLabel(value: string): string {
  const type = ANNOUNCEMENT_TYPES.find((t) => t.value === value);
  return type ? type.label : value;
}

export function getStrategyVariantLabel(value: string): string {
  const variant = STRATEGY_VARIANTS.find((v) => v.value === value);
  return variant ? variant.label : value;
}

export function getStrategyFormatLabel(value: string): string {
  const format = STRATEGY_FORMATS.find((f) => f.value === value);
  return format ? format.label : value;
}

export function getReviewTypeLabel(value: string): string {
  const type = REVIEW_TYPES.find((t) => t.value === value);
  return type ? type.label : value;
}

export function getReviewFormatLabel(value: string): string {
  const format = REVIEW_FORMATS.find((f) => f.value === value);
  return format ? format.label : value;
}

export function getReviewSupportLabel(value: string): string {
  const support = REVIEW_SUPPORTS.find((s) => s.value === value);
  return support ? support.label : value;
}

export function getToolNameLabel(value: string): string {
  const tool = TOOL_NAMES.find((t) => t.value === value);
  return tool ? tool.label : value;
}

export function getToolObjectiveLabel(value: string): string {
  const objective = TOOL_OBJECTIVES.find((o) => o.value === value);
  return objective ? objective.label : value;
}

export function getMentalFocusLabel(value: string): string {
  const focus = MENTAL_FOCUS_AREAS.find((f) => f.value === value);
  return focus ? focus.label : value;
}

export function getLanguageLabel(code: string): string {
  const lang = SUPPORTED_LANGUAGES.find((l) => l.value === code.toLowerCase());
  return lang ? lang.label : code.toUpperCase();
}

// ═══════════════════════════════════════════════════════════════════════
// TYPES TYPESCRIPT
// ═══════════════════════════════════════════════════════════════════════

export type AnnouncementType = typeof ANNOUNCEMENT_TYPES[number]['value'];
export type StrategyVariant = typeof STRATEGY_VARIANTS[number]['value'];
export type StrategyFormat = typeof STRATEGY_FORMATS[number]['value'];
export type ReviewType = typeof REVIEW_TYPES[number]['value'];
export type ReviewFormat = typeof REVIEW_FORMATS[number]['value'];
export type ReviewSupport = typeof REVIEW_SUPPORTS[number]['value'];
export type ToolName = typeof TOOL_NAMES[number]['value'];
export type ToolObjective = typeof TOOL_OBJECTIVES[number]['value'];
export type MentalFocus = typeof MENTAL_FOCUS_AREAS[number]['value'];
export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['value'];
