'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard, GradientButton, Input } from '@/components/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Search, SlidersHorizontal, RotateCcw, Languages, DollarSign, ChevronDown, Check } from 'lucide-react';
import {
  extractDynamicFilters,
  filterCoaches,
  type CoachWithAnnouncements,
  type ActiveFilters,
} from '@/lib/announcementFilters';
import { getLanguageLabel } from '@/constants/announcements';

interface CoachsPageContentProps {
  locale: string;
}

export function CoachsPageContent({ locale }: CoachsPageContentProps) {
  const t = useTranslations('discoverCoaches');

  // État des données
  const [coaches, setCoaches] = useState<CoachWithAnnouncements[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // État de recherche
  const [search, setSearch] = useState('');

  // État UI
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [languagePopoverOpen, setLanguagePopoverOpen] = useState(false);
  const [pricePopoverOpen, setPricePopoverOpen] = useState(false);

  // État des filtres - Type d'annonce (principal)
  const [selectedAnnouncementType, setSelectedAnnouncementType] = useState<string>('');

  // État des filtres - STRATEGY
  const [selectedStrategyVariants, setSelectedStrategyVariants] = useState<string[]>([]);
  const [selectedStrategyFormats, setSelectedStrategyFormats] = useState<string[]>([]);
  const [selectedAbiRanges, setSelectedAbiRanges] = useState<string[]>([]);

  // État des filtres - REVIEW
  const [selectedReviewTypes, setSelectedReviewTypes] = useState<string[]>([]);
  const [selectedReviewFormats, setSelectedReviewFormats] = useState<string[]>([]);
  const [selectedReviewSupports, setSelectedReviewSupports] = useState<string[]>([]);

  // État des filtres - TOOL
  const [selectedToolNames, setSelectedToolNames] = useState<string[]>([]);
  const [selectedToolObjectives, setSelectedToolObjectives] = useState<string[]>([]);

  // État des filtres - MENTAL
  const [selectedMentalFocusAreas, setSelectedMentalFocusAreas] = useState<string[]>([]);

  // État des filtres - Communs
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [showInactiveCoaches, setShowInactiveCoaches] = useState<boolean>(true); // Par défaut, afficher tous les coachs

  // Chargement des coachs
  useEffect(() => {
    let isMounted = true;

    const fetchCoaches = async () => {
      try {
        const url = `/api/coach/explore${showInactiveCoaches ? '?showInactive=true' : ''}`;
        const response = await fetch(url, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error('Failed to load coaches');
        }
        const data = (await response.json()) as { coaches: CoachWithAnnouncements[] };
        if (isMounted) {
          setCoaches(data.coaches);
        }
      } catch {
        if (isMounted) {
          setError(t('states.error'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCoaches();

    return () => {
      isMounted = false;
    };
  }, [t, showInactiveCoaches]);

  // Extraction des filtres dynamiques
  const dynamicFilters = useMemo(() => {
    try {
      return extractDynamicFilters(coaches);
    } catch (error) {
      console.error('Erreur lors de l\'extraction des filtres:', error);
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
  }, [coaches]);

  // Calculer le min/max des prix disponibles
  const priceRange = useMemo(() => {
    const allAnnouncements = coaches.flatMap((c) => c.announcements || []);
    if (allAnnouncements.length === 0) return { min: 0, max: 1000 };

    const prices = allAnnouncements.map((a) => a.priceCents / 100);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [coaches]);

  // Initialiser les prix min/max quand les données changent
  useEffect(() => {
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
  }, [priceRange.min, priceRange.max]);

  // Construction de l'objet de filtres actifs
  const activeFilters: ActiveFilters = useMemo(
    () => ({
      search,
      selectedAnnouncementType: selectedAnnouncementType || undefined,
      selectedStrategyVariants: selectedStrategyVariants.length > 0 ? selectedStrategyVariants : undefined,
      selectedStrategyFormats: selectedStrategyFormats.length > 0 ? selectedStrategyFormats : undefined,
      selectedAbiRanges: selectedAbiRanges.length > 0 ? selectedAbiRanges : undefined,
      selectedReviewTypes: selectedReviewTypes.length > 0 ? selectedReviewTypes : undefined,
      selectedReviewFormats: selectedReviewFormats.length > 0 ? selectedReviewFormats : undefined,
      selectedReviewSupports: selectedReviewSupports.length > 0 ? selectedReviewSupports : undefined,
      selectedToolNames: selectedToolNames.length > 0 ? selectedToolNames : undefined,
      selectedToolObjectives: selectedToolObjectives.length > 0 ? selectedToolObjectives : undefined,
      selectedMentalFocusAreas: selectedMentalFocusAreas.length > 0 ? selectedMentalFocusAreas : undefined,
      selectedLanguages: selectedLanguages.length > 0 ? selectedLanguages : undefined,
      selectedPriceRange: minPrice > priceRange.min || maxPrice < priceRange.max ? `${minPrice}-${maxPrice}` : undefined,
    }),
    [
      search,
      selectedAnnouncementType,
      selectedStrategyVariants,
      selectedStrategyFormats,
      selectedAbiRanges,
      selectedReviewTypes,
      selectedReviewFormats,
      selectedReviewSupports,
      selectedToolNames,
      selectedToolObjectives,
      selectedMentalFocusAreas,
      selectedLanguages,
      minPrice,
      maxPrice,
      priceRange.min,
      priceRange.max,
    ]
  );

  // Filtrage des coachs
  const filteredCoaches = useMemo(() => {
    try {
      return filterCoaches(coaches, activeFilters);
    } catch (error) {
      console.error('Erreur lors du filtrage des coachs:', error);
      return [];
    }
  }, [coaches, activeFilters]);

  // Handlers pour les filtres multi-sélection
  const toggleFilter = (value: string, selected: string[], setter: (values: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter((v) => v !== value));
    } else {
      setter([...selected, value]);
    }
  };

  // Reset tous les filtres
  const handleResetFilters = () => {
    setSearch('');
    setSelectedAnnouncementType('');
    setSelectedStrategyVariants([]);
    setSelectedStrategyFormats([]);
    setSelectedAbiRanges([]);
    setSelectedReviewTypes([]);
    setSelectedReviewFormats([]);
    setSelectedReviewSupports([]);
    setSelectedToolNames([]);
    setSelectedToolObjectives([]);
    setSelectedMentalFocusAreas([]);
    setSelectedLanguages([]);
    setMinPrice(priceRange.min);
    setMaxPrice(priceRange.max);
    setShowInactiveCoaches(true); // Reset vers affichage de tous les coachs
  };

  // Comptage des résultats filtrés
  const resultsCount = filteredCoaches.length;
  const formattedResultsCount = resultsCount.toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  if (isLoading) {
    return (
      <section className="min-h-screen bg-slate-950">
        <div className="container mx-auto px-6 py-24">
          <GlassCard className="flex items-center justify-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <span>{t('states.loading')}</span>
          </GlassCard>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="min-h-screen bg-slate-950">
        <div className="container mx-auto px-6 py-24">
          <GlassCard className="border border-red-500/30 bg-red-500/10">
            <p className="text-red-200">{error}</p>
          </GlassCard>
        </div>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f172a,_#020617_70%)] text-white">
      {/* Header compact avec filtres intégrés */}
      <section className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-6">
          {/* Première ligne : Titre + Stats + CTA */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                {t('hero.title')}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {formattedResultsCount} {resultsCount > 1 ? 'résultats' : 'résultat'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openCoachModal'));
                }}
                variant="outline"
                className="border-emerald-400/50 text-emerald-300 hover:bg-emerald-500/10"
              >
                {t('hero.ctaSecondary')}
              </Button>
            </div>
          </div>

          {/* Deuxième ligne : Recherche + Type d'annonce */}
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {/* Barre de recherche */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('filters.searchPlaceholder')}
                  className="h-9 border-white/10 bg-slate-900/60 pl-10 text-sm text-slate-100"
                />
              </div>
            </div>

            {/* Type d'annonce - Pills horizontales */}
            {dynamicFilters.announcementTypes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {dynamicFilters.announcementTypes.map((type) => {
                  const isActive = selectedAnnouncementType === type.value;
                  return (
                    <Button
                      key={type.value}
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedAnnouncementType(isActive ? '' : type.value)}
                      className={`h-9 border ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30'
                          : 'border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700'
                      }`}
                    >
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Troisième ligne : Filtres permanents (Langue, Prix, Toggle, Actions) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Bouton Langue avec Popover */}
            <Popover open={languagePopoverOpen} onOpenChange={setLanguagePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={`h-9 border ${
                    selectedLanguages.length > 0
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-slate-600 bg-slate-800 text-slate-200'
                  }`}
                >
                  <Languages className="mr-2 h-3.5 w-3.5" />
                  Langue {selectedLanguages.length > 0 && `(${selectedLanguages.length})`}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 border-white/10 bg-slate-900 p-2" align="start">
                <div className="space-y-1">
                  {dynamicFilters.languages.map((language) => {
                    const isSelected = selectedLanguages.includes(language.value);
                    return (
                      <button
                        key={language.value}
                        onClick={() => toggleFilter(language.value, selectedLanguages, setSelectedLanguages)}
                        className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>{language.label}</span>
                        {isSelected && <Check className="h-4 w-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>

            {/* Bouton Prix avec Popover */}
            <Popover open={pricePopoverOpen} onOpenChange={setPricePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className={`h-9 border ${
                    minPrice > priceRange.min || maxPrice < priceRange.max
                      ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                      : 'border-slate-600 bg-slate-800 text-slate-200'
                  }`}
                >
                  <DollarSign className="mr-2 h-3.5 w-3.5" />
                  Prix {(minPrice > priceRange.min || maxPrice < priceRange.max) && `(${minPrice}-${maxPrice}€)`}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 border-white/10 bg-slate-900 p-4" align="start">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                      Plage de prix
                    </p>
                    <p className="text-sm font-medium text-emerald-300">
                      {minPrice}€ - {maxPrice}€
                    </p>
                  </div>

                  <div className="relative px-2 py-6">
                    {/* Track background */}
                    <div className="absolute left-2 right-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-700" />

                    {/* Active track between thumbs */}
                    <div
                      className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                      style={{
                        left: `${((minPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                        right: `${100 - ((maxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                      }}
                    />

                    {/* Min range input */}
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={minPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value <= maxPrice) {
                          setMinPrice(value);
                        }
                      }}
                      className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-400 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-400 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                    />

                    {/* Max range input */}
                    <input
                      type="range"
                      min={priceRange.min}
                      max={priceRange.max}
                      value={maxPrice}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (value >= minPrice) {
                          setMaxPrice(value);
                        }
                      }}
                      className="pointer-events-none absolute left-0 top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-emerald-400 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-emerald-400 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110"
                    />
                  </div>

                  {/* Min/Max labels */}
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{priceRange.min}€</span>
                    <span>{priceRange.max}€</span>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Toggle affichage coachs inactifs */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowInactiveCoaches(!showInactiveCoaches)}
              className={`h-9 border ${
                showInactiveCoaches
                  ? 'border-blue-400 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30'
                  : 'border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700'
              }`}
            >
              {showInactiveCoaches ? 'Tous' : 'Actifs'}
            </Button>

            {/* Séparateur */}
            <div className="h-6 w-px bg-white/10" />

            {/* Bouton Filtres avancés (conditionnel selon le type) */}
            {selectedAnnouncementType && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-9 border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-500/20"
              >
                <SlidersHorizontal className="mr-2 h-3 w-3" />
                Filtres avancés
              </Button>
            )}

            {/* Bouton Reset */}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleResetFilters}
              className="h-9 border-slate-600 bg-slate-800 text-slate-200 hover:border-slate-500 hover:bg-slate-700"
            >
              <RotateCcw className="mr-2 h-3 w-3" />
              Réinitialiser
            </Button>
          </div>
        </div>
      </section>

      {/* Filtres avancés collapsibles */}
      {selectedAnnouncementType && showAdvancedFilters && (
        <section className="container mx-auto px-6 py-4">
          <GlassCard className="border-white/10 bg-white/5 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
              Filtres spécifiques • {selectedAnnouncementType}
            </p>

          {/* FILTRES NIVEAU 2 : Filtres STRATEGY (visible uniquement si STRATEGY sélectionné) */}
          {selectedAnnouncementType === 'STRATEGY' && (
            <>
              {dynamicFilters.strategyVariants.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Variante
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicFilters.strategyVariants.map((variant) => {
                      const isActive = selectedStrategyVariants.includes(variant.value);
                      return (
                        <Button
                          key={variant.value}
                          type="button"
                          variant="outline"
                          onClick={() => toggleFilter(variant.value, selectedStrategyVariants, setSelectedStrategyVariants)}
                          className={`border ${
                            isActive
                              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                          }`}
                        >
                          {variant.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {dynamicFilters.strategyFormats.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Format
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicFilters.strategyFormats.map((format) => {
                      const isActive = selectedStrategyFormats.includes(format.value);
                      return (
                        <Button
                          key={format.value}
                          type="button"
                          variant="outline"
                          onClick={() => toggleFilter(format.value, selectedStrategyFormats, setSelectedStrategyFormats)}
                          className={`border ${
                            isActive
                              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                          }`}
                        >
                          {format.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {dynamicFilters.abiRanges.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    ABI / Buy-in moyen
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicFilters.abiRanges.map((abi) => {
                      const isActive = selectedAbiRanges.includes(abi.value);
                      return (
                        <Button
                          key={abi.value}
                          type="button"
                          variant="outline"
                          onClick={() => toggleFilter(abi.value, selectedAbiRanges, setSelectedAbiRanges)}
                          className={`border ${
                            isActive
                              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                          }`}
                        >
                          {abi.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* FILTRES NIVEAU 2 : Filtres REVIEW */}
          {selectedAnnouncementType === 'REVIEW' && (
            <>
              {dynamicFilters.reviewTypes.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Type de review
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicFilters.reviewTypes.map((type) => {
                      const isActive = selectedReviewTypes.includes(type.value);
                      return (
                        <Button
                          key={type.value}
                          type="button"
                          variant="outline"
                          onClick={() => toggleFilter(type.value, selectedReviewTypes, setSelectedReviewTypes)}
                          className={`border ${
                            isActive
                              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                          }`}
                        >
                          {type.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {dynamicFilters.reviewFormats.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Format
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicFilters.reviewFormats.map((format) => {
                      const isActive = selectedReviewFormats.includes(format.value);
                      return (
                        <Button
                          key={format.value}
                          type="button"
                          variant="outline"
                          onClick={() => toggleFilter(format.value, selectedReviewFormats, setSelectedReviewFormats)}
                          className={`border ${
                            isActive
                              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                          }`}
                        >
                          {format.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {dynamicFilters.reviewSupports.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Support
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicFilters.reviewSupports.map((support) => {
                      const isActive = selectedReviewSupports.includes(support.value);
                      return (
                        <Button
                          key={support.value}
                          type="button"
                          variant="outline"
                          onClick={() => toggleFilter(support.value, selectedReviewSupports, setSelectedReviewSupports)}
                          className={`border ${
                            isActive
                              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                          }`}
                        >
                          {support.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* FILTRES NIVEAU 2 : Filtres TOOL */}
          {selectedAnnouncementType === 'TOOL' && (
            <>
              {dynamicFilters.toolNames.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Nom de l&apos;outil
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicFilters.toolNames.map((tool) => {
                      const isActive = selectedToolNames.includes(tool.value);
                      return (
                        <Button
                          key={tool.value}
                          type="button"
                          variant="outline"
                          onClick={() => toggleFilter(tool.value, selectedToolNames, setSelectedToolNames)}
                          className={`border ${
                            isActive
                              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                          }`}
                        >
                          {tool.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              {dynamicFilters.toolObjectives.length > 0 && (
                <div className="mt-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    Objectif
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {dynamicFilters.toolObjectives.map((objective) => {
                      const isActive = selectedToolObjectives.includes(objective.value);
                      return (
                        <Button
                          key={objective.value}
                          type="button"
                          variant="outline"
                          onClick={() => toggleFilter(objective.value, selectedToolObjectives, setSelectedToolObjectives)}
                          className={`border ${
                            isActive
                              ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                              : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                          }`}
                        >
                          {objective.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* FILTRES NIVEAU 2 : Filtres MENTAL */}
          {selectedAnnouncementType === 'MENTAL' && dynamicFilters.mentalFocusAreas.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Domaine de focus
              </p>
              <div className="flex flex-wrap gap-3">
                {dynamicFilters.mentalFocusAreas.map((focus) => {
                  const isActive = selectedMentalFocusAreas.includes(focus.value);
                  return (
                    <Button
                      key={focus.value}
                      type="button"
                      variant="outline"
                      onClick={() => toggleFilter(focus.value, selectedMentalFocusAreas, setSelectedMentalFocusAreas)}
                      className={`border ${
                        isActive
                          ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                      }`}
                    >
                      {focus.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Fermeture de la GlassCard des filtres avancés */}
          </GlassCard>
        </section>
      )}

        {/* Grille des Coachs */}
        <div id="coaches-grid" className="container mx-auto px-6 mt-8 space-y-6">
          {filteredCoaches.length === 0 ? (
            <GlassCard className="border-white/10 bg-white/5 text-center text-slate-200">
              <h2 className="text-xl font-semibold">{t('states.empty.title')}</h2>
              <p className="mt-2 text-sm text-slate-400">{t('states.empty.description')}</p>
            </GlassCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCoaches.map((coach) => {
                const initials = `${coach.firstName?.[0] ?? ''}${coach.lastName?.[0] ?? ''}`.toUpperCase();
                // Calculer les prix min/max des annonces
                const prices = coach.announcements.map((a) => a.priceCents / 100);
                const minPrice = Math.min(...prices);

                return (
                  <GlassCard
                    key={coach.id}
                    className="group h-full overflow-hidden border-white/10 bg-slate-900/60 p-0 hover:border-emerald-400/40"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                      {coach.avatarUrl ? (
                        <Image
                          src={coach.avatarUrl}
                          alt={`${coach.firstName} ${coach.lastName}`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-3xl font-bold text-emerald-200">
                            {initials}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {coach.firstName} {coach.lastName}
                          </h3>
                        </div>

                        <div className="text-right">
                          <span className="text-lg font-semibold text-emerald-300">
                            {minPrice.toLocaleString(locale, {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            })}
                            €
                          </span>
                          <p className="text-xs text-slate-400">
                            {t('card.priceFrom')}
                          </p>
                        </div>
                      </div>

                      {coach.bio ? (
                        <p className="line-clamp-3 text-sm leading-relaxed text-slate-300">
                          {coach.bio}
                        </p>
                      ) : null}

                      <div className="space-y-3 text-sm text-slate-300">
                        {coach.languages.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Languages className="mt-0.5 h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-xs uppercase tracking-widest text-slate-400">
                                {t('card.languages')}
                              </p>
                              <p>{coach.languages.map((lang) => getLanguageLabel(lang)).join(', ')}</p>
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                            Annonces ({coach.announcements.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {coach.announcements.slice(0, 3).map((announcement) => (
                              <Badge
                                key={announcement.id}
                                className="border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                              >
                                {announcement.type}
                              </Badge>
                            ))}
                            {coach.announcements.length > 3 ? (
                              <Badge variant="secondary">+{coach.announcements.length - 3}</Badge>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Link href={`/${locale}/coach/${coach.slug}`} className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full border-white/15 bg-white/5 text-slate-100 hover:border-emerald-400/50 hover:bg-emerald-500/10"
                          >
                            {t('card.viewProfile')}
                          </Button>
                        </Link>
                        <Link href={`/${locale}/coach/${coach.slug}`} className="flex-1">
                          <GradientButton fullWidth size="sm" variant="emerald">
                            {t('card.book')}
                          </GradientButton>
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
    </main>
  );
}
