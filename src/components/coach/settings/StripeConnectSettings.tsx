'use client';

import { useState, useEffect } from 'react';
import { fetchWithCsrf } from '@/lib/security/csrf-client';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle2, AlertTriangle, Loader2, ExternalLink, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { SubscriptionModalCoach } from '@/components/coach/subscription/SubscriptionModalCoach';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';

interface StripeStatus {
  connected: boolean;
  accountId: string | null;
  detailsSubmitted: boolean;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  hasActiveSubscription: boolean;
  canAccessStripeConnect: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  subscriptionStatus: string | null;
  planKey?: 'PRO' | 'LITE' | null;
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
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showRefreshMessage, setShowRefreshMessage] = useState(false);
  const searchParams = useSearchParams();
  const { alertState, confirmState, showError, closeAlert, closeConfirm } = useAlertDialog();

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
      setShowSuccessMessage(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setShowSuccessMessage(false), 5000);
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (stripeRefresh) {
      setShowRefreshMessage(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setShowRefreshMessage(false), 5000);
    }
  }, [searchParams]);

  const handleConnect = async (refresh = false) => {
    setIsConnecting(true);
    try {
      const response = await fetchWithCsrf('/api/stripe/connect/account-link', {
        method: 'POST',
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
      showError(
        'Erreur de connexion',
        error instanceof Error ? error.message : 'Erreur lors de la connexion à Stripe'
      );
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

  // Si le coach a un plan LITE, ne pas afficher la section Stripe Connect
  if (status?.planKey === 'LITE') {
    return null;
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
      {/* Message de succès Stripe */}
      {showSuccessMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-300 mb-1">
                Compte Stripe configuré avec succès !
              </p>
              <p className="text-xs text-gray-400">
                Vous pouvez maintenant recevoir des paiements directement sur votre compte bancaire.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message de refresh Stripe */}
      {showRefreshMessage && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-300 mb-1">
                Configuration incomplète
              </p>
              <p className="text-xs text-gray-400">
                Veuillez compléter la configuration de votre compte Stripe pour recevoir des paiements.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerte si pas d'abonnement */}
      {!status?.canAccessStripeConnect && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-300 mb-1">
                Abonnement requis
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Tu dois activer ton abonnement avant de pouvoir connecter Stripe.
              </p>
              <Button
                onClick={() => setIsSubscriptionModalOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
              >
                <Zap className="mr-2 h-4 w-4" />
                Activer mon abonnement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Alerte si abonnement annulé mais encore actif */}
      {status?.canAccessStripeConnect && status?.cancelAtPeriodEnd && status?.currentPeriodEnd && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-300 mb-1">
                Abonnement annulé - Actif jusqu&apos;au {new Date(status.currentPeriodEnd).toLocaleDateString('fr-FR')}
              </p>
              <p className="text-xs text-gray-400">
                Votre abonnement a été annulé mais reste actif jusqu&apos;à la fin de la période payée. Vous pouvez toujours configurer Stripe.
              </p>
            </div>
          </div>
        </div>
      )}

      {status?.canAccessStripeConnect && (
        <>
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
        </>
      )}

      {status?.canAccessStripeConnect && (
        <>
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
            size="sm"
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
            onClick={() => handleConnect(false)}
            disabled={isConnecting}
            size="sm"
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
            size="sm"
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/30"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Chargement...
              </>
            ) : (
              <>
                Accéder au tableau de bord Stripe
                <ExternalLink className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
            )}
          </div>

          <p className="text-xs text-gray-500">
            💡 Après connexion, vous pourrez suivre vos versements depuis votre tableau de bord Stripe et disposer d&apos;un historique complet pour votre comptabilité.
          </p>
        </>
      )}

      {/* Modal d'abonnement */}
      <SubscriptionModalCoach
        open={isSubscriptionModalOpen}
        onOpenChange={setIsSubscriptionModalOpen}
      />

      {/* Modals de notification */}
      <AlertDialogCustom
        open={alertState.open}
        onOpenChange={closeAlert}
        title={alertState.title}
        description={alertState.description}
        type={alertState.type}
      />

      <AlertDialogCustom
        open={confirmState.open}
        onOpenChange={closeConfirm}
        title={confirmState.title}
        description={confirmState.description}
        type="warning"
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={confirmState.onConfirm}
        showCancel={true}
      />
    </div>
  );
}
