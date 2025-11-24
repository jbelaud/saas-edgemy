'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/ui';
import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  extractDynamicFilters,
  type CoachWithAnnouncements,
  type ActiveFilters,
} from '@/lib/announcementFilters';

interface CoachFiltersProps {
  coaches: CoachWithAnnouncements[];
  onFilterChange: (filters: ActiveFilters) => void;
}

export function CoachFilters({ coaches, onFilterChange }: CoachFiltersProps) {
  const t = useTranslations('discoverCoaches.filters');

  // État de recherche
  const [search, setSearch] = useState('');

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

  // Calculer min/max des prix disponibles
  const priceRange = useMemo(() => {
    const allAnnouncements = coaches.flatMap((c) => c.announcements || []);
    if (allAnnouncements.length === 0) return { min: 0, max: 1000 };

    const prices = allAnnouncements.map((a) => a.priceCents / 100);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [coaches]);

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

  // Notifier le parent à chaque changement de filtres
  useMemo(() => {
    onFilterChange(activeFilters);
  }, [activeFilters, onFilterChange]);

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
  };

  return (
    <GlassCard className="mb-10 border-white/10 bg-white/5">
      {/* Header des filtres */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-300">
            <SlidersHorizontal className="h-4 w-4" />
            {t('title')}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('searchPlaceholder')}
              className="border-white/10 bg-slate-900/60 pl-11 text-sm text-slate-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleResetFilters}
            className="border-white/80 bg-white text-slate-900 hover:bg-white/90 hover:text-slate-900"
          >
            <RotateCcw className="mr-2 h-4 w-4 text-slate-900" />
            {t('reset')}
          </Button>
        </div>
      </div>

      {/* FILTRE NIVEAU 1 : Type d'annonce (toujours visible) */}
      {dynamicFilters.announcementTypes.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Type d&apos;annonce
          </p>
          <div className="flex flex-wrap gap-3">
            {dynamicFilters.announcementTypes.map((type) => {
              const isActive = selectedAnnouncementType === type.value;
              return (
                <Button
                  key={type.value}
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedAnnouncementType(isActive ? '' : type.value)}
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

      {/* FILTRES NIVEAU 2 : Filtres STRATEGY */}
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

      {/* FILTRES NIVEAU 3 : Filtres COMMUNS (toujours visibles) */}
      {dynamicFilters.languages.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Langues
          </p>
          <div className="flex flex-wrap gap-3">
            {dynamicFilters.languages.map((language) => {
              const isActive = selectedLanguages.includes(language.value);
              return (
                <Button
                  key={language.value}
                  type="button"
                  variant="outline"
                  onClick={() => toggleFilter(language.value, selectedLanguages, setSelectedLanguages)}
                  className={`border ${
                    isActive
                      ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                  }`}
                >
                  {language.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Slider de prix */}
      {priceRange.max > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
            Plage de prix
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label htmlFor="minPrice" className="text-xs text-slate-400">
                  Minimum
                </label>
                <Input
                  id="minPrice"
                  type="number"
                  min={priceRange.min}
                  max={maxPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                  className="mt-1 border-white/10 bg-slate-900/60 text-slate-100"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="maxPrice" className="text-xs text-slate-400">
                  Maximum
                </label>
                <Input
                  id="maxPrice"
                  type="number"
                  min={minPrice}
                  max={priceRange.max}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="mt-1 border-white/10 bg-slate-900/60 text-slate-100"
                />
              </div>
            </div>
            <div className="text-center text-sm text-slate-300">
              {minPrice}€ - {maxPrice}€
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
