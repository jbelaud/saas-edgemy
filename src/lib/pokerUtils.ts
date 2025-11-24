import { 
  POKER_FORMATS, 
  POKER_VARIANTS, 
  COACHING_CATEGORIES, 
  SUPPORTED_LANGUAGES,
  normalizeFormats,
  normalizeLanguages
} from '@/constants/poker';

// Récupérer le libellé d'un format à partir de sa valeur
export function getFormatLabel(formatValue: string): string {
  const format = POKER_FORMATS.find(f => f.value === formatValue);
  return format ? format.label : formatValue;
}

// Récupérer le libellé d'une variante à partir de sa valeur
export function getVariantLabel(variantValue: string): string {
  const variant = POKER_VARIANTS.find(v => v.value === variantValue);
  return variant ? variant.label : variantValue;
}

// Récupérer le libellé d'une catégorie à partir de sa valeur
export function getCategoryLabel(categoryValue: string): string {
  const category = COACHING_CATEGORIES.find(c => c.value === categoryValue);
  return category ? category.label : categoryValue;
}

// Récupérer le libellé d'une langue à partir de son code
export function getLanguageLabel(langCode: string): string {
  const lang = SUPPORTED_LANGUAGES.find(l => l.value === langCode.toLowerCase());
  return lang ? lang.label : langCode.toUpperCase();
}

// Filtrer les formats de jeu pour un coach
export function filterCoachFormats(formats: string[]): string[] {
  const normalized = normalizeFormats(formats);
  const validFormats = POKER_FORMATS.map(f => f.value);
  return normalized.filter(f => validFormats.includes(f));
}

// Filtrer les catégories pour un coach
export function filterCoachCategories(categories: string[]): string[] {
  const validCategories = COACHING_CATEGORIES.map(c => c.value);
  return categories
    .map(c => c.trim())
    .filter(c => validCategories.includes(c));
}

// Filtrer les langues pour un coach
export function filterCoachLanguages(languages: string[]): string[] {
  const normalized = normalizeLanguages(languages);
  const validLanguages = SUPPORTED_LANGUAGES.map(l => l.value);
  return normalized.filter(l => validLanguages.includes(l));
}

// Formater une liste de formats pour l'affichage
export function formatFormatsList(formats: string[] | undefined | null): string[] {
  if (!formats || !Array.isArray(formats)) {
    return [];
  }
  return normalizeFormats(formats).map(getFormatLabel);
}

// Formater une liste de catégories pour l'affichage
export function formatCategoriesList(categories: string[] | undefined | null): string[] {
  if (!categories || !Array.isArray(categories)) {
    return [];
  }
  return categories.map(getCategoryLabel);
}

// Formater une liste de langues pour l'affichage
export function formatLanguagesList(languages: string[] | undefined | null): string[] {
  if (!languages || !Array.isArray(languages)) {
    return [];
  }
  return normalizeLanguages(languages).map(getLanguageLabel);
}

// Vérifier si un format est valide
export function isValidFormat(format: string): boolean {
  return POKER_FORMATS.some(f => f.value === format);
}

// Vérifier si une catégorie est valide
export function isValidCategory(category: string): boolean {
  return COACHING_CATEGORIES.some(c => c.value === category);
}

// Vérifier si une langue est valide
export function isValidLanguage(lang: string): boolean {
  return SUPPORTED_LANGUAGES.some(l => l.value === lang.toLowerCase());
}
