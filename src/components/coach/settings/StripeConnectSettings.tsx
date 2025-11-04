'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface StripeStatus {
  connected: boolean;
  accountId: string | null;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  requirements?: {
    currentlyDue?: string[];
    eventuallyDue?: string[];
    pastDue?: string[];
  };
}

export function StripeConnectSettings() {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const searchParams = useSearchParams();

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/stripe/connect/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Erreur chargement statut Stripe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Afficher un message de succès/refresh si présent dans l'URL
    const stripeSuccess = searchParams.get('stripe_success');
    const stripeRefresh = searchParams.get('stripe_refresh');

    if (stripeSuccess) {
      alert('✅ Votre compte Stripe a été configuré avec succès !');
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (stripeRefresh) {
      alert('⚠️ Veuillez compléter la configuration de votre compte Stripe.');
    }
  }, [searchParams]);

  const handleConnect = async (refresh = false) => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/stripe/connect/account-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la connexion à Stripe');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Erreur Stripe Connect:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la connexion à Stripe');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
      </div>
    );
  }

  const isFullyConnected =
    status?.connected &&
    status?.detailsSubmitted &&
    status?.chargesEnabled &&
    status?.payoutsEnabled;

  const hasPendingRequirements =
    status?.requirements &&
    (status.requirements.currentlyDue?.length || status.requirements.pastDue?.length);

  return (
    <div className="space-y-4">
      <div className="p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg">
        <p className="text-sm text-sky-300 mb-2 font-semibold">
          Pourquoi connecter Stripe ?
        </p>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>✅ Recevez vos paiements directement sur votre compte bancaire</li>
          <li>✅ Accédez à un tableau de bord professionnel pour vos revenus</li>
          <li>✅ Conformité légale et fiscale simplifiée</li>
          <li>✅ Protection contre la fraude et gestion des remboursements</li>
        </ul>
      </div>

      <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-3">
        <Shield className="h-5 w-5 text-emerald-300 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-300 mb-1">
            Sécurité des paiements
          </p>
          <p className="text-xs text-gray-400">
            Stripe vérifie votre identité et sécurise toutes les transactions. Vous gardez le contrôle sur vos versements et pouvez définir votre fréquence de paiement.
          </p>
        </div>
      </div>

      {/* Statut du compte */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm font-medium text-white mb-1">Statut du compte Stripe</p>
            {!status?.connected && (
              <p className="text-xs text-gray-400">Non connecté</p>
            )}
          </div>
          {isFullyConnected && (
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
          )}
          {status?.connected && !isFullyConnected && (
            <AlertTriangle className="h-6 w-6 text-amber-400" />
          )}
        </div>

        {status?.connected && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Informations complétées</span>
              <span className={status.detailsSubmitted ? 'text-emerald-400' : 'text-amber-400'}>
                {status.detailsSubmitted ? '✓ Oui' : '⚠ Non'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Paiements activés</span>
              <span className={status.chargesEnabled ? 'text-emerald-400' : 'text-amber-400'}>
                {status.chargesEnabled ? '✓ Oui' : '⚠ Non'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Versements activés</span>
              <span className={status.payoutsEnabled ? 'text-emerald-400' : 'text-amber-400'}>
                {status.payoutsEnabled ? '✓ Oui' : '⚠ Non'}
              </span>
            </div>
          </div>
        )}

        {hasPendingRequirements && (
          <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded">
            <p className="text-xs text-amber-300 font-medium mb-1">
              ⚠️ Informations manquantes
            </p>
            <p className="text-xs text-gray-400">
              Certaines informations doivent être complétées pour activer complètement votre compte.
            </p>
          </div>
        )}
      </div>

      {/* Bouton d'action */}
      <div className="flex flex-col gap-3">
        {!status?.connected ? (
          <Button
            onClick={() => handleConnect(false)}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/30"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                Configurer mon compte Stripe
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : !isFullyConnected ? (
          <Button
            onClick={() => handleConnect(true)}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connexion en cours...
              </>
            ) : (
              <>
                Compléter la configuration
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={() => handleConnect(true)}
            disabled={isConnecting}
            variant="outline"
            className="w-full border-white/20 text-gray-300 hover:bg-white/10"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Gérer mon compte Stripe
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        💡 Après connexion, vous pourrez suivre vos versements depuis votre tableau de bord Stripe et disposer d&apos;un historique complet pour votre comptabilité.
      </p>
    </div>
  );
}
