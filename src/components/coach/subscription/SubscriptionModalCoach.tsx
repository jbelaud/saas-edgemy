'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, Zap, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GradientButton, GlassCard } from '@/components/ui';

interface SubscriptionModalCoachProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MONTHLY_PRICE = 39;
const YEARLY_PRICE = 399;
const YEARLY_MONTHLY_EQUIVALENT = (YEARLY_PRICE / 12).toFixed(2);
const YEARLY_SAVINGS = ((MONTHLY_PRICE * 12 - YEARLY_PRICE) / (MONTHLY_PRICE * 12) * 100).toFixed(0);

const FEATURES = [
  'Profil public visible',
  'Réservations illimitées',
  'Gestion des disponibilités',
  'Paiements sécurisés via Stripe',
  'Système de messagerie avec les élèves',
  'Statistiques et revenus détaillés',
  'Support prioritaire',
];

export function SubscriptionModalCoach({ open, onOpenChange }: SubscriptionModalCoachProps) {
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState<'MONTHLY' | 'YEARLY' | null>(null);

  const handleSubscribe = async (plan: 'MONTHLY' | 'YEARLY') => {
    setIsLoading(plan);
    try {
      const response = await fetch('/api/stripe/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, locale }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la création de la session');
      }

      const { url } = await response.json();

      // Rediriger vers Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-9xl max-h-[90vh] overflow-y-auto bg-slate-900/98 backdrop-blur-xl border-amber-500/20">
        <DialogHeader>
          <DialogTitle className="text-3xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Activez votre abonnement coach
          </DialogTitle>
          <DialogDescription className="text-base">
            Choisissez la formule qui vous convient et commencez à coacher dès aujourd&apos;hui
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Plan mensuel */}
            <GlassCard className="border-gray-500/20">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Mensuel</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{MONTHLY_PRICE}€</span>
                  <span className="text-gray-400">/mois</span>
                </div>
                <p className="text-sm text-gray-400 mt-2">Sans engagement</p>
              </div>

              <ul className="space-y-3 mb-6">
                {FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <GradientButton
                variant="amber"
                size="lg"
                className="w-full"
                onClick={() => handleSubscribe('MONTHLY')}
                disabled={isLoading !== null}
              >
                {isLoading === 'MONTHLY' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    S&apos;abonner - {MONTHLY_PRICE}€/mois
                  </>
                )}
              </GradientButton>
            </GlassCard>

            {/* Plan annuel */}
            <GlassCard className="border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 relative">
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                ÉCONOMISEZ {YEARLY_SAVINGS}%
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Annuel</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    {YEARLY_PRICE}€
                  </span>
                  <span className="text-gray-400">/an</span>
                </div>
                <p className="text-sm text-amber-400 mt-2">
                  Soit {YEARLY_MONTHLY_EQUIVALENT}€/mois • Sans engagement
                </p>
              </div>

              <ul className="space-y-3 mb-6">
                {FEATURES.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <GradientButton
                variant="amber"
                size="lg"
                className="w-full"
                onClick={() => handleSubscribe('YEARLY')}
                disabled={isLoading !== null}
              >
                {isLoading === 'YEARLY' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Redirection...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    S&apos;abonner - {YEARLY_PRICE}€/an
                  </>
                )}
              </GradientButton>
            </GlassCard>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>
              Paiement sécurisé via Stripe • Annulation possible à tout moment
            </p>
            <p>
              L&apos;abonnement se renouvelle automatiquement mais vous pouvez annuler quand vous le souhaitez
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
