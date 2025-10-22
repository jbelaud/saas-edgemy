'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink, Clock } from 'lucide-react';

interface Coach {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  formats: string[];
  languages: string[];
  status: string;
  sessionsCount: number;
  types: string[];
}

interface PlayerCoachesListProps {
  coaches: Coach[];
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

export function PlayerCoachesList({ coaches }: PlayerCoachesListProps) {
  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {coaches.map((coach) => {
        const initials = `${coach.firstName[0]}${coach.lastName[0]}`.toUpperCase();
        
        return (
          <Card key={coach.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={coach.avatarUrl || ''} alt={`${coach.firstName} ${coach.lastName}`} />
                  <AvatarFallback className="bg-emerald-600 text-white text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl mb-1">
                    {coach.firstName} {coach.lastName}
                  </CardTitle>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {coach.sessionsCount} session{coach.sessionsCount > 1 ? 's' : ''} réalisée{coach.sessionsCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bio */}
              {coach.bio && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {coach.bio}
                </p>
              )}

              {/* Types de coaching */}
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Spécialités</p>
                <div className="flex flex-wrap gap-2">
                  {coach.types.map((type) => (
                    <Badge key={type} variant="secondary" className={TYPE_COLORS[type] || ''}>
                      {TYPE_LABELS[type] || type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Formats */}
              {coach.formats.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Formats</p>
                  <div className="flex flex-wrap gap-1">
                    {coach.formats.slice(0, 3).map((format) => (
                      <Badge key={format} variant="outline" className="text-xs">
                        {format}
                      </Badge>
                    ))}
                    {coach.formats.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{coach.formats.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Action */}
              <div className="pt-2">
                <Link href={`/${locale}/coach/${coach.slug}`}>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Voir le profil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
