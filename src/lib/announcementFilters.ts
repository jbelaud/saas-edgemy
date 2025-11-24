/**
 * ═══════════════════════════════════════════════════════════════════════
 * SYSTÈME DE FILTRAGE DYNAMIQUE DES ANNONCES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Ce module gère les filtres dynamiques qui changent selon le type
 * d'annonce sélectionné (STRATEGY, REVIEW, TOOL, MENTAL).
 *
 * Architecture :
 * 1. Les utilisateurs sélectionnent d'abord un TYPE d'annonce
 * 2. Les filtres disponibles changent dynamiquement selon le type
 * 3. Tous les filtres utilisent les constantes canoniques
 * 4. Aucune valeur en dur, tout vient de src/constants/announcements.ts
 */

import {
  ANNOUNCEMENT_TYPES,
  STRATEGY_VARIANTS,
  STRATEGY_FORMATS,
  REVIEW_TYPES,
  REVIEW_FORMATS,
  REVIEW_SUPPORTS,
  TOOL_NAMES,
  TOOL_OBJECTIVES,
  MENTAL_FOCUS_AREAS,
  SUPPORTED_LANGUAGES,
  getStrategyVariantLabel,
  getStrategyFormatLabel,
  getReviewTypeLabel,
  getReviewFormatLabel,
  getReviewSupportLabel,
  getToolNameLabel,
  getToolObjectiveLabel,
  getMentalFocusLabel,
  getLanguageLabel,
  type AnnouncementType,
} from '@/constants/announcements';
import { normalizeLanguages } from '@/constants/poker';

// ═══════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════

export interface FilterOption {
  value: string;
  label: string;
}

export interface AnnouncementData {
  id: string;
  type: string;
  // Champs STRATEGY
  variant?: string | null;
  format?: string | null;
  abiRange?: string | null;
  tags?: string[];
  // Champs REVIEW
  reviewType?: string | null;
  reviewSupport?: string | null;
  // Champs TOOL
  toolName?: string | null;
  toolObjective?: string | null;
  // Champs MENTAL
  mentalFocus?: string | null;
  // Champs communs
  priceCents: number;
  durationMin: number;
}

export interface CoachWithAnnouncements {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  languages: string[];
  announcements: AnnouncementData[];
}

export interface DynamicFilters {
  // Filtre principal
  announcementTypes: FilterOption[];

  // Filtres STRATEGY
  strategyVariants: FilterOption[];
  strategyFormats: FilterOption[];
  abiRanges: FilterOption[];

  // Filtres REVIEW
  reviewTypes: FilterOption[];
  reviewFormats: FilterOption[];
  reviewSupports: FilterOption[];

  // Filtres TOOL
  toolNames: FilterOption[];
  toolObjectives: FilterOption[];

  // Filtres MENTAL
  mentalFocusAreas: FilterOption[];

  // Filtres communs
  languages: FilterOption[];
  priceRanges: FilterOption[];
}

// ═══════════════════════════════════════════════════════════════════════
// EXTRACTION DES FILTRES DEPUIS LES DONNÉES
// ═══════════════════════════════════════════════════════════════════════

/**
 * Extrait tous les filtres possibles à partir des coachs et leurs annonces
 */
export function extractDynamicFilters(
  coaches: CoachWithAnnouncements[]
): DynamicFilters {
  // Vérification défensive
  if (!coaches || !Array.isArray(coaches) || coaches.length === 0) {
    return {
      announcementTypes: [],
      strategyVariants: [],
      strategyFormats: [],
      abiRanges: [],
      reviewTypes: [],
      reviewFormats: [],
      reviewSupports: [],
      toolNames: [],
      toolObjectives: [],
      mentalFocusAreas: [],
      languages: [],
      priceRanges: [],
    };
  }

  // Collecter toutes les annonces
  const allAnnouncements = coaches.flatMap((coach) =>
    coach.announcements && Array.isArray(coach.announcements) ? coach.announcements : []
  );

  // Types d'annonces présents
  const types = new Set<string>();
  allAnnouncements.forEach((a) => types.add(a.type));

  // STRATEGY - Collecte
  const strategyVariants = new Set<string>();
  const strategyFormats = new Set<string>();
  const abiRanges = new Set<string>();

  // REVIEW - Collecte
  const reviewTypes = new Set<string>();
  const reviewFormats = new Set<string>();
  const reviewSupports = new Set<string>();

  // TOOL - Collecte
  const toolNames = new Set<string>();
  const toolObjectives = new Set<string>();

  // MENTAL - Collecte
  const mentalFocusAreas = new Set<string>();

  // Langues
  const languages = new Set<string>();
  coaches.forEach((coach) => {
    if (coach.languages && Array.isArray(coach.languages)) {
      coach.languages.forEach((lang) => languages.add(lang));
    }
  });

  // Extraire les valeurs selon le type
  allAnnouncements.forEach((announcement) => {
    switch (announcement.type) {
      case 'STRATEGY':
        if (announcement.variant) strategyVariants.add(announcement.variant);
        if (announcement.format) strategyFormats.add(announcement.format);
        if (announcement.abiRange) abiRanges.add(announcement.abiRange);
        break;

      case 'REVIEW':
        if (announcement.reviewType) reviewTypes.add(announcement.reviewType);
        if (announcement.format) reviewFormats.add(announcement.format);
        if (announcement.reviewSupport)
          reviewSupports.add(announcement.reviewSupport);
        break;

      case 'TOOL':
        if (announcement.toolName) toolNames.add(announcement.toolName);
        if (announcement.toolObjective)
          toolObjectives.add(announcement.toolObjective);
        break;

      case 'MENTAL':
        if (announcement.mentalFocus)
          mentalFocusAreas.add(announcement.mentalFocus);
        break;
    }
  });

  // Prix - Génération de plages
  const prices = allAnnouncements
    .filter((a) => a && typeof a.priceCents === 'number')
    .map((a) => a.priceCents / 100);

  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    announcementTypes: Array.from(types)
      .filter((type) => ANNOUNCEMENT_TYPES.some((t) => t.value === type))
      .sort()
      .map((type) => {
        const typeObj = ANNOUNCEMENT_TYPES.find((t) => t.value === type);
        return {
          value: type,
          label: typeObj?.label || type,
        };
      }),

    strategyVariants: Array.from(strategyVariants)
      .filter((v) => STRATEGY_VARIANTS.some((sv) => sv.value === v))
      .sort()
      .map((v) => ({ value: v, label: getStrategyVariantLabel(v) })),

    strategyFormats: Array.from(strategyFormats)
      .filter((f) => STRATEGY_FORMATS.some((sf) => sf.value === f))
      .sort()
      .map((f) => ({ value: f, label: getStrategyFormatLabel(f) })),

    abiRanges: Array.from(abiRanges)
      .sort()
      .map((range) => ({ value: range, label: range })),

    reviewTypes: Array.from(reviewTypes)
      .filter((t) => REVIEW_TYPES.some((rt) => rt.value === t))
      .sort()
      .map((t) => ({ value: t, label: getReviewTypeLabel(t) })),

    reviewFormats: Array.from(reviewFormats)
      .filter((f) => REVIEW_FORMATS.some((rf) => rf.value === f))
      .sort()
      .map((f) => ({ value: f, label: getReviewFormatLabel(f) })),

    reviewSupports: Array.from(reviewSupports)
      .filter((s) => REVIEW_SUPPORTS.some((rs) => rs.value === s))
      .sort()
      .map((s) => ({ value: s, label: getReviewSupportLabel(s) })),

    toolNames: Array.from(toolNames)
      .filter((t) => TOOL_NAMES.some((tn) => tn.value === t))
      .sort()
      .map((t) => ({ value: t, label: getToolNameLabel(t) })),

    toolObjectives: Array.from(toolObjectives)
      .filter((o) => TOOL_OBJECTIVES.some((to) => to.value === o))
      .sort()
      .map((o) => ({ value: o, label: getToolObjectiveLabel(o) })),

    mentalFocusAreas: Array.from(mentalFocusAreas)
      .filter((f) => MENTAL_FOCUS_AREAS.some((mf) => mf.value === f))
      .sort()
      .map((f) => ({ value: f, label: getMentalFocusLabel(f) })),

    languages: Array.from(languages)
      .filter((code) => SUPPORTED_LANGUAGES.some((l) => l.value === code))
      .sort()
      .map((code) => ({ value: code, label: getLanguageLabel(code) })),

    priceRanges: generatePriceRanges(minPrice, maxPrice),
  };
}

/**
 * Génère des plages de prix intelligentes
 */
function generatePriceRanges(min: number, max: number): FilterOption[] {
  if (max === 0 || min === max) return [];

  const ranges: FilterOption[] = [];
  const step = Math.ceil((max - min) / 5);

  for (let i = 0; i < 5; i++) {
    const rangeMin = Math.floor(min + i * step);
    const rangeMax = Math.floor(min + (i + 1) * step);
    ranges.push({
      value: `${rangeMin}-${rangeMax}`,
      label: `${rangeMin}€ - ${rangeMax}€`,
    });
  }

  return ranges;
}

// ═══════════════════════════════════════════════════════════════════════
// NORMALISATION DES DONNÉES COACH
// ═══════════════════════════════════════════════════════════════════════

/**
 * Normalise les données d'un coach pour garantir des valeurs canoniques
 */
export function normalizeCoachAnnouncements(
  coach: CoachWithAnnouncements
): CoachWithAnnouncements {
  return {
    ...coach,
    languages: normalizeLanguages(coach.languages || []),
    announcements: (coach.announcements || []).map((announcement) => {
      // Validation du type
      const isValidType = ANNOUNCEMENT_TYPES.some(
        (t) => t.value === announcement.type
      );

      if (!isValidType) {
        // Type invalide - on le garde mais on le signale
        console.warn(`Type d'annonce invalide: ${announcement.type}`);
      }

      return announcement;
    }),
  };
}

// ═══════════════════════════════════════════════════════════════════════
// FILTRAGE
// ═══════════════════════════════════════════════════════════════════════

export interface ActiveFilters {
  // Recherche textuelle
  search?: string;

  // Type d'annonce sélectionné
  selectedAnnouncementType?: string;

  // Filtres STRATEGY
  selectedStrategyVariants?: string[];
  selectedStrategyFormats?: string[];
  selectedAbiRanges?: string[];

  // Filtres REVIEW
  selectedReviewTypes?: string[];
  selectedReviewFormats?: string[];
  selectedReviewSupports?: string[];

  // Filtres TOOL
  selectedToolNames?: string[];
  selectedToolObjectives?: string[];

  // Filtres MENTAL
  selectedMentalFocusAreas?: string[];

  // Filtres communs
  selectedLanguages?: string[];
  selectedPriceRange?: string;
}

/**
 * Filtre les coachs selon les filtres actifs
 */
export function filterCoaches(
  coaches: CoachWithAnnouncements[],
  filters: ActiveFilters
): CoachWithAnnouncements[] {
  // Vérification défensive
  if (!coaches || !Array.isArray(coaches)) {
    return [];
  }

  return coaches
    .map((coach) => {
      // Vérification défensive des annonces
      if (!coach.announcements || !Array.isArray(coach.announcements)) {
        return null;
      }

      // Filtrer les annonces du coach selon le type sélectionné
      let filteredAnnouncements = coach.announcements;

      // Filtre par type d'annonce
      if (
        filters.selectedAnnouncementType &&
        filters.selectedAnnouncementType.length > 0
      ) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) => a.type === filters.selectedAnnouncementType
        );
      }

      // Filtres STRATEGY
      if (filters.selectedStrategyVariants?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'STRATEGY' &&
            a.variant &&
            filters.selectedStrategyVariants!.includes(a.variant)
        );
      }

      if (filters.selectedStrategyFormats?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'STRATEGY' &&
            a.format &&
            filters.selectedStrategyFormats!.includes(a.format)
        );
      }

      if (filters.selectedAbiRanges?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'STRATEGY' &&
            a.abiRange &&
            filters.selectedAbiRanges!.includes(a.abiRange)
        );
      }

      // Filtres REVIEW
      if (filters.selectedReviewTypes?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'REVIEW' &&
            a.reviewType &&
            filters.selectedReviewTypes!.includes(a.reviewType)
        );
      }

      if (filters.selectedReviewFormats?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'REVIEW' &&
            a.format &&
            filters.selectedReviewFormats!.includes(a.format)
        );
      }

      if (filters.selectedReviewSupports?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'REVIEW' &&
            a.reviewSupport &&
            filters.selectedReviewSupports!.includes(a.reviewSupport)
        );
      }

      // Filtres TOOL
      if (filters.selectedToolNames?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'TOOL' &&
            a.toolName &&
            filters.selectedToolNames!.includes(a.toolName)
        );
      }

      if (filters.selectedToolObjectives?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'TOOL' &&
            a.toolObjective &&
            filters.selectedToolObjectives!.includes(a.toolObjective)
        );
      }

      // Filtres MENTAL
      if (filters.selectedMentalFocusAreas?.length) {
        filteredAnnouncements = filteredAnnouncements.filter(
          (a) =>
            a.type === 'MENTAL' &&
            a.mentalFocus &&
            filters.selectedMentalFocusAreas!.includes(a.mentalFocus)
        );
      }

      // Filtre par prix
      if (filters.selectedPriceRange) {
        const [minPrice, maxPrice] = filters.selectedPriceRange
          .split('-')
          .map((p) => parseInt(p, 10));

        filteredAnnouncements = filteredAnnouncements.filter((a) => {
          const price = a.priceCents / 100;
          return price >= minPrice && price <= maxPrice;
        });
      }

      // Si aucune annonce ne correspond, exclure le coach
      if (filteredAnnouncements.length === 0) {
        return null;
      }

      return {
        ...coach,
        announcements: filteredAnnouncements,
      };
    })
    .filter((coach): coach is CoachWithAnnouncements => coach !== null)
    .filter((coach) => {
      // Filtre par langue
      if (filters.selectedLanguages?.length) {
        const hasMatchingLanguage = (coach.languages || []).some((lang) =>
          filters.selectedLanguages!.includes(lang)
        );
        if (!hasMatchingLanguage) return false;
      }

      // Filtre par recherche textuelle
      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.trim().toLowerCase();
        const fullName = `${coach.firstName} ${coach.lastName}`.toLowerCase();
        const bio = (coach.bio || '').toLowerCase();

        return fullName.includes(query) || bio.includes(query);
      }

      return true;
    });
}
