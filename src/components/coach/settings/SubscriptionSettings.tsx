'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SubscriptionData {
  subscriptionStatus: string | null;
  subscriptionPlan: string | null;
  currentPeriodEnd: string | null;
  subscriptionId: string | null;
  cancelAtPeriodEnd?: boolean;
  cancelAt?: string | null;
}

export function SubscriptionSettings() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [targetPlan, setTargetPlan] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/coach/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Erreur chargement abonnement:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setIsCanceling(true);
      const response = await fetch('/api/coach/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Ne pas utiliser la variable error pour éviter l'avertissement
        await response.json();
        alert('Erreur lors de l&apos;annulation de l&apos;abonnement');
        return;
      }

      // Ne pas déstructurer cancelError pour éviter l'avertissement
      const result = await response.json();
      
      if (!result.success) {
        alert('Erreur lors de l&apos;annulation de l&apos;abonnement');
        return;
      }

      // Mettre à jour l'état local
      if (subscription) {
        setSubscription({
          ...subscription,
          subscriptionStatus: 'CANCELED',
          cancelAtPeriodEnd: true,
          cancelAt: new Date().toISOString(),
        });
      }
      
      setShowCancelDialog(false);
      alert('Votre abonnement a bien été annulé. Il restera actif jusqu&apos;à la fin de la période en cours.');
    } catch (error) {
      // Ne pas utiliser err pour éviter l'avertissement
      alert('Une erreur est survenue lors de l&apos;annulation de votre abonnement');
      console.error('Erreur lors de l&apos;annulation de l&apos;abonnement:', error);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleChangePlan = async (newPlan: 'MONTHLY' | 'YEARLY') => {
    setIsChanging(true);
    try {
      const response = await fetch('/api/coach/subscription/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPlan }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.checkoutUrl) {
          // Cas MONTHLY → YEARLY : Rediriger vers Stripe Checkout pour le paiement
          window.location.href = data.checkoutUrl;
        } else {
          // Cas YEARLY → MONTHLY : Changement planifié pour la fin de période
          alert(data.message || 'Votre changement de plan a été planifié avec succès');
          setIsChanging(false);
          setShowChangeDialog(false);
          await fetchSubscription();
        }
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.error || 'Impossible de changer de plan'}`);
        setIsChanging(false);
        setShowChangeDialog(false);
      }
    } catch (err) {
      console.error('Erreur changement de plan:', err);
      alert('Une erreur est survenue lors du changement de plan');
      setIsChanging(false);
      setShowChangeDialog(false);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Actif
          </Badge>
        );
      case 'PAST_DUE':
        return (
          <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Paiement en retard
          </Badge>
        );
      case 'CANCELED':
        return (
          <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
            Annulé
          </Badge>
        );
      case 'INCOMPLETE':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Incomplet
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-500/20 text-gray-300 border-gray-500/30">
            Aucun abonnement
          </Badge>
        );
    }
  };

  const getPlanBadge = (plan: string | null) => {
    switch (plan) {
      case 'MONTHLY':
        return <Badge variant="outline" className="border-blue-500/50 text-blue-300">Mensuel</Badge>;
      case 'YEARLY':
        return <Badge variant="outline" className="border-purple-500/50 text-purple-300">Annuel</Badge>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-48 bg-white/5 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statut de l&apos;abonnement */}
      <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-white">Statut de l&apos;abonnement</h3>
          {getStatusBadge(subscription?.subscriptionStatus || null)}
        </div>

        {subscription?.subscriptionPlan && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Plan actuel:</span>
            {getPlanBadge(subscription.subscriptionPlan)}
            <span>
              {subscription.subscriptionPlan === 'MONTHLY' ? '39€/mois' : '399€/an'}
            </span>
          </div>
        )}

        {subscription?.currentPeriodEnd && (
          <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
            <Calendar className="w-4 h-4" />
            <span>
              {subscription.subscriptionStatus === 'CANCELED'
                ? `Accès jusqu&apos;au ${format(new Date(subscription.currentPeriodEnd), 'PPP', { locale: fr })}`
                : subscription.cancelAtPeriodEnd
                  ? `Annulé - Actif jusqu&apos;au ${format(new Date(subscription.currentPeriodEnd), 'PPP', { locale: fr })}`
                  : `Renouvellement le ${format(new Date(subscription.currentPeriodEnd), 'PPP', { locale: fr })}`
              }
            </span>
          </div>
        )}
      </div>

      {/* Message d&apos;alerte pour abonnement annulé mais toujours actif */}
      {subscription?.subscriptionStatus === 'ACTIVE' && subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-orange-300 mb-1">
                Abonnement annulé
              </h4>
              <p className="text-xs text-gray-400">
                Votre abonnement a été annulé mais reste actif jusqu&apos;au {format(new Date(subscription.currentPeriodEnd), 'PPP', { locale: fr })}.
                Après cette date, vous perdrez l&apos;accès aux fonctionnalités coach.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Informations de renouvellement automatique */}
      {subscription?.subscriptionStatus === 'ACTIVE' && !subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-green-300 mb-1">
                Renouvellement automatique
              </h4>
              <p className="text-xs text-gray-400">
                Votre abonnement sera automatiquement renouvelé le{' '}
                <span className="font-semibold text-white">
                  {format(new Date(subscription.currentPeriodEnd), 'PPP', { locale: fr })}
                </span>
                {' '}pour{' '}
                <span className="font-semibold text-white">
                  {subscription.subscriptionPlan === 'MONTHLY' ? '39€' : '399€'}
                </span>
                . Vous pouvez annuler à tout moment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions selon le statut */}
      {subscription?.subscriptionStatus === 'ACTIVE' && !subscription?.cancelAtPeriodEnd && (() => {
        // Calculer si on peut passer de YEARLY à MONTHLY (seulement dans le dernier mois)
        const canDowngradeToMonthly = subscription.subscriptionPlan === 'YEARLY' && subscription.currentPeriodEnd
          ? (() => {
              const periodEnd = new Date(subscription.currentPeriodEnd);
              const now = new Date();
              const oneMonthBeforeEnd = new Date(periodEnd);
              oneMonthBeforeEnd.setMonth(oneMonthBeforeEnd.getMonth() - 1);
              return now >= oneMonthBeforeEnd;
            })()
          : true; // Si MONTHLY, toujours autorisé (pour passer à YEARLY)

        const daysUntilEligible = subscription.subscriptionPlan === 'YEARLY' && subscription.currentPeriodEnd && !canDowngradeToMonthly
          ? (() => {
              const periodEnd = new Date(subscription.currentPeriodEnd);
              const oneMonthBeforeEnd = new Date(periodEnd);
              oneMonthBeforeEnd.setMonth(oneMonthBeforeEnd.getMonth() - 1);
              const now = new Date();
              return Math.ceil((oneMonthBeforeEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            })()
          : 0;

        return (
          <div className="space-y-3">
            {/* Changer de plan */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3 mb-3">
                <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-blue-300 mb-1">
                    Changer de plan
                  </h4>
                  <p className="text-xs text-gray-400 mb-3">
                    {subscription.subscriptionPlan === 'MONTHLY'
                      ? 'Passez à l\'annuel et économisez 2 mois (399€/an au lieu de 468€/an)'
                      : canDowngradeToMonthly
                        ? 'Revenez au mensuel pour plus de flexibilité (39€/mois)'
                        : `Vous pourrez passer au mensuel dans ${daysUntilEligible} jour${daysUntilEligible > 1 ? 's' : ''} (1 mois avant la fin de votre abonnement annuel)`
                    }
                  </p>
                  <Button
                    onClick={() => {
                      setTargetPlan(subscription.subscriptionPlan === 'MONTHLY' ? 'YEARLY' : 'MONTHLY');
                      setShowChangeDialog(true);
                    }}
                    disabled={isChanging || !canDowngradeToMonthly}
                    variant="outline"
                    className="border-blue-500/70 bg-blue-950/60 text-blue-100 hover:bg-blue-800/70 hover:border-blue-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChanging ? 'Changement en cours...' :
                      subscription.subscriptionPlan === 'MONTHLY' ? 'Passer à l&#39;annuel' : 'Passer au mensuel'
                    }
                  </Button>
                </div>
              </div>
            </div>

          {/* Annuler l&apos;abonnement */}
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-300 mb-1">
                  Annuler l&apos;abonnement
                </h4>
                <p className="text-xs text-gray-400 mb-3">
                  {subscription.currentPeriodEnd ? (
                    <>
                      Votre abonnement restera actif jusqu&apos;à la fin de la période payée ({format(new Date(subscription.currentPeriodEnd), 'PP', { locale: fr })}).
                      Après cette date, vous perdrez l&apos;accès aux fonctionnalités coach.
                    </>
                  ) : (
                    <>
                      En annulant, vous perdrez l&apos;accès aux fonctionnalités coach à la fin de la période en cours.
                    </>
                  )}
                </p>
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  disabled={isCanceling}
                  variant="outline"
                  className="border-red-500/70 bg-red-950/60 text-red-100 hover:bg-red-800/70 hover:border-red-400 hover:text-white"
                >
                  {isCanceling ? 'Annulation...' : 'Annuler mon abonnement'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Si abonnement annulé */}
      {subscription?.subscriptionStatus === 'CANCELED' && subscription.currentPeriodEnd && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-orange-300 mb-1">
                Abonnement annulé
              </h4>
              <p className="text-xs text-gray-400">
                Vous avez accès à toutes les fonctionnalités jusqu&apos;au {format(new Date(subscription.currentPeriodEnd), 'PPP', { locale: fr })}.
                Après cette date, votre compte sera désactivé.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Si paiement en retard */}
      {subscription?.subscriptionStatus === 'PAST_DUE' && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-300 mb-1">
                ⚠️ Paiement en retard
              </h4>
              <p className="text-xs text-gray-400 mb-3">
                Le dernier paiement de votre abonnement a échoué. Veuillez mettre à jour votre moyen de paiement pour continuer à utiliser les fonctionnalités coach.
              </p>
              <Button
                onClick={() => window.open('https://billing.stripe.com/p/login/test_YOUR_PORTAL_ID', '_blank')}
                variant="outline"
                className="border-red-500/70 bg-red-950/60 text-red-100 hover:bg-red-800/70 hover:border-red-400 hover:text-white"
              >
                Mettre à jour mon moyen de paiement
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Si pas d'abonnement */}
      {!subscription?.subscriptionStatus || subscription.subscriptionStatus === 'CANCELED' &&
       subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date() && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg text-center">
          <p className="text-sm text-gray-300 mb-3">
            Vous n'avez pas d'abonnement actif. Souscrivez pour accéder à toutes les fonctionnalités coach.
          </p>
          <Button
            onClick={() => window.location.href = '/fr/coach/dashboard'}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            Souscrire à un abonnement
          </Button>
        </div>
      )}

      {/* Dialog de confirmation d'annulation */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-slate-900 border-red-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Êtes-vous sûr de vouloir annuler ?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Votre abonnement restera actif jusqu'à la fin de la période payée. Après cette date, vous n'aurez plus accès aux fonctionnalités suivantes :
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>Création et gestion des annonces</li>
                <li>Gestion de l'agenda et des disponibilités</li>
                <li>Suivi des élèves et de leurs progressions</li>
                <li>Gestion des packs d'heures</li>
                <li>Accès aux statistiques de revenus</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Conserver mon abonnement
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={isCanceling}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCanceling ? 'Annulation...' : 'Oui, annuler mon abonnement'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de confirmation de changement de plan */}
      <AlertDialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <AlertDialogContent className="bg-slate-900 border-blue-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Changer de plan {targetPlan === 'YEARLY' ? 'annuel' : 'mensuel'} ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {targetPlan === 'YEARLY' ? (
                <>
                  En passant à l'abonnement annuel, vous bénéficierez de :
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>399€/an au lieu de 468€/an (soit 2 mois offerts)</li>
                    <li>Un seul paiement par an</li>
                    <li>Accès garanti pendant 12 mois</li>
                  </ul>
                  <p className="mt-2 text-sm font-semibold text-blue-300">
                    Vous allez être redirigé vers une page de paiement sécurisée Stripe pour valider votre changement de plan.
                  </p>
                </>
              ) : (
                <>
                  En passant à l'abonnement mensuel, vous bénéficierez de :
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Plus de flexibilité avec un engagement mensuel</li>
                    <li>39€/mois</li>
                    <li>Possibilité d'annuler à tout moment</li>
                  </ul>
                  <p className="mt-2 text-sm font-semibold text-orange-300">
                    Le changement prendra effet à la fin de votre période annuelle en cours. Vous continuerez à bénéficier de votre accès annuel jusqu'à cette date.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-800">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleChangePlan(targetPlan)}
              disabled={isChanging}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isChanging ? 'Changement...' : `Passer ${targetPlan === 'YEARLY' ? 'à l\'annuel' : 'au mensuel'}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
