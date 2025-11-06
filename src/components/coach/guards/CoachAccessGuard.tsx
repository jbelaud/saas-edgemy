'use client';

import { useState } from 'react';
import { AlertTriangle, Zap, CreditCard, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GradientButton, GlassCard } from '@/components/ui';
import { SubscriptionModalCoach } from '@/components/coach/subscription/SubscriptionModalCoach';

export type AccessBlockReason =
  | 'no_subscription'
  | 'stripe_not_connected'
  | 'discord_not_connected';

interface CoachAccessGuardProps {
  reason: AccessBlockReason | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnectStripe?: () => void;
  onConnectDiscord?: () => void;
}

export function CoachAccessGuard({
  reason,
  open,
  onOpenChange,
  onConnectStripe,
  onConnectDiscord,
}: CoachAccessGuardProps) {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const getContent = () => {
    switch (reason) {
      case 'no_subscription':
        return {
          icon: <Zap className="h-12 w-12 text-amber-400" />,
          title: 'Abonnement requis',
          description: 'Tu dois activer ton abonnement avant d\'accéder à cette section',
          actionLabel: 'Activer mon abonnement',
          action: () => {
            onOpenChange(false);
            setIsSubscriptionModalOpen(true);
          },
        };
      case 'stripe_not_connected':
        return {
          icon: <CreditCard className="h-12 w-12 text-blue-400" />,
          title: 'Paiements non activés',
          description:
            'Tu dois activer tes paiements avant de pouvoir créer une annonce',
          actionLabel: 'Activer mes paiements',
          action: onConnectStripe,
        };
      case 'discord_not_connected':
        return {
          icon: <MessageSquare className="h-12 w-12 text-purple-400" />,
          title: 'Discord requis',
          description:
            'Connecte ton compte Discord pour pouvoir échanger avec tes élèves',
          actionLabel: 'Connecter mon Discord',
          action: onConnectDiscord,
        };
      default:
        return null;
    }
  };

  const content = getContent();

  if (!content) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md bg-slate-900/98 backdrop-blur-xl border-amber-500/20">
          <DialogHeader>
            <div className="flex justify-center mb-4">{content.icon}</div>
            <DialogTitle className="text-2xl text-center bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              {content.title}
            </DialogTitle>
            <DialogDescription className="text-base text-center">
              {content.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <GlassCard className="border-amber-500/20 bg-amber-500/5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  {reason === 'no_subscription' &&
                    'Cette étape est indispensable pour devenir coach actif sur Edgemy.'}
                  {reason === 'stripe_not_connected' &&
                    'Nous avons besoin de tes informations bancaires pour te verser tes gains.'}
                  {reason === 'discord_not_connected' &&
                    'Discord est nécessaire pour communiquer avec tes élèves pendant les sessions.'}
                </p>
              </div>
            </GlassCard>

            <GradientButton
              variant="amber"
              size="lg"
              className="w-full"
              onClick={content.action}
            >
              {content.actionLabel}
            </GradientButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'abonnement */}
      <SubscriptionModalCoach
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      />
    </>
  );
}
