'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { CheckCircle, Loader2, ArrowRight, ExternalLink, CalendarDays, Clock, MessageSquare, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LiteSuccessSummary {
  reservationId: string;
  priceCents: number;
  coachFirstName: string;
  coachLastName: string;
  announcementTitle: string;
  durationMinutes: number;
  startDate: string;
  endDate: string;
  discordChannelId: string | null;
}

export default function LiteBookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<LiteSuccessSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reservationId = searchParams.get('reservation_id');
  const discordInviteUrl = process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/2f3tJdJ3Q2';
  const discordGuildId = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID;

  useEffect(() => {
    const fetchSummary = async () => {
      if (!reservationId) {
        setError('Aucune réservation trouvée.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/reservations/summary?reservation_id=${reservationId}`);
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
      console.error('Erreur récupération summary LITE:', err);
      setError('Erreur inattendue.');
      setIsLoading(false);
    });
  }, [reservationId]);

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

  const discordChannelUrl = summary?.discordChannelId && discordGuildId
    ? `https://discord.com/channels/${discordGuildId}/${summary.discordChannelId}`
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Vérification de la réservation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900">Réservation enregistrée</CardTitle>
            <CardDescription className="text-base">
              Votre réservation est confirmée, mais nous n&apos;avons pas pu récupérer tous les détails.
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
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Réservation réussie !
          </CardTitle>
          <CardDescription className="text-base">
            Votre session a été réservée avec succès.
            {coachFullName ? (
              <span className="block mt-1 text-sm text-gray-700">
                Coach : <strong>{coachFullName}</strong>
              </span>
            ) : null}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {summary && (
            <div className="space-y-3 bg-white border border-blue-100 rounded-lg p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-blue-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">Détails de la session</p>
                  <div className="mt-2 space-y-1">
                    {summary.announcementTitle && (
                      <p className="text-sm text-gray-700">
                        <strong>Offre :</strong> {summary.announcementTitle}
                      </p>
                    )}
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">Plan LITE</Badge>
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
                  Montant : <span className="text-blue-600">{formatAmount(summary.priceCents)}</span>
                </p>
              </div>
            </div>
          )}

          {/* Section Paiement LITE */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Paiement - Plan LITE
                </p>
                <p className="text-sm text-amber-800 mt-1">
                  Le coach va vous communiquer son lien de paiement directement sur Discord.
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  ⚠️ Le paiement s&apos;effectue directement entre vous et le coach. Edgemy n&apos;est pas impliqué dans cette transaction.
                </p>
              </div>
            </div>
          </div>

          {/* Section Discord */}
          <div className="bg-[#5865F2]/10 border border-[#5865F2]/30 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-5 w-5 text-[#5865F2] mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Canal Discord créé
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  Un canal privé a été créé pour communiquer avec votre coach. Rejoignez-le pour finaliser les détails de votre session.
                </p>
                <div className="flex flex-col gap-2 mt-3">
                  {discordChannelUrl && (
                    <Button
                      asChild
                      className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
                    >
                      <a href={discordChannelUrl} target="_blank" rel="noopener noreferrer">
                        Ouvrir le canal Discord
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  )}
                  <Button
                    asChild
                    variant="outline"
                    className="border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/10"
                  >
                    <a href={discordInviteUrl} target="_blank" rel="noopener noreferrer">
                      Rejoindre le serveur Edgemy
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => router.push(`/${locale}/player/sessions`)}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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

          {reservationId && (
            <p className="text-xs text-gray-500 text-center mt-4">
              ID de réservation : {reservationId}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
