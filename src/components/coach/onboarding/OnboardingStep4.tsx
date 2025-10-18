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
      // TODO: Implémenter la création du Stripe Connect Account Link
      // const response = await fetch('/api/stripe/connect', { method: 'POST' });
      // const { url } = await response.json();
      // window.location.href = url;

      // Pour le MVP, on simule la connexion
      alert('Stripe Connect sera configuré plus tard. Pour le MVP, vous pouvez continuer.');
      setStripeAccountId('acct_mock_' + Date.now());
    } catch (error) {
      console.error('Erreur Stripe Connect:', error);
      alert('Erreur lors de la connexion à Stripe');
    } finally {
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Paiements Stripe
        </h2>
        <p className="text-gray-600">
          Connectez votre compte Stripe pour recevoir vos paiements
        </p>
      </div>

      {/* Stripe Info */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg shadow-sm">
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              Pourquoi Stripe ?
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Paiements sécurisés et conformes PCI-DSS</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Virements automatiques sur votre compte bancaire</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Dashboard détaillé de vos revenus</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Commission Edgemy: {process.env.NEXT_PUBLIC_COMMISSION_RATE || '5'}%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      {isConnected ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-medium text-green-900">
                Compte Stripe connecté
              </p>
              <p className="text-sm text-green-700">
                Vous êtes prêt à recevoir des paiements
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">
            Connectez votre compte Stripe
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Vous serez redirigé vers Stripe pour configurer votre compte de paiement
          </p>
          <Button
            type="button"
            onClick={handleStripeConnect}
            disabled={isConnecting}
            size="lg"
          >
            {isConnecting ? 'Connexion...' : 'Connecter Stripe'}
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>Note :</strong> Stripe Connect est requis pour recevoir des paiements. 
          Vous pourrez gérer vos paiements directement depuis votre dashboard Stripe.
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button
          type="button"
          size="lg"
          onClick={handleNext}
          disabled={!isConnected}
        >
          Continuer
        </Button>
      </div>
    </div>
  );
}
