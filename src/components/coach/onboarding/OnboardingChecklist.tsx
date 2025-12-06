'use client';

import { CheckCircle2, AlertCircle, XCircle, Zap } from 'lucide-react';
import { GlassCard, GradientButton } from '@/components/ui';
import { useState } from 'react';
import { SubscriptionModalCoach } from '@/components/coach/subscription/SubscriptionModalCoach';

interface OnboardingChecklistProps {
  hasActiveSubscription: boolean;
  isStripeConnected: boolean;
  isDiscordConnected: boolean;
  planKey?: 'PRO' | 'LITE' | null;
  hasAnnouncements?: boolean;
  onConnectStripe: () => void;
  onConnectDiscord: () => void;
  onCreateAnnouncement: () => void;
}

type ChecklistItem = {
  id: string;
  label: string;
  status: 'completed' | 'pending' | 'blocked';
  description: string;
  action?: () => void;
  actionLabel?: string;
};

export function OnboardingChecklist({
  hasActiveSubscription,
  isStripeConnected,
  isDiscordConnected,
  planKey,
  hasAnnouncements = false,
  onConnectStripe,
  onConnectDiscord,
  onCreateAnnouncement,
}: OnboardingChecklistProps) {
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const isLitePlan = planKey === 'LITE';

  const items: ChecklistItem[] = [
    {
      id: 'subscription',
      label: 'Abonnement actif',
      status: hasActiveSubscription ? 'completed' : 'pending',
      description: hasActiveSubscription
        ? 'Votre abonnement est actif'
        : 'Activez votre abonnement pour débloquer toutes les fonctionnalités',
      action: hasActiveSubscription ? undefined : () => setIsSubscriptionModalOpen(true),
      actionLabel: 'Activer mon abonnement',
    },
    // Stripe Connect seulement pour plan PRO
    ...(!isLitePlan ? [{
      id: 'stripe',
      label: 'Activer mes paiements',
      status: (!hasActiveSubscription
        ? 'blocked'
        : isStripeConnected
        ? 'completed'
        : 'pending') as 'completed' | 'pending' | 'blocked',
      description: !hasActiveSubscription
        ? 'Disponible après activation de l\'abonnement'
        : isStripeConnected
        ? 'Vos paiements sont configurés'
        : 'Connectez votre compte Stripe pour recevoir vos paiements',
      action: hasActiveSubscription && !isStripeConnected ? onConnectStripe : undefined,
      actionLabel: 'Activer mes paiements',
    }] : []),
    {
      id: 'discord',
      label: 'Connecter mon Discord',
      status: (!hasActiveSubscription
        ? 'blocked'
        : isDiscordConnected
        ? 'completed'
        : 'pending') as 'completed' | 'pending' | 'blocked',
      description: !hasActiveSubscription
        ? 'Disponible après activation de l\'abonnement'
        : isDiscordConnected
        ? 'Votre Discord est connecté'
        : 'Connectez Discord pour échanger avec vos élèves',
      action: hasActiveSubscription && !isDiscordConnected ? onConnectDiscord : undefined,
      actionLabel: 'Connecter mon Discord',
    },
    // N'afficher l'item "Créer ma première annonce" que si le coach n'a pas encore d'annonces
    ...(!hasAnnouncements ? [{
      id: 'announcement',
      label: 'Créer ma première annonce',
      status: (
        !hasActiveSubscription || (!isLitePlan && !isStripeConnected)
          ? 'blocked'
          : 'pending') as 'completed' | 'pending' | 'blocked',
      description:
        !hasActiveSubscription || (!isLitePlan && !isStripeConnected)
          ? 'Disponible après validation des étapes précédentes'
          : 'Créez votre première annonce pour commencer à coacher',
      action:
        hasActiveSubscription && (isLitePlan || isStripeConnected)
          ? onCreateAnnouncement
          : undefined,
      actionLabel: 'Créer ma première annonce',
    }] : []),
  ];

  // Pour LITE : allCompleted = subscription + discord
  // Pour PRO : allCompleted = subscription + stripe + discord
  const allCompleted = isLitePlan
    ? items.slice(0, 2).every((item) => item.status === 'completed')  // subscription + discord
    : items.slice(0, 3).every((item) => item.status === 'completed'); // subscription + stripe + discord

  const getIcon = (status: 'completed' | 'pending' | 'blocked') => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />;
      case 'blocked':
        return <XCircle className="h-5 w-5 text-gray-500 flex-shrink-0" />;
    }
  };

  return (
    <>
      <GlassCard className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
        <div className="mb-6">
          <h2 className="text-white flex items-center gap-2 text-2xl font-bold mb-2">
            <Zap className="h-6 w-6 text-amber-400" />
            {allCompleted ? '🎉 Bravo, ton compte coach est maintenant activé !' : '🚀 Tu es presque prêt à devenir coach !'}
          </h2>
          <p className="text-gray-300">
            {allCompleted
              ? 'Tu peux maintenant publier ta première annonce et commencer à coacher.'
              : 'Suis ces étapes pour activer complètement ton compte coach'}
          </p>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-4 rounded-lg transition-all ${
                item.status === 'completed'
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : item.status === 'pending'
                  ? 'bg-amber-500/10 border border-amber-500/20'
                  : 'bg-gray-500/5 border border-gray-500/10 opacity-60'
              }`}
            >
              <div className="mt-0.5">{getIcon(item.status)}</div>
              <div className="flex-1">
                <h3
                  className={`font-semibold mb-1 ${
                    item.status === 'completed'
                      ? 'text-emerald-300'
                      : item.status === 'pending'
                      ? 'text-amber-300'
                      : 'text-gray-400'
                  }`}
                >
                  {item.label}
                </h3>
                <p className="text-sm text-gray-400 mb-2">{item.description}</p>
                {item.action && (
                  <GradientButton
                    variant={item.status === 'pending' ? 'amber' : 'ghost'}
                    size="sm"
                    onClick={item.action}
                  >
                    {item.actionLabel}
                  </GradientButton>
                )}
              </div>
            </div>
          ))}
        </div>

        {allCompleted && !hasAnnouncements && (
          <div className="mt-6 pt-6 border-t border-gray-700">
            <GradientButton
              variant="amber"
              size="lg"
              className="w-full"
              onClick={onCreateAnnouncement}
            >
              <Zap className="mr-2 h-5 w-5" />
              Créer ma première annonce
            </GradientButton>
          </div>
        )}
      </GlassCard>

      {/* Modal d'abonnement */}
      <SubscriptionModalCoach
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      />
    </>
  );
}
