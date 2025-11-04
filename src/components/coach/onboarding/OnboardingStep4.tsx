'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, CheckCircle2, ExternalLink } from 'lucide-react';
import type { OnboardingData } from '@/types/coach';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export function OnboardingStep4({ data, onNext, onBack }: Props) {
  const [stripeAccountId, setStripeAccountId] = useState(data.stripeAccountId || '');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleStripeConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: false }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la connexion à Stripe');
      }

      const { url, accountId } = await response.json();

      // Stocker l'accountId localement
      setStripeAccountId(accountId);

      // Si c'est un mode mock (URL contient stripe_mock), passer directement à l'étape suivante
      if (url.includes('stripe_mock=true')) {
        console.log('Mode développement : Stripe Connect simulé');
        // Passer directement à l'étape suivante
        setTimeout(() => {
          setIsConnecting(false);
        }, 500);
      } else {
        // Rediriger vers Stripe pour compléter l'onboarding
        window.location.href = url;
      }
    } catch (error) {
      console.error('Erreur Stripe Connect:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la connexion à Stripe');
      setIsConnecting(false);
    }
  };

  const handleNext = () => {
    onNext({ stripeAccountId });
  };

  const isConnected = !!stripeAccountId;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Paiements Stripe
        </h2>
        <p className="text-gray-300">
          Connectez votre compte Stripe pour recevoir vos paiements
        </p>
      </div>

      {/* Stripe Info */}
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <CreditCard className="h-8 w-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-2">
              Pourquoi Stripe ?
            </h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Paiements sécurisés et conformes PCI-DSS</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Virements automatiques sur votre compte bancaire</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Dashboard détaillé de vos revenus</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span>Commission Edgemy: {process.env.NEXT_PUBLIC_COMMISSION_RATE || '5'}%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {isConnected ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            <div>
              <p className="font-medium text-emerald-300">
                Compte Stripe connecté
              </p>
              <p className="text-sm text-emerald-400/80">
                Vous êtes prêt à recevoir des paiements
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center bg-white/5">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-white mb-2">
            Connectez votre compte Stripe
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            Vous serez redirigé vers Stripe pour configurer votre compte de paiement
          </p>
          <Button
            type="button"
            onClick={handleStripeConnect}
            disabled={isConnecting}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-purple-500/30"
          >
            {isConnecting ? 'Connexion...' : 'Connecter Stripe'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <p className="text-sm text-gray-300">
          <strong className="text-white">Note :</strong> Stripe Connect est requis pour recevoir des paiements.
          Vous pourrez gérer vos paiements directement depuis votre dashboard Stripe.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="bg-white/90 border-white/20 text-gray-900 hover:bg-white hover:text-black">
          Retour
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={!isConnected}
          className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
