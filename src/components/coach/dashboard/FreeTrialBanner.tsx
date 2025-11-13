'use client';

import { useMemo } from 'react';
import { Clock, Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

interface FreeTrialBannerProps {
  freeTrialEndDate: Date | string | null;
  subscriptionPlan: string | null;
  subscriptionStatus: string | null;
}

export function FreeTrialBanner({
  freeTrialEndDate,
  subscriptionPlan,
  subscriptionStatus
}: FreeTrialBannerProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'fr';

  const { daysRemaining, isExpiringSoon, isExpired } = useMemo(() => {
    if (!freeTrialEndDate || subscriptionPlan !== 'FREE_TRIAL') {
      return { daysRemaining: 0, isExpiringSoon: false, isExpired: false };
    }

    const endDate = typeof freeTrialEndDate === 'string'
      ? new Date(freeTrialEndDate)
      : freeTrialEndDate;

    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return {
      daysRemaining: Math.max(0, days),
      isExpiringSoon: days > 0 && days <= 7,
      isExpired: days <= 0
    };
  }, [freeTrialEndDate, subscriptionPlan]);

  // Ne rien afficher si ce n'est pas un essai gratuit
  if (subscriptionPlan !== 'FREE_TRIAL') {
    return null;
  }

  // Essai expiré
  if (isExpired || subscriptionStatus === 'CANCELED') {
    return (
      <GlassCard className="p-6 border-red-500/30 bg-red-500/10 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-red-500/20 border border-red-500/30">
              <Clock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-300 mb-1">
                Ton essai gratuit est terminé
              </h3>
              <p className="text-sm text-gray-400">
                Pour continuer à coacher et recevoir des réservations, active un abonnement payant.
              </p>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = `/${locale}/coach/settings`}
            className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold flex-shrink-0"
          >
            <Zap className="mr-2 h-4 w-4" />
            Activer un abonnement
          </Button>
        </div>
      </GlassCard>
    );
  }

  // Essai actif - expire bientôt (moins de 7 jours)
  if (isExpiringSoon) {
    return (
      <GlassCard className="p-6 border-amber-500/30 bg-amber-500/10 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-300 mb-1">
                Ton essai gratuit se termine dans {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-gray-400">
                Active un abonnement pour continuer sans interruption.
              </p>
            </div>
          </div>
          <Button
            onClick={() => window.location.href = `/${locale}/coach/settings`}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold flex-shrink-0"
          >
            <Zap className="mr-2 h-4 w-4" />
            Passer à un abonnement
          </Button>
        </div>
      </GlassCard>
    );
  }

  // Essai actif - encore du temps
  return (
    <GlassCard className="p-6 border-emerald-500/30 bg-emerald-500/10 mb-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
          <Clock className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-emerald-300 mb-1">
            Essai gratuit actif - {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
          </h3>
          <p className="text-sm text-gray-400">
            Profite de toutes les fonctionnalités coach sans limite. Tu pourras passer à un abonnement payant à tout moment.
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
