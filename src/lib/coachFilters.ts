/**
 * Centralized filter utilities for coach exploration
 *
 * This module provides utilities to extract, normalize, and display
 * filter options for the coach exploration page.
 *
 * All filter values MUST come from the canonical constants defined in
 * src/constants/poker.ts to ensure consistency across the application.
 */

import {
  POKER_FORMATS,
  COACHING_CATEGORIES,
  SUPPORTED_LANGUAGES,
  normalizeFormats,
  normalizeLanguages,
  getLanguageDisplayLabel,
} from '@/constants/poker';

export interface FilterOptions {
  languages: Array<{ value: string; label: string }>;
  formats: Array<{ value: string; label: string }>;
  types: Array<{ value: string; label: string }>;
}

export interface Coach {
  formats: string[];
  languages: string[];
  announcementTypes: string[];
}

/**
 * Extract unique filter options from a list of coaches.
 * Only returns valid values that match the canonical constants.
 *
 * @param coaches - Array of coaches with normalized data
 * @returns Filter options with value/label pairs for UI
 */
export function extractFilterOptions(coaches: Coach[]): FilterOptions {
  // Collect all unique values
  const languageCodes = new Set<string>();
  const formatValues = new Set<string>();
  const typeValues = new Set<string>();

  coaches.forEach((coach) => {
    coach.languages.forEach((lang) => languageCodes.add(lang));
    coach.formats.forEach((format) => formatValues.add(format));
    coach.announcementTypes.forEach((type) => typeValues.add(type));
  });

  // Convert to arrays and validate against canonical lists
  const validLanguages = Array.from(languageCodes)
    .filter((code) => SUPPORTED_LANGUAGES.some((l) => l.value === code))
    .sort();

  const validFormats = Array.from(formatValues)
    .filter((format) => POKER_FORMATS.some((f) => f.value === format))
    .sort();

  const validTypes = Array.from(typeValues)
    .filter((type) => COACHING_CATEGORIES.some((c) => c.value === type))
    .sort();

  // Build filter options with labels
  return {
    languages: validLanguages.map((code) => ({
      value: code,
      label: getLanguageDisplayLabel(code),
    })),
    formats: validFormats.map((value) => {
      const format = POKER_FORMATS.find((f) => f.value === value);
      return {
        value,
        label: format?.label || value,
      };
    }),
    types: validTypes.map((value) => {
      const category = COACHING_CATEGORIES.find((c) => c.value === value);
      return {
        value,
        label: category?.label || value,
      };
    }),
  };
}

/**
 * Normalize coach data to ensure all filter fields use canonical values.
 * This is a defensive function to sanitize data from the API.
 *
 * @param coach - Raw coach data
 * @returns Coach with normalized filter fields
 */
export function normalizeCoachForFilters<T extends Coach>(coach: T): T {
  return {
    ...coach,
    formats: normalizeFormats(coach.formats),
    languages: normalizeLanguages(coach.languages),
    announcementTypes: coach.announcementTypes.filter((type) =>
      COACHING_CATEGORIES.some((c) => c.value === type)
    ),
  };
}

/**
 * Apply filters to a list of coaches.
 *
 * @param coaches - Array of coaches to filter
 * @param filters - Active filter values
 * @returns Filtered coaches
 */
export function filterCoaches<T extends Coach>(
  coaches: T[],
  filters: {
    search?: string;
    languages?: string[];
    formats?: string[];
    types?: string[];
  }
): T[] {
  return coaches.filter((coach) => {
    // Note: Search filter is handled in the component level
    // This function focuses on structured filters only

    // Language filter (OR logic - coach has at least one selected language)
    if (filters.languages && filters.languages.length > 0) {
      const hasMatchingLanguage = coach.languages.some((lang) =>
        filters.languages!.includes(lang)
      );
      if (!hasMatchingLanguage) return false;
    }

    // Format filter (OR logic - coach offers at least one selected format)
    if (filters.formats && filters.formats.length > 0) {
      const hasMatchingFormat = coach.formats.some((format) =>
        filters.formats!.includes(format)
      );
      if (!hasMatchingFormat) return false;
    }

    // Type filter (OR logic - coach has at least one selected type)
    if (filters.types && filters.types.length > 0) {
      const hasMatchingType = coach.announcementTypes.some((type) =>
        filters.types!.includes(type)
      );
      if (!hasMatchingType) return false;
    }

    return true;
  });
}
