'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoachSummary } from './CoachSummary';
import { SessionSelector } from './SessionSelector';
import { BookingTypeSelector } from './BookingTypeSelector';
import { PricingSummary } from './PricingSummary';
import { redirectToCheckoutUrl } from '@/lib/stripe-client';

interface Coach {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  timezone: string | null;
  user: {
    image: string | null;
  } | null;
}

interface AnnouncementPack {
  id: string;
  hours: number;
  totalPrice: number;
  discountPercent: number | null;
  isActive: boolean;
}

interface Announcement {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  durationMin: number;
  packs: AnnouncementPack[];
}

interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
}

export function BookingPageClient({
  coach,
  announcement,
  initialPackId,
}: {
  coach: Coach;
  announcement: Announcement;
  initialPackId?: string;
}) {
  const router = useRouter();
  const locale = useLocale();
  const { data: session } = useSession();

  const [bookingType, setBookingType] = useState<'single' | 'pack'>(initialPackId ? 'pack' : 'single');
  const [selectedPackId, setSelectedPackId] = useState<string | null>(initialPackId || null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDiscordMember, setIsDiscordMember] = useState<boolean | null>(null);
  const [checkingDiscord, setCheckingDiscord] = useState(true);

  // Vérifier l'authentification
  useEffect(() => {
    if (!session?.user) {
      router.push(`/${locale}/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [session, router, locale]);

  // Vérifier le statut Discord
  useEffect(() => {
    const checkDiscordMembership = async () => {
      try {
        const response = await fetch('/api/discord/check-member');
        if (response.ok) {
          const data = await response.json();
          setIsDiscordMember(data.isMember === true);
        } else {
          setIsDiscordMember(false);
        }
      } catch (err) {
        console.error('Erreur vérification Discord:', err);
        setIsDiscordMember(false);
      } finally {
        setCheckingDiscord(false);
      }
    };

    if (session?.user) {
      checkDiscordMembership();
    }
  }, [session]);

  const handleBooking = async () => {
    if (!selectedSlot || !session?.user) {
      setError('Veuillez sélectionner un créneau');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Créer la réservation
      const reservationResponse = await fetch('/api/reservations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          announcementId: announcement.id,
          coachId: coach.id,
          startDate: selectedSlot.start.toISOString(),
          endDate: selectedSlot.end.toISOString(),
          packageId: bookingType === 'pack' ? selectedPackId : undefined,
        }),
      });

      if (!reservationResponse.ok) {
        const errorData = await reservationResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la réservation');
      }

      const reservationData = await reservationResponse.json();

      // Si c'est un plan LITE, rediriger vers Discord
      if (reservationData.mode === 'LITE') {
        if (reservationData.discordUrl) {
          window.location.href = reservationData.discordUrl;
        } else {
          router.push(`/${locale}/player/sessions`);
        }
        return;
      }

      // Si c'est une réservation gratuite, confirmer directement et rediriger
      if (reservationData.mode === 'FREE') {
        router.push(`/${locale}/player/sessions?success=true`);
        return;
      }

      // Pour le plan PRO avec paiement, créer la session Stripe
      const stripeResponse = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservationId: reservationData.reservationId,
          coachId: coach.id,
          coachName: `${coach.firstName} ${coach.lastName}`,
          playerEmail: session.user.email,
          type: bookingType === 'pack' ? 'PACK' : 'SINGLE',
          locale,
        }),
      });

      if (!stripeResponse.ok) {
        const errorData = await stripeResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la création de la session de paiement');
      }

      const { url } = await stripeResponse.json();

      // Rediriger vers Stripe Checkout
      if (url) {
        redirectToCheckoutUrl(url);
      } else {
        throw new Error('URL de paiement manquante');
      }
    } catch (err) {
      console.error('Erreur réservation:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsProcessing(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/${locale}/coach/${coach.slug}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au profil
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Réservation de session</h1>
              <p className="text-sm text-gray-600">{announcement.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Coach Info & Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Coach Summary */}
            <CoachSummary
              coach={coach}
              announcement={announcement}
            />

            {/* Discord Membership Check */}
            {checkingDiscord ? (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
                  <span className="text-sm text-gray-600">Vérification Discord...</span>
                </div>
              </div>
            ) : !isDiscordMember ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-semibold text-red-900 mb-2">Rejoignez notre serveur Discord</h3>
                <p className="text-sm text-red-700 mb-4">
                  Pour réserver une session, vous devez d&apos;abord rejoindre notre serveur Discord.
                </p>
                <Button
                  onClick={() => router.push('/api/discord/oauth/authorize')}
                  className="bg-[#5865F2] hover:bg-[#4752C4]"
                >
                  Rejoindre Discord
                </Button>
              </div>
            ) : (
              <>
                {/* Booking Type Selector */}
                <BookingTypeSelector
                  announcement={announcement}
                  bookingType={bookingType}
                  selectedPackId={selectedPackId}
                  onBookingTypeChange={setBookingType}
                  onPackSelect={setSelectedPackId}
                />

                {/* Session Selector */}
                <SessionSelector
                  coachId={coach.id}
                  duration={announcement.durationMin}
                  selectedSlot={selectedSlot}
                  onSlotSelect={setSelectedSlot}
                />
              </>
            )}
          </div>

          {/* Right Column - Summary & Booking */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PricingSummary
                announcement={announcement}
                bookingType={bookingType}
                selectedPackId={selectedPackId}
                selectedSlot={selectedSlot}
                isProcessing={isProcessing}
                error={error}
                canBook={isDiscordMember === true && selectedSlot !== null}
                onBook={handleBooking}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
