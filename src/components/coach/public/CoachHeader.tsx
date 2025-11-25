'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Star, Twitch, Youtube, Twitter, MessageCircle, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';
import { useSession } from '@/lib/auth-client';
import { useLocale } from 'next-intl';
import { POKER_FORMATS } from '@/constants/poker';

interface CoachHeaderProps {
  coach: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    bannerUrl: string | null;
    status: string;
    subscriptionStatus: string | null;
    subscriptionPlan: string | null;
    experience: number | null;
    roi: number | null;
    formats: string[];
    badges: string[];
    twitchUrl: string | null;
    youtubeUrl: string | null;
    twitterUrl: string | null;
    discordUrl: string | null;
    user: {
      name: string | null;
      image: string | null;
    } | null;
  };
  reviewStats?: {
    averageRating: number;
    totalReviews: number;
  };
  studentsCount?: number;
}

export function CoachHeader({ coach, reviewStats, studentsCount }: CoachHeaderProps) {
  const avatarUrl = coach.avatarUrl || coach.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(coach.firstName + ' ' + coach.lastName)}&size=200&background=f97316&color=fff&bold=true`;
  const isTopCoach = coach.badges?.includes('TOP_COACH');
  const isInactive = coach.subscriptionStatus !== 'ACTIVE';

  const [isSticky, setIsSticky] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const { alertState, confirmState, showError, showSuccess, showConfirm, closeAlert, closeConfirm } = useAlertDialog();
  const { data: session } = useSession();
  const locale = useLocale();

  // Utiliser les vraies données ou valeurs par défaut
  const rating = reviewStats?.averageRating || 0;
  const reviewsCount = reviewStats?.totalReviews || 0;

  const handleDiscordContact = () => {
    if (coach.discordUrl) {
      window.open(coach.discordUrl, '_blank');
    } else {
      showError(
        'Discord non configuré',
        `Le coach ${coach.firstName} n'a pas encore configuré son compte Discord. Vous pouvez réserver une session directement via les offres ci-dessous.`
      );
    }
  };

  const handleNotifyCoach = async () => {
    // Vérifier si le joueur est connecté
    if (!session?.user) {
      showConfirm(
        'Connexion requise',
        'Pour prévenir ce coach, tu dois d\'abord te connecter ou créer un compte.',
        () => {
          window.location.href = `/${locale}/?auth=signin&redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      );
      return;
    }

    setIsNotifying(true);
    try {
      const response = await fetch('/api/coach/notify-inactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coachId: coach.id }),
      });

      const data = await response.json();

      if (response.ok) {
        const successMessage = data.isFollowUp
          ? `✅ Relance envoyée ! ${coach.firstName} a été notifié de ton intérêt renouvelé.\n\n💡 Tu pourras le relancer à nouveau dans 7 jours si aucune réponse.`
          : `✅ ${coach.firstName} a été notifié de ton intérêt ! Il te recontactera dès que possible.\n\n💡 Tu pourras le relancer dans 7 jours si aucune réponse.`;

        showSuccess(
          'Notification envoyée',
          successMessage
        );
      } else if (response.status === 429) {
        // Cooldown period - notification too recent
        const { daysSinceLastNotification, daysRemaining } = data;
        showError(
          'Notification déjà envoyée',
          `⏰ Tu as déjà contacté ce coach il y a ${daysSinceLastNotification} jour(s).\n\nTu pourras le relancer dans ${daysRemaining} jour(s) si aucune réponse.`
        );
      } else {
        throw new Error(data.error || 'Erreur lors de l\'envoi de la notification');
      }
    } catch {
      showError(
        'Erreur',
        'Impossible d\'envoyer la notification pour le moment. Réessaie plus tard.'
      );
    } finally {
      setIsNotifying(false);
    }
  };

  const scrollToOffers = () => {
    const offersSection = document.getElementById('offers');
    if (offersSection) {
      offersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Hero Section avec bannière OU fond bleu */}
      <div className="relative overflow-hidden">
        {/* Bannière en arrière-plan (si présente) */}
        {coach.bannerUrl ? (
          <>
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={coach.bannerUrl}
                alt={`Bannière de ${coach.firstName} ${coach.lastName}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority
                quality={85}
              />
            </div>
            {/* Overlay gradient pour meilleure lisibilité avec la bannière */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
          </>
        ) : (
          <>
            {/* Fond bleu avec pattern (par défaut sans bannière) */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" />
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }} />
            </div>
          </>
        )}

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                <Image
                  src={avatarUrl}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 10rem, 8rem"
                  unoptimized={true}
                />
              </div>
              {isTopCoach && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg whitespace-nowrap">
                  ⭐ Top Coach
                </div>
              )}
            </div>

            {/* Info principale */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-3 mb-3">
                <h1 className="text-4xl md:text-5xl font-bold text-white">
                  {coach.firstName} {coach.lastName}
                </h1>

                {/* Badge statut inactif */}
                {coach.subscriptionStatus !== 'ACTIVE' && (
                  <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 rounded-full px-4 py-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-300 text-sm font-semibold">
                      Compte inactif
                    </span>
                  </div>
                )}
              </div>

              {/* Formats */}
              {coach.formats && coach.formats.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  {coach.formats.map((format) => {
                    const formatOption = POKER_FORMATS.find((f) => f.value === format);
                    const label = formatOption?.label || format;
                    return (
                      <Badge key={format} className="bg-orange-500/20 text-orange-200 border-orange-400/30 hover:bg-orange-500/30">
                        {label}
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Rating - afficher seulement si on a des avis */}
              {reviewsCount > 0 && (
                <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= Math.floor(rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : star - 0.5 <= rating
                            ? 'fill-yellow-400/50 text-yellow-400'
                            : 'text-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-semibold text-lg">{rating.toFixed(1)}</span>
                  <span className="text-gray-300">({reviewsCount} {reviewsCount === 1 ? 'avis' : 'avis'})</span>
                </div>
              )}

              {/* Stats badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                {coach.experience && (
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-2xl font-bold text-white">{coach.experience}</div>
                    <div className="text-xs text-gray-300">ans d&apos;expérience</div>
                  </div>
                )}
                {studentsCount !== undefined && studentsCount > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-2xl font-bold text-white">{studentsCount}</div>
                    <div className="text-xs text-gray-300">{studentsCount === 1 ? 'élève' : 'élèves'}</div>
                  </div>
                )}
                {coach.roi && (
                  <div className="bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-emerald-400/30">
                    <div className="text-2xl font-bold text-emerald-200">{coach.roi}%</div>
                    <div className="text-xs text-emerald-300">ROI</div>
                  </div>
                )}
              </div>

              {/* CTAs */}
              {isInactive ? (
                <div className="space-y-4">
                  <div className="bg-amber-500/20 border border-amber-500/40 rounded-lg p-4">
                    <p className="text-amber-200 text-sm mb-3">
                      🔔 Ce coach n&apos;est pas disponible actuellement. Tu peux le notifier de ton intérêt et il te recontactera dès son retour !
                    </p>
                    <Button
                      size="lg"
                      onClick={handleNotifyCoach}
                      disabled={isNotifying}
                      className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
                    >
                      <Bell className="mr-2 h-5 w-5" />
                      {isNotifying ? 'Envoi en cours...' : 'Prévenir ce coach'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3">
                  <Button
                    size="lg"
                    onClick={scrollToOffers}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto"
                  >
                    Réserver une session
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleDiscordContact}
                    className="border-2 border-white bg-white/90 text-blue-600 hover:bg-white hover:text-blue-700 px-8 py-6 text-lg font-semibold w-full sm:w-auto"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Message Discord
                  </Button>
                </div>
              )}

              {/* Social links */}
              {(coach.twitchUrl || coach.youtubeUrl || coach.twitterUrl) && (
                <div className="flex items-center justify-center md:justify-start gap-3 mt-6">
                  {coach.twitchUrl && (
                    <a
                      href={coach.twitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all"
                    >
                      <Twitch className="h-5 w-5 text-purple-300" />
                    </a>
                  )}
                  {coach.youtubeUrl && (
                    <a
                      href={coach.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all"
                    >
                      <Youtube className="h-5 w-5 text-red-300" />
                    </a>
                  )}
                  {coach.twitterUrl && (
                    <a
                      href={coach.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-all"
                    >
                      <Twitter className="h-5 w-5 text-blue-300" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky CTA */}
      {isSticky && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 py-4 px-6 animate-in slide-in-from-bottom">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full ring-2 ring-orange-500 overflow-hidden">
                <Image
                  src={avatarUrl}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                  unoptimized
                />
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {coach.firstName} {coach.lastName}
                </p>
                {reviewsCount > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-gray-600">{rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <Button
              size="lg"
              onClick={scrollToOffers}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold shadow-lg"
            >
              Réserver maintenant
            </Button>
          </div>
        </div>
      )}

      {/* Modal d'erreur */}
      <AlertDialogCustom
        open={alertState.open}
        onOpenChange={closeAlert}
        title={alertState.title}
        description={alertState.description}
        type={alertState.type}
      />

      {/* Modal de confirmation */}
      <AlertDialogCustom
        open={confirmState.open}
        onOpenChange={closeConfirm}
        title={confirmState.title}
        description={confirmState.description}
        type="warning"
        confirmText="Se connecter"
        cancelText="Annuler"
        onConfirm={confirmState.onConfirm}
        showCancel={true}
      />
    </>
  );
}
