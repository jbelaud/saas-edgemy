'use client';

import { Button } from '@/components/ui/button';
import { Star, Twitch, Youtube, Twitter, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface CoachHeaderProps {
  coach: {
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    status: string;
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
}

export function CoachHeader({ coach }: CoachHeaderProps) {
  const avatarUrl = coach.avatarUrl || coach.user?.image || '/default-avatar.png';
  const isTopCoach = coach.badges?.includes('TOP_COACH');
  
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  
  const rating = 4.9; // Mock - à remplacer par vraies données
  const reviewsCount = 127; // Mock
  const studentsCount = 45; // Mock

  const handleNotifyCoach = async () => {
    if (!notifyEmail) return;
    
    setIsNotifying(true);
    // TODO: Implémenter l'API pour notifier le coach
    console.log('Notify coach about interested player:', { 
      coachId: coach.firstName, 
      playerEmail: notifyEmail 
    });
    
    setTimeout(() => {
      setIsNotifying(false);
      setNotificationSent(true);
      setNotifyEmail('');
    }, 1000);
  };

  const handleDiscordContact = () => {
    if (coach.discordUrl) {
      window.open(coach.discordUrl, '_blank');
    } else {
      alert('Discord non configuré pour ce coach');
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Poker pattern background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="container mx-auto px-6 py-16 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
                <img
                  src={avatarUrl}
                  alt={`${coach.firstName} ${coach.lastName}`}
                  className="w-full h-full object-cover"
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
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                {coach.firstName} {coach.lastName}
              </h1>
              
              {/* Formats */}
              {coach.formats && coach.formats.length > 0 && (
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-4">
                  {coach.formats.map((format) => (
                    <Badge key={format} className="bg-orange-500/20 text-orange-200 border-orange-400/30 hover:bg-orange-500/30">
                      {format}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Rating */}
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
                <span className="text-white font-semibold text-lg">{rating}</span>
                <span className="text-gray-300">({reviewsCount} avis)</span>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                {coach.experience && (
                  <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <div className="text-2xl font-bold text-white">{coach.experience}</div>
                    <div className="text-xs text-gray-300">ans d&apos;expérience</div>
                  </div>
                )}
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <div className="text-2xl font-bold text-white">{studentsCount}</div>
                  <div className="text-xs text-gray-300">élèves</div>
                </div>
                {coach.roi && (
                  <div className="bg-emerald-500/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-emerald-400/30">
                    <div className="text-2xl font-bold text-emerald-200">{coach.roi}%</div>
                    <div className="text-xs text-emerald-300">ROI</div>
                  </div>
                )}
              </div>

              {/* CTAs */}
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
              <img
                src={avatarUrl}
                alt={`${coach.firstName} ${coach.lastName}`}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-orange-500"
              />
              <div>
                <p className="font-bold text-gray-900">
                  {coach.firstName} {coach.lastName}
                </p>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600">{rating}</span>
                </div>
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
    </>
  );
}
