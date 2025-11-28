'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle, Loader2, ArrowRight, ExternalLink, CalendarDays, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SuccessSummary {
  reservationId: string;
  totalCustomerCents: number;
  isPackage: boolean;
  sessionsCount: number | null;
  coachFirstName: string;
  coachLastName: string;
  announcementTitle: string;
  durationMinutes: number;
  startDate: string | null;
  endDate: string | null;
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<SuccessSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session_id');
  const discordInviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/2f3tJdJ3Q2';

  useEffect(() => {
    const fetchSummary = async () => {
      if (!sessionId) {
        setError('Aucune session Stripe trouvée.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/stripe/session-summary?session_id=${sessionId}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? 'Impossible de récupérer le récapitulatif.');
        }
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur inattendue.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary().catch((err) => {
      console.error('Erreur récupération summary success:', err);
      setError('Erreur inattendue.');
      setIsLoading(false);
    });
  }, [sessionId]);

  const currencyFormatter = useMemo(() => new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }), [locale]);

  const formatAmount = (value: number | null | undefined) => {
    if (value === null || value === undefined) {
      return '—';
    }
    return currencyFormatter.format(value / 100);
  };

  const coachFullName = summary ? `${summary.coachFirstName} ${summary.coachLastName}` : '';

  const formatSessionDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatSessionTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">Vérification du paiement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Paiement reçu</CardTitle>
            <CardDescription className="text-base">
              Votre paiement est confirmé, mais nous n&apos;avons pas pu récupérer tous les détails.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                <strong>🔍 Récapitulatif indisponible</strong>
                <br />
                {error}
              </p>
            </div>
            <Button
              onClick={() => router.push(`/${locale}/player/sessions`)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Voir mes sessions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Paiement réussi !
          </CardTitle>
          <CardDescription className="text-base">
            Votre session a été réservée et payée avec succès.
            {coachFullName ? (
              <span className="block mt-1 text-sm text-gray-700">
                Coach : <strong>{coachFullName}</strong>
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary && (
            <div className="space-y-3 bg-white border border-orange-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Détails de la session</p>
                  <div className="mt-2 space-y-1">
                    {summary.announcementTitle && (
                      <p className="text-sm text-gray-700">
                        <strong>Offre :</strong> {summary.announcementTitle}
                      </p>
                    )}
                    {summary.isPackage ? (
                      <div className="space-y-1">
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">Pack d&apos;heures</Badge>
                        {summary.sessionsCount && (
                          <p className="text-sm text-gray-600">
                            {summary.sessionsCount} session{summary.sessionsCount > 1 ? 's' : ''} à planifier
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">Session unique</Badge>
                        {summary.startDate && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              {formatSessionDate(summary.startDate)}
                            </p>
                            <p className="text-sm text-gray-700 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {formatSessionTime(summary.startDate)}
                              {summary.endDate && ` - ${formatSessionTime(summary.endDate)}`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {summary.durationMinutes && (
                      <p className="text-sm text-gray-600">
                        <strong>Durée :</strong> {summary.durationMinutes} minutes
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-lg font-bold text-gray-900">
                  Montant payé : <span className="text-orange-600">{formatAmount(summary.totalCustomerCents)}</span>
                </p>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>📧 Confirmation par email</strong>
              <br />
              Vous allez recevoir un email de confirmation avec tous les détails de votre session.
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900">
              <strong>💬 Canal Discord</strong>
              <br />
              Un canal privé Discord va être créé automatiquement pour communiquer avec votre coach.
            </p>
            <Button
              asChild
              className="mt-3 bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              <a href={discordInviteUrl} target="_blank" rel="noopener noreferrer">
                Rejoindre le serveur Edgemy
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => router.push(`/${locale}/player/sessions`)}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              Voir mes sessions
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/${locale}/player/dashboard`)}
              className="w-full"
            >
              Retour au dashboard
            </Button>
          </div>

          {sessionId && (
            <p className="text-xs text-gray-500 text-center mt-4">
              ID de session : {sessionId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
