'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarClock, ExternalLink, MessageSquareText } from 'lucide-react';

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
  lastSessionDate?: string | null;
  discordChannelId?: string | null;
  typeBreakdown?: Record<string, number>;
  recentHighlights?: string[];
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

const TYPE_CLASSES: Record<string, string> = {
  STRATEGY: 'bg-emerald-500/15 text-emerald-200 border border-emerald-500/30',
  REVIEW: 'bg-purple-500/15 text-purple-200 border border-purple-500/30',
  TOOL: 'bg-orange-500/15 text-orange-200 border border-orange-500/30',
  MENTAL: 'bg-blue-500/15 text-blue-200 border border-blue-500/30',
};

export function PlayerCoachesList({ coaches }: PlayerCoachesListProps) {
  const locale = useLocale();
  const t = useTranslations('player.coaches.card');
  const guildId = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID;

  const formatDate = (date: Date) => {
    try {
      return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date);
    } catch (error) {
      console.error('Erreur formatage date coach:', error);
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {coaches.map((coach) => {
        const initials = `${coach.firstName?.[0] ?? ''}${coach.lastName?.[0] ?? ''}`.toUpperCase();
        const lastSession = coach.lastSessionDate ? new Date(coach.lastSessionDate) : null;
        const statusLabelMap: Record<string, string> = {
          ACTIVE: t('status.ACTIVE'),
          PENDING_REVIEW: t('status.PENDING_REVIEW'),
          INACTIVE: t('status.INACTIVE'),
          SUSPENDED: t('status.SUSPENDED'),
        };
        const statusLabel = statusLabelMap[coach.status] ?? coach.status;
        const statusColorMap: Record<string, string> = {
          ACTIVE: 'text-emerald-300',
          PENDING_REVIEW: 'text-amber-300',
          INACTIVE: 'text-slate-300',
          SUSPENDED: 'text-red-300',
        };
        const statusColor = statusColorMap[coach.status] ?? 'text-slate-300';
        const discordLink = coach.discordChannelId && guildId
          ? `https://discord.com/channels/${guildId}/${coach.discordChannelId}`
          : undefined;

        return (
          <GlassCard
            key={coach.id}
            className="flex h-full flex-col gap-6 border-white/10 bg-slate-900/70 p-6 transition-colors hover:border-emerald-500/40"
          >
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border border-white/10">
                <AvatarImage src={coach.avatarUrl || ''} alt={`${coach.firstName} ${coach.lastName}`} />
                <AvatarFallback className="bg-emerald-600 text-lg text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-white">
                      {coach.firstName} {coach.lastName}
                    </h3>
                    <span className={`text-xs uppercase tracking-widest ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300/90">
                    {t('sessionsCount', { count: coach.sessionsCount })}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-slate-300/80">
                    <CalendarClock className="h-4 w-4 text-emerald-300" />
                    {lastSession ? t('lastSession', { date: formatDate(lastSession) }) : t('noSession')}
                  </div>
                </div>
              </div>
            </div>

            {coach.bio && (
              <div className="rounded-lg border border-white/5 bg-white/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('bio')}</p>
                <p className="mt-2 line-clamp-3 text-sm text-slate-200/90">{coach.bio}</p>
              </div>
            )}

            {(coach.types.length > 0 || coach.formats.length > 0 || coach.languages.length > 0) && (
              <div className="flex flex-wrap gap-4">
                {coach.types.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('types')}</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.types.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className={`px-2 py-1 text-xs font-medium ${TYPE_CLASSES[type] ?? 'bg-slate-500/10 text-slate-100 border border-slate-500/30'}`}
                        >
                          {TYPE_LABELS[type] || type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {coach.formats.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('formats')}</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.formats.map((format) => (
                        <Badge key={format} variant="outline" className="border-white/15 bg-white/5 px-2 py-1 text-xs text-white/80">
                          {format}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {coach.languages.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t('languages')}</p>
                    <div className="flex flex-wrap gap-2">
                      {coach.languages.map((language) => (
                        <Badge key={language} variant="outline" className="border-white/15 bg-white/5 px-2 py-1 text-xs text-white/80">
                          {language.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {discordLink ? (
                <Link href={discordLink} target="_blank" rel="noreferrer" className="flex-1">
                  <Button
                    size="sm"
                    className="h-full w-full bg-[#5865F2] text-sm font-medium text-white hover:bg-[#4752C4]"
                  >
                    <MessageSquareText className="mr-2 h-4 w-4" />
                    {t('channel.openDiscord')}
                  </Button>
                </Link>
              ) : (
                <div className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-full w-full border-white/10 text-slate-300"
                    disabled
                  >
                    <MessageSquareText className="mr-2 h-4 w-4" />
                    {t('channel.unavailable')}
                  </Button>
                </div>
              )}

              <Link href={`/${locale}/coach/${coach.slug}`} className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-full w-full border-emerald-400/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {t('profile')}
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-400/80">
              {t('channel.tooltip')}
            </p>
          </GlassCard>
        );
      })}
    </div>
  );
}
