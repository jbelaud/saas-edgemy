'use client';

import { useState, useCallback } from 'react';
import type { AccessBlockReason } from '@/components/coach/guards/CoachAccessGuard';

interface CoachData {
  subscriptionStatus: string | null;
  isOnboarded: boolean;
  isDiscordConnected: boolean;
  stripeAccountId: string | null;
  planKey?: 'PRO' | 'LITE' | null;
}

export function useCoachAccess(coach: CoachData | null) {
  const [blockReason, setBlockReason] = useState<AccessBlockReason | null>(null);
  const [isGuardOpen, setIsGuardOpen] = useState(false);

  const hasActiveSubscription = coach?.subscriptionStatus === 'ACTIVE';
  const isLitePlan = coach?.planKey === 'LITE';
  // Un coach est considéré comme connecté à Stripe s'il a un compte Stripe (même en cours de configuration)
  // Les comptes mock (mode dev) ne comptent pas
  const isStripeConnected = Boolean(
    coach?.stripeAccountId &&
    !coach.stripeAccountId.startsWith('acct_mock_')
  );
  const isDiscordConnected = coach?.isDiscordConnected ?? false;

  const checkAccess = useCallback(
    (requiredFeatures: {
      subscription?: boolean;
      stripe?: boolean;
      discord?: boolean;
    }) => {
      if (requiredFeatures.subscription && !hasActiveSubscription) {
        setBlockReason('no_subscription');
        setIsGuardOpen(true);
        return false;
      }

      // Pour les plans LITE, Stripe n'est pas requis
      if (requiredFeatures.stripe && !isLitePlan && !isStripeConnected) {
        setBlockReason('stripe_not_connected');
        setIsGuardOpen(true);
        return false;
      }

      if (requiredFeatures.discord && !isDiscordConnected) {
        setBlockReason('discord_not_connected');
        setIsGuardOpen(true);
        return false;
      }

      return true;
    },
    [hasActiveSubscription, isLitePlan, isStripeConnected, isDiscordConnected]
  );

  const closeGuard = useCallback(() => {
    setIsGuardOpen(false);
    setBlockReason(null);
  }, []);

  return {
    hasActiveSubscription,
    isStripeConnected,
    isDiscordConnected,
    isLitePlan,
    checkAccess,
    blockReason,
    isGuardOpen,
    closeGuard,
  };
}
