'use client';

import { ReactNode } from 'react';
import { GlassCard } from '@/components/ui';
import { Zap } from 'lucide-react';
import { useCoachAccess } from '@/hooks/useCoachAccess';
import { CoachAccessGuard } from './CoachAccessGuard';

interface SubscriptionRequiredProps {
  coach: {
    subscriptionStatus: string | null;
    isOnboarded: boolean;
    isDiscordConnected: boolean;
    stripeAccountId: string | null;
  } | null;
  icon?: ReactNode;
  title?: string;
  message?: string;
  children: ReactNode;
}

export function SubscriptionRequired({
  coach,
  icon,
  title = 'Abonnement requis',
  message = 'Active ton abonnement coach pour accéder à cette fonctionnalité.',
  children,
}: SubscriptionRequiredProps) {
  const {
    hasActiveSubscription,
    blockReason,
    isGuardOpen,
    closeGuard,
  } = useCoachAccess(coach);

  if (!hasActiveSubscription) {
    return (
      <>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <GlassCard className="p-8 text-center border-amber-500/20">
            {icon || <Zap className="h-16 w-16 mx-auto mb-4 text-amber-400" />}
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-gray-400 mb-6">{message}</p>
          </GlassCard>
        </div>

        {/* Guard pour bloquer l'accès */}
        <CoachAccessGuard
          reason={blockReason}
          open={isGuardOpen}
          onOpenChange={closeGuard}
        />
      </>
    );
  }

  return <>{children}</>;
}
