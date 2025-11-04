'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GlassCard, GradientButton, GradientText, Input } from '@/components/ui';
import { Loader2, Search, SlidersHorizontal, RotateCcw, Languages, Clock, Star, Award } from 'lucide-react';

interface CoachPriceRange {
  min: number;
  max: number;
}

interface Coach {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  bio?: string | null;
  avatarUrl?: string | null;
  formats: string[];
  languages: string[];
  experience?: number | null;
  badges: string[];
  priceRange?: CoachPriceRange | null;
  announcementTypes: string[];
  subscriptionStatus?: string | null;
}

interface CoachsPageContentProps {
  locale: string;
}

export function CoachsPageContent({ locale }: CoachsPageContentProps) {
  const t = useTranslations('discoverCoaches');
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const fetchCoaches = async () => {
      try {
        const response = await fetch('/api/coach/explore', {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error('Failed to load coaches');
        }
        const data = (await response.json()) as { coaches: Coach[] };
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
  }, [t]);

  const uniqueLanguages = useMemo(() => {
    const langs = new Map<string, string>();
    coaches.forEach((coach) => {
      coach.languages.forEach((lang) => {
        const key = lang.toLowerCase();
        if (!langs.has(key)) {
          langs.set(key, key.toUpperCase());
        }
      });
    });
    return Array.from(langs.values()).sort();
  }, [coaches]);

  const uniqueFormats = useMemo(() => {
    const formats = new Set<string>();
    coaches.forEach((coach) => {
      coach.formats.forEach((format) => formats.add(format));
    });
    return Array.from(formats).sort();
  }, [coaches]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    coaches.forEach((coach) => {
      coach.announcementTypes.forEach((type) => types.add(type));
    });
    return Array.from(types).sort();
  }, [coaches]);

  const filteredCoaches = useMemo(() => {
    const query = search.trim().toLowerCase();
    const normalizedLanguage = selectedLanguage.toLowerCase();

    return coaches.filter((coach) => {
      const matchesSearch =
        query.length === 0 ||
        `${coach.firstName} ${coach.lastName}`.toLowerCase().includes(query) ||
        (coach.bio?.toLowerCase() ?? '').includes(query) ||
        coach.formats.some((format) => format.toLowerCase().includes(query));

      const matchesFormats =
        selectedFormats.length === 0 || coach.formats.some((format) => selectedFormats.includes(format));

      const matchesTypes =
        selectedTypes.length === 0 || coach.announcementTypes.some((type) => selectedTypes.includes(type));

      const matchesLanguage =
        selectedLanguage.length === 0 || coach.languages.some((lang) => lang.toLowerCase() === normalizedLanguage);

      return matchesSearch && matchesFormats && matchesTypes && matchesLanguage;
    });
  }, [coaches, search, selectedFormats, selectedTypes, selectedLanguage]);

  const handleToggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
    );
  };

  const handleToggleFormat = (format: string) => {
    setSelectedFormats((prev) =>
      prev.includes(format) ? prev.filter((item) => item !== format) : [...prev, format],
    );
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedTypes([]);
    setSelectedFormats([]);
    setSelectedLanguage('');
  };

  const activeCoachesCount = coaches.length;
  const formattedActiveCoachesCount = activeCoachesCount > 0
    ? activeCoachesCount.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : '—';

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
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/globe.svg"
            alt="Globe pattern"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="container relative mx-auto px-6 py-24">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-8">
              <GradientText as="h1" variant="emerald" className="text-4xl leading-tight md:text-5xl">
                {t('hero.title')}
              </GradientText>
              <p className="max-w-2xl text-lg text-slate-300 md:text-xl">
                {t('hero.subtitle')}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="#coaches-grid">
                  <GradientButton size="md" variant="emerald">
                    {t('hero.ctaPrimary')}
                  </GradientButton>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('openCoachModal'));
                  }}
                >
                  <GradientButton size="md" variant="ghost">
                    {t('hero.ctaSecondary')}
                  </GradientButton>
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              <GlassCard className="border border-emerald-400/20 bg-emerald-500/10">
                <p className="text-3xl font-semibold text-emerald-200 md:text-4xl">
                  {formattedActiveCoachesCount}
                </p>
                <p className="text-sm text-emerald-100/70 md:text-base">{t('hero.stat1.label')}</p>
              </GlassCard>
              <GlassCard>
                <p className="text-lg font-medium text-slate-100 md:text-xl">
                  {t('hero.stat2.value')}
                </p>
                <p className="text-sm text-slate-300/80 md:text-base">{t('hero.stat2.label')}</p>
              </GlassCard>
              <GlassCard className="bg-white/5">
                <p className="text-lg font-medium text-slate-100 md:text-xl">
                  {t('hero.stat3.value')}
                </p>
                <p className="text-sm text-slate-300/80 md:text-base">{t('hero.stat3.label')}</p>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-16">
        <GlassCard className="mb-10 border-white/10 bg-white/5">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-emerald-300">
                <SlidersHorizontal className="h-4 w-4" />
                {t('filters.title')}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('filters.searchPlaceholder')}
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
                {t('filters.reset')}
              </Button>
            </div>
          </div>

          {uniqueFormats.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t('filters.formatsTitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                {uniqueFormats.map((format) => {
                  const isActive = selectedFormats.includes(format);
                  return (
                    <Button
                      key={format}
                      type="button"
                      variant="outline"
                      onClick={() => handleToggleFormat(format)}
                      className={`border ${
                        isActive
                          ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                      }`}
                    >
                      {format}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {uniqueTypes.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t('filters.typesTitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                {uniqueTypes.map((type) => {
                  const isActive = selectedTypes.includes(type);
                  return (
                    <Button
                      key={type}
                      type="button"
                      variant="outline"
                      onClick={() => handleToggleType(type)}
                      className={`border ${
                        isActive
                          ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                      }`}
                    >
                      {t(`badges.${type}`, { defaultMessage: type })}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {uniqueLanguages.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                {t('filters.languagesTitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                {uniqueLanguages.map((language) => {
                  const isActive = selectedLanguage === language;
                  return (
                    <Button
                      key={language}
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedLanguage(isActive ? '' : language)}
                      className={`border ${
                        isActive
                          ? 'border-emerald-400/60 bg-emerald-500/10 text-emerald-200'
                          : 'border-white/10 bg-white/5 text-slate-100 hover:border-white/20'
                      }`}
                    >
                      {language}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </GlassCard>

        <div id="coaches-grid" className="space-y-6">
          {filteredCoaches.length === 0 ? (
            <GlassCard className="border-white/10 bg-white/5 text-center text-slate-200">
              <h2 className="text-xl font-semibold">{t('states.empty.title')}</h2>
              <p className="mt-2 text-sm text-slate-400">{t('states.empty.description')}</p>
            </GlassCard>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredCoaches.map((coach) => {
                const initials = `${coach.firstName?.[0] ?? ''}${coach.lastName?.[0] ?? ''}`.toUpperCase();
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

                      {coach.badges.length > 0 && (
                        <div className="absolute right-4 top-4">
                          <Badge className="bg-amber-500/90 text-amber-50">
                            <Award className="mr-1 h-3 w-3" />
                            {t('card.topCoach')}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {coach.firstName} {coach.lastName}
                          </h3>
                          {coach.experience ? (
                            <div className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                              <Star className="h-4 w-4 text-amber-400" />
                              {t('card.experience', { count: coach.experience })}
                            </div>
                          ) : null}
                        </div>

                        {coach.priceRange ? (
                          <div className="text-right">
                            <span className="text-lg font-semibold text-emerald-300">
                              {coach.priceRange.min.toLocaleString(locale, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              })}
                              €
                            </span>
                            <p className="text-xs text-slate-400">
                              {t('card.priceFrom')}
                              {t('card.perHour')}
                            </p>
                          </div>
                        ) : null}
                      </div>

                      {coach.bio ? (
                        <p className="line-clamp-3 text-sm leading-relaxed text-slate-300">
                          {coach.bio}
                        </p>
                      ) : null}

                      {coach.announcementTypes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {coach.announcementTypes.slice(0, 3).map((type) => (
                            <Badge
                              key={type}
                              className="border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                            >
                              {t(`badges.${type}`, { defaultMessage: type })}
                            </Badge>
                          ))}
                          {coach.announcementTypes.length > 3 ? (
                            <Badge variant="secondary">+{coach.announcementTypes.length - 3}</Badge>
                          ) : null}
                        </div>
                      )}

                      <div className="space-y-3 text-sm text-slate-300">
                        {coach.formats.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-xs uppercase tracking-widest text-slate-400">
                                {t('card.formats')}
                              </p>
                              <p>{coach.formats.join(', ')}</p>
                            </div>
                          </div>
                        )}

                        {coach.languages.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Languages className="mt-0.5 h-4 w-4 text-slate-400" />
                            <div>
                              <p className="text-xs uppercase tracking-widest text-slate-400">
                                {t('card.languages')}
                              </p>
                              <p>{coach.languages.map((lang) => lang.toUpperCase()).join(', ')}</p>
                            </div>
                          </div>
                        )}
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
      </section>
    </main>
  );
}
