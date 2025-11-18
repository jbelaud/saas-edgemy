'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, Zap, Loader2, Gift, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { GradientButton, GlassCard } from '@/components/ui';
import { Input } from '@/components/ui/input';

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
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentPrice = billingPeriod === 'MONTHLY' ? MONTHLY_PRICE : YEARLY_PRICE;
  const currentPeriod = billingPeriod === 'MONTHLY' ? 'mois' : 'an';

  const handlePromoActivation = async () => {
    if (!promoCode.trim()) return;

    setIsLoading(true);
    setPromoMessage(null);

    try {
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.toUpperCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code promo invalide');
      }

      setPromoMessage({
        type: 'success',
        text: '30 jours gratuits activés ! Redirection...'
      });

      // Rediriger vers le dashboard après 1.5 secondes
      setTimeout(() => {
        window.location.href = `/${locale}/coach/dashboard?subscription=success`;
      }, 1500);

    } catch (error) {
      setPromoMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Code promo invalide'
      });
      setIsLoading(false);
    }
  };

  const handleSubscribe = async () => {
    // Continuer vers Stripe pour le paiement
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

            {/* Champ code promo */}
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-emerald-400" />
                <label htmlFor="promo-code" className="text-sm font-semibold text-emerald-300">
                  Code promo
                </label>
              </div>
              <div className="flex gap-2 mb-2">
                <Input
                  id="promo-code"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="EDGEMY-FREE1MONTH"
                  className="text-center font-semibold tracking-wider uppercase flex-1"
                  disabled={isLoading}
                />
                <button
                  onClick={handlePromoActivation}
                  disabled={isLoading || !promoCode.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all whitespace-nowrap"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Valider'
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 text-center">
                Tu as reçu un code pour 30 jours gratuits ? Entre-le ici
              </p>
              {promoMessage && (
                <div className={`mt-3 p-3 rounded-lg border ${
                  promoMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}>
                  <div className="flex items-center gap-2">
                    {promoMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    )}
                    <p className={`text-xs font-semibold ${
                      promoMessage.type === 'success' ? 'text-emerald-300' : 'text-red-300'
                    }`}>
                      {promoMessage.text}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Séparateur OU */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
              <span className="text-sm font-semibold text-gray-400">OU</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent" />
            </div>

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
                  Redirection vers le paiement...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  {billingPeriod === 'MONTHLY'
                    ? 'S\'abonner - 39€/mois'
                    : 'S\'abonner - 399€/an'}
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
