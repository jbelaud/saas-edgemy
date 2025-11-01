'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentCancelPage() {
  const router = useRouter();
  const locale = useLocale();

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
            Votre paiement a été annulé. Aucun montant n'a été débité.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>ℹ️ Que s'est-il passé ?</strong>
              <br />
              Vous avez annulé le processus de paiement. Votre réservation est toujours en attente mais ne sera pas confirmée sans paiement.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-900">
              <strong>⚠️ Important</strong>
              <br />
              Votre créneau horaire sera automatiquement annulé si le paiement n'est pas effectué dans les prochaines heures.
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => router.push(`/${locale}/player/sessions`)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Réessayer le paiement
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/explore`)}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à l'accueil
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
