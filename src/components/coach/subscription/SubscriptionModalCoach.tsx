'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Check, Zap, Loader2, Gift, CheckCircle2, AlertCircle, Sparkles, CreditCard } from 'lucide-react';
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

// Prix des plans
const PLANS = {
  PRO: {
    MONTHLY: 39,
    YEARLY: 399,
    features: [
      'Paiement Stripe automatique',
      'Discord privé avec élèves',
      'Sessions illimitées',
      'Analytics avancées',
      'Support prioritaire',
      'Branding personnalisé',
      'Hébergement replays',
      'Facturation intégrée',
    ],
  },
  LITE: {
    MONTHLY: 15,
    YEARLY: 149,
    features: [
      'Paiement externe (USDT, Wise, etc.)',
      'Discord privé avec élèves',
      'Sessions illimitées',
      'Configuration moyens de paiement',
      'Support standard',
    ],
  },
};

export function SubscriptionModalCoach({ open, onOpenChange }: SubscriptionModalCoachProps) {
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'PRO' | 'LITE'>('PRO');
  const [billingPeriod, setBillingPeriod] = useState<'MONTHLY' | 'YEARLY'>('YEARLY');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentPlanPrices = PLANS[selectedPlan];
  const currentPrice = billingPeriod === 'MONTHLY' ? currentPlanPrices.MONTHLY : currentPlanPrices.YEARLY;
  const currentPeriod = billingPeriod === 'MONTHLY' ? 'mois' : 'an';

  // Calculs pour annuel
  const yearlyMonthlyEquivalent = (currentPlanPrices.YEARLY / 12).toFixed(2);
  const yearlySavings = ((currentPlanPrices.MONTHLY * 12 - currentPlanPrices.YEARLY) / (currentPlanPrices.MONTHLY * 12) * 100).toFixed(0);

  const handlePromoActivation = async () => {
    if (!promoCode.trim()) return;

    setIsLoading(true);
    setPromoMessage(null);

    try {
      const response = await fetch('/api/subscription/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          planKey: selectedPlan, // Envoyer le plan sélectionné
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Code promo invalide');
      }

      setPromoMessage({
        type: 'success',
        text: `30 jours gratuits activés (Plan ${selectedPlan}) ! Redirection...`
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
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: billingPeriod,
          planKey: selectedPlan, // Envoyer le plan (PRO ou LITE)
          locale
        }),
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
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-slate-900/98 backdrop-blur-xl border-amber-500/20 [&>button]:text-white [&>button]:hover:text-amber-400 [&>button]:opacity-100">
        <DialogHeader className="mt-2">
          <DialogTitle className="text-2xl md:text-3xl bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Activez votre abonnement coach
          </DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Choisissez le plan et la formule qui vous conviennent
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sélection du plan PRO / LITE */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedPlan('PRO')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPlan === 'PRO'
                  ? 'border-amber-500 bg-amber-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                <h3 className="font-bold text-lg text-white">Plan PRO</h3>
              </div>
              <p className="text-sm text-gray-400">Paiement Stripe automatique</p>
            </button>

            <button
              onClick={() => setSelectedPlan('LITE')}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedPlan === 'LITE'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-blue-400" />
                <h3 className="font-bold text-lg text-white">Plan LITE</h3>
              </div>
              <p className="text-sm text-gray-400">Paiement externe (USDT, Wise...)</p>
            </button>
          </div>

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
                  ? selectedPlan === 'PRO'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black'
                    : 'bg-gradient-to-r from-blue-400 to-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                Économisez {yearlySavings}%
              </span>
            </button>
          </div>

          {/* Carte d'abonnement */}
          <GlassCard className={`border-2 p-8 ${
            selectedPlan === 'PRO'
              ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-orange-500/10'
              : 'border-blue-500/40 bg-gradient-to-br from-blue-500/10 to-blue-600/10'
          }`}>
            <div className="text-center mb-8 h-[140px] flex flex-col justify-center">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className={`text-5xl md:text-6xl font-bold ${
                  selectedPlan === 'PRO'
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                    : 'bg-gradient-to-r from-blue-400 to-blue-600'
                } bg-clip-text text-transparent`}>
                  {currentPrice}€
                </span>
                <span className="text-gray-400 text-lg">/{currentPeriod}</span>
              </div>
              <div className="h-[24px] flex items-center justify-center">
                {billingPeriod === 'YEARLY' && (
                  <p className={`text-sm font-medium ${
                    selectedPlan === 'PRO' ? 'text-amber-400' : 'text-blue-400'
                  }`}>
                    Soit {yearlyMonthlyEquivalent}€/mois • {billingPeriod === 'YEARLY' && selectedPlan === 'PRO' ? '2 mois' : '1 mois'} offert{billingPeriod === 'YEARLY' && selectedPlan === 'PRO' ? 's' : ''}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-400 mt-2">Sans engagement</p>
            </div>

            <ul className="space-y-3 mb-8">
              {currentPlanPrices.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Check className={`h-5 w-5 flex-shrink-0 ${
                    selectedPlan === 'PRO' ? 'text-amber-400' : 'text-blue-400'
                  }`} />
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
                  placeholder="FREE30"
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
              className={`w-full text-base h-12 ${
                selectedPlan === 'LITE' ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700' : ''
              }`}
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
                  S&apos;abonner au Plan {selectedPlan} - {currentPrice}€/{currentPeriod}
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
