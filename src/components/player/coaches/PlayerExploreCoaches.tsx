'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Languages, TrendingUp, Award, Clock } from 'lucide-react';

interface Coach {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  formats: string[];
  languages: string[];
  experience?: number;
  roi?: number;
  stakes?: string;
  badges: string[];
  announcements: unknown[];
  priceRange?: {
    min: number;
    max: number;
  };
  announcementTypes: string[];
}

interface PlayerExploreCoachesProps {
  coaches: Coach[];
  searchQuery: string;
}

const TYPE_LABELS: Record<string, string> = {
  STRATEGY: 'Stratégie',
  REVIEW: 'Review',
  TOOL: 'Outils',
  MENTAL: 'Mental',
};

const TYPE_COLORS: Record<string, string> = {
  STRATEGY: 'bg-blue-100 text-blue-800',
  REVIEW: 'bg-purple-100 text-purple-800',
  TOOL: 'bg-orange-100 text-orange-800',
  MENTAL: 'bg-green-100 text-green-800',
};

export function PlayerExploreCoaches({ coaches, searchQuery }: PlayerExploreCoachesProps) {
  const locale = useLocale();

  // Filtrer les coachs selon la recherche
  const filteredCoaches = useMemo(() => {
    if (!searchQuery) return coaches;

    const query = searchQuery.toLowerCase();
    return coaches.filter((coach) => {
      const fullName = `${coach.firstName} ${coach.lastName}`.toLowerCase();
      const bio = coach.bio?.toLowerCase() || '';
      const formats = coach.formats.join(' ').toLowerCase();
      
      return fullName.includes(query) || bio.includes(query) || formats.includes(query);
    });
  }, [coaches, searchQuery]);

  if (filteredCoaches.length === 0) {
    return (
      <GlassCard className="py-12">
        <div className="text-center text-gray-300">
          <p className="text-lg font-medium mb-2">Aucun coach trouvé</p>
          <p className="text-sm text-gray-400">
            Essayez de modifier vos critères de recherche
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCoaches.map((coach) => {
        const initials = `${coach.firstName[0]}${coach.lastName[0]}`.toUpperCase();
        
        return (
          <GlassCard 
            key={coach.id} 
            className="group hover:border-emerald-500/50 transition-all duration-300 overflow-hidden p-0"
          >
            {/* Photo en grand en haut - Style Superprof */}
            <div className="relative h-48 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 overflow-hidden">
              {coach.avatarUrl ? (
                <Image
                  src={coach.avatarUrl}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                    {initials}
                  </div>
                </div>
              )}
              
              {/* Badge "Nouveau" ou "Top coach" */}
              {coach.badges && coach.badges.length > 0 && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-amber-500/90 text-white border-0 shadow-lg">
                    <Award className="h-3 w-3 mr-1" />
                    Top Coach
                  </Badge>
                </div>
              )}
            </div>

            {/* Contenu de la card */}
            <div className="p-5 space-y-4">
              {/* En-tête avec nom et note */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {coach.firstName} {coach.lastName}
                  </h3>
                  {/* Note (mockée pour l'instant) */}
                  <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-500/30">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-400">5.0</span>
                  </div>
                </div>
                
                {/* Expérience */}
                {coach.experience && (
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span>{coach.experience} ans d&apos;expérience</span>
                  </div>
                )}
              </div>

              {/* Bio courte */}
              {coach.bio && (
                <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                  {coach.bio}
                </p>
              )}

              {/* Types de coaching - Badges colorés */}
              <div className="flex flex-wrap gap-2">
                {coach.announcementTypes.slice(0, 3).map((type) => (
                  <Badge 
                    key={type} 
                    className={`${TYPE_COLORS[type]} border-0`}
                  >
                    {TYPE_LABELS[type] || type}
                  </Badge>
                ))}
                {coach.announcementTypes.length > 3 && (
                  <Badge variant="secondary">
                    +{coach.announcementTypes.length - 3}
                  </Badge>
                )}
              </div>

              {/* Informations clés en ligne */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                {/* Formats */}
                {coach.formats.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">Formats</p>
                      <div className="flex flex-wrap gap-1">
                        {coach.formats.slice(0, 3).map((format) => (
                          <span key={format} className="text-xs text-gray-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                            {format}
                          </span>
                        ))}
                        {coach.formats.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{coach.formats.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Langues */}
                {coach.languages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-300">
                      {coach.languages.map(l => l.toUpperCase()).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Prix et CTA */}
              <div className="pt-3 border-t border-white/10">
                {coach.priceRange && (
                  <div className="flex items-baseline justify-between mb-3">
                    <div>
                      <span className="text-2xl font-bold text-emerald-400">
                        {coach.priceRange.min}€
                      </span>
                      <span className="text-sm text-gray-400 ml-1">/heure</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      À partir de
                    </span>
                  </div>
                )}
                
                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <Link href={`/${locale}/coach/${coach.slug}`} className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full border-white/20 hover:border-emerald-500/50 hover:bg-emerald-500/10"
                    >
                      Voir le profil
                    </Button>
                  </Link>
                  <Link href={`/${locale}/coach/${coach.slug}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                      Réserver
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
