'use client';

import { useMemo } from 'react';
import { Receipt, AlertCircle, Loader2, CheckCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateForSession, calculateForPack } from '@/lib/stripe/pricing';
import Link from 'next/link';

interface AnnouncementPack {
  id: string;
  hours: number;
  totalPrice: number;
}

interface Announcement {
  priceCents: number;
  durationMin: number;
  packs: AnnouncementPack[];
}

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
}

interface PricingSummaryProps {
  announcement: Announcement;
  bookingType: 'single' | 'pack';
  selectedPackId: string | null;
  selectedSlot: TimeSlot | null;
  isProcessing: boolean;
  error: string | null;
  canBook: boolean;
  onBook: () => void;
}

export function PricingSummary({
  announcement,
  bookingType,
  selectedPackId,
  selectedSlot,
  isProcessing,
  error,
  canBook,
  onBook,
}: PricingSummaryProps) {
  // Vérifier si c'est une annonce gratuite
  const isFree = announcement.priceCents === 0;

  const pricing = useMemo(() => {
    // Validation: priceCents doit être défini (peut être 0)
    if (announcement.priceCents === undefined || announcement.priceCents === null) {
      return null;
    }

    // Si l'annonce est gratuite, retourner un objet de pricing spécial
    if (announcement.priceCents === 0) {
      return {
        coachNetCents: 0,
        serviceFeeCents: 0,
        totalCustomerCents: 0,
        currency: 'eur',
        isFree: true,
      };
    }

    if (bookingType === 'single') {
      return calculateForSession(announcement.priceCents);
    }

    if (bookingType === 'pack' && selectedPackId) {
      const pack = announcement.packs.find(p => p.id === selectedPackId);
      if (pack) {
        return calculateForPack(pack.totalPrice, pack.hours);
      }
    }

    return null;
  }, [bookingType, selectedPackId, announcement]);

  const selectedPack = bookingType === 'pack' && selectedPackId
    ? announcement.packs.find(p => p.id === selectedPackId)
    : null;

  if (!pricing) {
    const hasInvalidPrice = announcement.priceCents === undefined || announcement.priceCents === null;

    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Récapitulatif</h3>
        </div>
        {hasInvalidPrice ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">
                Cette annonce n&apos;a pas de prix configuré. Veuillez contacter le coach.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Sélectionnez une option de réservation</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6">
        <div className="flex items-center gap-2 text-white mb-2">
          <Receipt className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Récapitulatif</h3>
        </div>
        <p className="text-amber-100 text-sm">
          {bookingType === 'single' ? 'Session unique' : `Pack ${selectedPack?.hours}h`}
        </p>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Price Breakdown */}
        {isFree ? (
          <div className="space-y-3">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold text-green-900">Session gratuite</h4>
              </div>
              <p className="text-sm text-green-700 mt-2">
                Cette session ne nécessite aucun paiement. Vous pourrez réserver directement.
              </p>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total à payer</span>
                <span className="text-2xl font-bold text-green-600">Gratuit</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Prix coach</span>
              <span className="font-semibold text-gray-900">
                {(pricing.coachNetCents / 100).toFixed(2)}€
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Frais de service (6.5%)</span>
              <span className="font-semibold text-gray-900">
                {(pricing.serviceFeeCents / 100).toFixed(2)}€
              </span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-900">Total à payer</span>
                <span className="text-2xl font-bold text-amber-600">
                  {(pricing.totalCustomerCents / 100).toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        )}

        {bookingType === 'pack' && 'sessionsCount' in pricing && !isFree && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
            <p className="text-xs text-blue-900">
              <strong>{pricing.sessionsCount} sessions</strong> incluses
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Soit {((pricing.coachNetCents / pricing.sessionsCount) / 100).toFixed(2)}€ par session
            </p>
          </div>
        )}

        {/* Selected Slot Info */}
        {selectedSlot && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-green-900">Créneau sélectionné</p>
                <p className="text-xs text-green-700 mt-1">
                  {selectedSlot.start.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </p>
                <p className="text-xs text-green-700">
                  {selectedSlot.start.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} - {selectedSlot.end.toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Book Button */}
        <Button
          onClick={onBook}
          disabled={!canBook || isProcessing}
          className={`w-full font-semibold py-6 text-base ${
            isFree
              ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
          } text-white`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Traitement en cours...
            </>
          ) : isFree ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Confirmer la réservation
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Confirmer et payer
            </>
          )}
        </Button>

        {/* Payment Info */}
        {!isFree && (
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Paiement sécurisé par Stripe
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Vos données bancaires sont protégées
            </p>
          </div>
        )}

        {/* Terms */}
        <div className="border-t pt-4">
          <p className="text-xs text-gray-500">
            En confirmant, vous acceptez les{' '}
            <Link href="/terms" className="text-amber-600 hover:underline">
              conditions générales
            </Link>{' '}
            et la{' '}
            <Link href="/privacy" className="text-amber-600 hover:underline">
              politique de confidentialité
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
