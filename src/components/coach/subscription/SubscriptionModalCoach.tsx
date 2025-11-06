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
  const [isLoading, setIsLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');

  const currentPrice = billingPeriod === 'MONTHLY' ? MONTHLY_PRICE : YEARLY_PRICE;
  const currentPeriod = billingPeriod === 'MONTHLY' ? 'mois' : 'an';

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: billingPeriod, locale }),
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
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/98 backdrop-blur-xl border-amber-500/20 [&>button]:text-white [&>button]:hover:text-amber-400 [&>button]:opacity-100">
        <DialogHeader className="mt-2">
          <DialogTitle className="text-2xl md:text-3xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Activez votre abonnement coach
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Choisissez la formule qui vous convient et commencez à coacher dès aujourd&apos;hui
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Toggle Mensuel/Annuel */}
          <div className="flex items-center justify-center gap-3 p-1 bg-slate-800/50 rounded-lg border border-white/10">
            <button
              onClick={() => setBillingPeriod('MONTHLY')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all ${
                billingPeriod === 'MONTHLY'
                  ? 'bg-white text-slate-900'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingPeriod('YEARLY')}
              className={`flex-1 py-3 px-6 rounded-md font-semibold transition-all relative ${
                billingPeriod === 'YEARLY'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Économisez {YEARLY_SAVINGS}%
              </span>
            </button>
          </div>

          {/* Carte d'abonnement unique */}
          <GlassCard className="border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8">
            <div className="text-center mb-8 h-[140px] flex flex-col justify-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {currentPrice}€
                </span>
                <span className="text-gray-400 text-lg">/{currentPeriod}</span>
              </div>
              <div className="h-[24px] flex items-center justify-center">
                {billingPeriod === 'YEARLY' && (
                  <p className="text-sm text-amber-400 font-medium">
                    Soit {YEARLY_MONTHLY_EQUIVALENT}€/mois • 2 mois offerts
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-2">Sans engagement</p>
            </div>

            <ul className="space-y-3 mb-8">
              {FEATURES.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-amber-400 flex-shrink-0" />
                  <span className="text-base text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <GradientButton
              variant="amber"
              size="lg"
              className="w-full text-base h-12"
              onClick={handleSubscribe}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirection...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  S&apos;abonner - {currentPrice}€/{currentPeriod}
                </>
              )}
            </GradientButton>
          </GlassCard>

          {/* Info */}
          <div className="text-center text-xs md:text-sm text-gray-400 space-y-1">
            <p>
              Paiement sécurisé via Stripe • Annulation possible à tout moment
            </p>
            <p className="text-xs">
              L&apos;abonnement se renouvelle automatiquement mais vous pouvez annuler quand vous le souhaitez
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
