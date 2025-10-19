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

export function OnboardingStep5({ data, onComplete, onBack, isLoading }: Props) {
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

  const monthlyPrice = 29.90;
  const yearlyPrice = 299;
  const yearlySavings = (monthlyPrice * 12 - yearlyPrice).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Choisissez votre abonnement
        </h2>
        <p className="text-gray-600">
          Débloquez toutes les fonctionnalités pour développer votre activité de coaching
        </p>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <div
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedPlan === 'monthly'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPlan('monthly')}
        >
          {selectedPlan === 'monthly' && (
            <div className="absolute top-4 right-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Mensuel</h3>
              <p className="text-sm text-gray-600">Flexible</p>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">{monthlyPrice}€</span>
            <span className="text-gray-600">/mois</span>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Annonces illimitées</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Calendrier intelligent</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Statistiques détaillées</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Support prioritaire</span>
            </li>
          </ul>
        </div>

        {/* Yearly Plan */}
        <div
          className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all ${
            selectedPlan === 'yearly'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedPlan('yearly')}
        >
          <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            Économisez {yearlySavings}€
          </div>
          {selectedPlan === 'yearly' && (
            <div className="absolute top-4 right-4">
              <Check className="h-6 w-6 text-primary" />
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Crown className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Annuel</h3>
              <p className="text-sm text-gray-600">Meilleur prix</p>
            </div>
          </div>
          <div className="mb-4">
            <span className="text-4xl font-bold text-gray-900">{yearlyPrice}€</span>
            <span className="text-gray-600">/an</span>
            <p className="text-sm text-green-600 font-medium mt-1">
              Soit {(yearlyPrice / 12).toFixed(2)}€/mois
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Annonces illimitées</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Calendrier intelligent</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Statistiques détaillées</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Support prioritaire</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="font-medium text-green-600">2 mois offerts</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={isLoading}>
          Retour
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleSubscribe}
          disabled={isLoading}
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
