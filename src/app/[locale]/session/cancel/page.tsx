'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { XCircle, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCancelPage() {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [isRetrying, setIsRetrying] = useState(false);

  // Récupérer le slug du coach et la reservation depuis l'URL
  const coachSlug = searchParams.get('coachSlug');
  const reservationId = searchParams.get('reservationId');

  const handleRetryPayment = async () => {
    if (!reservationId) {
      // Pas de reservationId, rediriger vers les sessions
      router.push(`/${locale}/player/sessions`);
      return;
    }

    setIsRetrying(true);

    try {
      // Récupérer les infos de la réservation pour recréer la session Stripe
      const response = await fetch(`/api/reservations/${reservationId}/details`);

      if (!response.ok) {
        throw new Error('Réservation introuvable ou expirée');
      }

      const reservation = await response.json();

      // Recréer la session Stripe
      const stripeResponse = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservation.id,
          coachId: reservation.coachId,
          coachName: `${reservation.coach.firstName} ${reservation.coach.lastName}`,
          playerEmail: reservation.player.email,
          type: reservation.type,
          locale,
        }),
      });

      if (!stripeResponse.ok) {
        throw new Error('Erreur lors de la création de la session de paiement');
      }

      const { url } = await stripeResponse.json();

      if (url) {
        // Rediriger vers Stripe Checkout
        window.location.href = url;
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (error) {
      console.error('Erreur lors de la reprise du paiement:', error);
      alert('Impossible de reprendre le paiement. Votre réservation a peut-être expiré.');
      router.push(`/${locale}/player/sessions`);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-4">
              <XCircle className="h-16 w-16 text-orange-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Paiement annulé
          </CardTitle>
          <CardDescription className="text-base">
            Votre paiement a été annulé. Aucun montant n&apos;a été débité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Que s&apos;est-il passé ?</strong>
              <br />
              Vous avez annulé le processus de paiement. Votre réservation est toujours en attente mais ne sera pas confirmée sans paiement.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Créneau réservé temporairement
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Votre créneau horaire est bloqué pendant <strong>15 minutes</strong>. Passé ce délai, il sera automatiquement libéré et pourra être réservé par un autre joueur.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Redirection...' : 'Réessayer le paiement'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (coachSlug) {
                  router.push(`/${locale}/coach/${coachSlug}`);
                } else {
                  router.push(`/${locale}/explore`);
                }
              }}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {coachSlug ? 'Retour au profil du coach' : 'Retour à l\'accueil'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
