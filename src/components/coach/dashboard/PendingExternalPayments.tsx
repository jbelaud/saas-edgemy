'use client';

import { useEffect, useState } from 'react';
import { fetchWithCsrf } from '@/lib/security/csrf-client';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertTriangle, CheckCircle, Clock, Calendar, Loader2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PendingReservation {
  id: string;
  startDate: string;
  endDate: string;
  priceCents: number;
  paymentStatus: string;
  status: string;
  player: {
    name: string | null;
    email: string | null;
    image: string | null;
  };
  announcement: {
    title: string;
  };
  discordChannelId: string | null;
}

export function PendingExternalPayments() {
  const [pendingReservations, setPendingReservations] = useState<PendingReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingReservations();
  }, []);

  const fetchPendingReservations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/coach/reservations?paymentStatus=EXTERNAL_PENDING');
      if (response.ok) {
        const data = await response.json();
        setPendingReservations(data.reservations || []);
      }
    } catch (error) {
      console.error('Erreur chargement réservations en attente:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPayment = async (reservationId: string) => {
    if (!confirm('Confirmer que vous avez bien reçu le paiement de ce joueur ?')) {
      return;
    }

    try {
      setConfirmingId(reservationId);
      const response = await fetchWithCsrf(`/api/reservations/${reservationId}/confirm-external-payment`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de la confirmation');
      }

      // Retirer la réservation de la liste
      setPendingReservations(prev => prev.filter(r => r.id !== reservationId));
      alert('Paiement confirmé avec succès !');
    } catch (error) {
      console.error('Erreur confirmation paiement:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setConfirmingId(null);
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      </GlassCard>
    );
  }

  if (pendingReservations.length === 0) {
    return (
      <GlassCard className="p-6">
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">Aucun paiement en attente</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Paiements en attente - Plan Lite
        </h2>
        <Badge variant="outline" className="bg-orange-50 border-orange-200 text-orange-700">
          {pendingReservations.length} {pendingReservations.length > 1 ? 'paiements' : 'paiement'}
        </Badge>
      </div>

      <div className="grid gap-4">
        {pendingReservations.map((reservation) => (
          <GlassCard key={reservation.id} className="p-6">
            <div className="flex items-start gap-4">
              {/* Avatar du joueur */}
              <Avatar className="h-14 w-14">
                <AvatarImage src={reservation.player.image || undefined} />
                <AvatarFallback>
                  {reservation.player.name?.charAt(0) || 'J'}
                </AvatarFallback>
              </Avatar>

              {/* Infos de la réservation */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {reservation.player.name || 'Joueur'}
                    </h3>
                    <p className="text-sm text-gray-600">{reservation.player.email}</p>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    En attente
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm font-medium text-gray-900">
                    {reservation.announcement.title}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(reservation.startDate), 'PPP', { locale: fr })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(reservation.startDate), 'HH:mm', { locale: fr })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-green-600" />
                    <span className="font-semibold text-green-700">
                      {(reservation.priceCents / 100).toFixed(2)}€
                    </span>
                  </div>
                </div>

                {/* Lien Discord */}
                {reservation.discordChannelId && (
                  <div className="mb-4">
                    <a
                      href={`https://discord.com/channels/${process.env.NEXT_PUBLIC_DISCORD_GUILD_ID}/${reservation.discordChannelId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline"
                    >
                      📱 Voir la conversation Discord
                    </a>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleConfirmPayment(reservation.id)}
                    disabled={confirmingId === reservation.id}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {confirmingId === reservation.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Confirmation...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirmer le paiement
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Note d'avertissement */}
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                <strong>Note :</strong> Ne confirmez le paiement que si vous avez effectivement reçu
                l&apos;argent du joueur via le moyen de paiement convenu (USDT, Wise, Revolut, etc.).
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
