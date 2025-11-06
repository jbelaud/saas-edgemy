'use client';

import { useState, useCallback } from 'react';
import type { AccessBlockReason } from '@/components/coach/guards/CoachAccessGuard';

interface CoachData {
  subscriptionStatus: string | null;
  isOnboarded: boolean;
  isDiscordConnected: boolean;
  stripeAccountId: string | null;
}

export function useCoachAccess(coach: CoachData | null) {
  const [blockReason, setBlockReason] = useState<AccessBlockReason | null>(null);
  const [isGuardOpen, setIsGuardOpen] = useState(false);

  const hasActiveSubscription = coach?.subscriptionStatus === 'ACTIVE';
  const isStripeConnected = Boolean(coach?.stripeAccountId) && coach?.isOnboarded;
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

      if (requiredFeatures.stripe && !isStripeConnected) {
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
    [hasActiveSubscription, isStripeConnected, isDiscordConnected]
  );

  const closeGuard = useCallback(() => {
    setIsGuardOpen(false);
    setBlockReason(null);
  }, []);

  return {
    hasActiveSubscription,
    isStripeConnected,
    isDiscordConnected,
    checkAccess,
    blockReason,
    isGuardOpen,
    closeGuard,
  };
}
