'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Crown, Zap } from 'lucide-react';
import type { OnboardingData } from '@/types/coach';

interface Props {
  data: Partial<OnboardingData>;
  onComplete: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
  isLoading: boolean;
}

export function OnboardingStep5({ onComplete, onBack, isLoading }: Props) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = async () => {
    try {
      // TODO: Implémenter Stripe Checkout
      // const response = await fetch('/api/stripe/checkout', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ plan: selectedPlan }),
      // });
      // const { url } = await response.json();
      // window.location.href = url;

      // Pour le MVP, on simule l'abonnement
      const mockSubId = 'sub_mock_' + Date.now();
      
      // Finaliser l'onboarding
      onComplete({ subscriptionId: mockSubId });
    } catch (error) {
      console.error('Erreur abonnement:', error);
      alert('Erreur lors de la souscription');
    }
  };

  const monthlyPrice = 39;
  const yearlyPrice = 399;
  const yearlySavings = (monthlyPrice * 12 - yearlyPrice).toFixed(0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Choisissez votre abonnement
        </h2>
        <p className="text-gray-300">
          Débloquez toutes les fonctionnalités pour développer votre activité de coaching
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <div
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedPlan === 'monthly'
              ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
              : 'border-white/20 hover:border-white/40 bg-white/5'
          }`}
          onClick={() => setSelectedPlan('monthly')}
        >
          {selectedPlan === 'monthly' && (
            <div className="absolute top-4 right-4">
              <Check className="h-6 w-6 text-amber-400" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Zap className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Mensuel</h3>
              <p className="text-sm text-gray-400">Flexible</p>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold text-white">{monthlyPrice}€</span>
            <span className="text-gray-400">/mois</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Annonces illimitées</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Calendrier intelligent</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Statistiques détaillées</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Support prioritaire</span>
            </li>
          </ul>
        </div>

        {/* Yearly Plan */}
        <div
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedPlan === 'yearly'
              ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20'
              : 'border-white/20 hover:border-white/40 bg-white/5'
          }`}
          onClick={() => setSelectedPlan('yearly')}
        >
          <div className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Économisez {yearlySavings}€
          </div>
          {selectedPlan === 'yearly' && (
            <div className="absolute top-4 right-4">
              <Check className="h-6 w-6 text-amber-400" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Crown className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-bold text-white">Annuel</h3>
              <p className="text-sm text-gray-400">Meilleur prix</p>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold text-white">{yearlyPrice}€</span>
            <span className="text-gray-400">/an</span>
            <p className="text-sm text-emerald-400 font-medium mt-1">
              Soit {(yearlyPrice / 12).toFixed(2)}€/mois
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Annonces illimitées</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Calendrier intelligent</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Statistiques détaillées</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="text-gray-300">Support prioritaire</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span className="font-medium text-emerald-400">2 mois offerts</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading} className="bg-white/90 border-white/20 text-gray-900 hover:bg-white hover:text-black">
          Retour
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleSubscribe}
          disabled={isLoading}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finalisation...
            </>
          ) : (
            <>
              Souscrire et finaliser
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
