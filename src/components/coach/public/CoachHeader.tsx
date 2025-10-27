'use client';

import Image from 'next/image';
import { Star, Award, Twitch, Youtube, Twitter, AlertCircle, Bell, MessageCircle, Calendar, TrendingUp, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface CoachHeaderProps {
  coach: {
    firstName: string;
    lastName: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    stakes: string | null;
    status: string;
    experience: number | null;
    roi: number | null;
    formats: string[];
    badges: string[];
    twitchUrl: string | null;
    youtubeUrl: string | null;
    twitterUrl: string | null;
    announcements: unknown[];
    user: {
      name: string | null;
      image: string | null;
    } | null;
  };
}

export function CoachHeader({ coach }: CoachHeaderProps) {
  const displayName = `${coach.firstName} ${coach.lastName}`;
  const avatarUrl = coach.avatarUrl || coach.user?.image || '/default-avatar.png';
  const isInactive = coach.status === 'INACTIVE';
  
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [notificationSent, setNotificationSent] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  
  // Mock data - à remplacer par de vraies données
  const rating = 4.9;
  const reviewsCount = 127;
  const studentsCount = 89;

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
  
  // Sticky CTA on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToBooking = () => {
    const bookingSection = document.getElementById('coaching-offers');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
        {/* Pattern de fond poker */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>
        
        {/* Badge statut inactif */}
        {isInactive && (
          <div className="absolute top-6 right-6 z-10 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-semibold">Temporairement indisponible</span>
          </div>
        )}
        
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Photo et nom */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="relative">
                <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl">
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {coach.badges && coach.badges.includes('TOP_COACH') && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-3 shadow-lg">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                )}
              </div>
              
              {/* Réseaux sociaux */}
              {(coach.twitchUrl || coach.youtubeUrl || coach.twitterUrl) && (
                <div className="flex gap-2">
                  {coach.twitchUrl && (
                    <a
                      href={coach.twitchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition"
                    >
                      <Twitch className="h-5 w-5" />
                    </a>
                  )}
                  {coach.youtubeUrl && (
                    <a
                      href={coach.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                  {coach.twitterUrl && (
                    <a
                      href={coach.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-lg bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
            
            {/* Infos principales */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3">
                {displayName}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-600 text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-white">{rating}</span>
                <span className="text-gray-300">({reviewsCount} avis)</span>
              </div>
              
              {/* Stats en badges */}
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
                {coach.experience && (
                  <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/20">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {coach.experience} ans d&apos;expérience
                  </Badge>
                )}
                {coach.roi && (
                  <Badge className="bg-emerald-500/20 backdrop-blur-sm text-emerald-300 border-emerald-500/30 px-4 py-2 text-sm font-medium hover:bg-emerald-500/30">
                    <Target className="h-4 w-4 mr-2" />
                    {coach.roi}% ROI moyen
                  </Badge>
                )}
                <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm font-medium hover:bg-white/20">
                  <Users className="h-4 w-4 mr-2" />
                  {studentsCount} élèves
                </Badge>
                {coach.formats && coach.formats.length > 0 && (
                  <Badge className="bg-blue-500/20 backdrop-blur-sm text-blue-300 border-blue-500/30 px-4 py-2 text-sm font-medium hover:bg-blue-500/30">
                    {coach.formats.slice(0, 2).join(', ')}
                    {coach.formats.length > 2 && ` +${coach.formats.length - 2}`}
                  </Badge>
                )}
              </div>
              
              {/* Bio courte */}
              {coach.bio && (
                <p className="text-gray-200 text-lg leading-relaxed max-w-3xl mb-6">
                  {coach.bio.length > 200 ? `${coach.bio.substring(0, 200)}...` : coach.bio}
                </p>
              )}
              
              {/* CTA */}
              {!isInactive ? (
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Button
                    size="lg"
                    onClick={scrollToBooking}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all"
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Réserver une session
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 font-semibold px-8 py-6 text-lg"
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Envoyer un message
                  </Button>
                </div>
              ) : (
                <div className="bg-amber-500/20 backdrop-blur-sm border border-amber-500/30 rounded-xl p-6 max-w-md mx-auto lg:mx-0">
                  {!notificationSent ? (
                    <>
                      <p className="text-amber-200 font-medium mb-2">
                        Intéressé par ce coach ?
                      </p>
                      <p className="text-amber-300/80 text-sm mb-4">
                        Notifiez-le pour qu&apos;il réactive son profil
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="Votre email"
                          value={notifyEmail}
                          onChange={(e) => setNotifyEmail(e.target.value)}
                          className="flex-1 px-4 py-2 border border-amber-400/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white/10 backdrop-blur-sm text-white placeholder:text-gray-400"
                        />
                        <Button
                          size="sm"
                          onClick={handleNotifyCoach}
                          disabled={!notifyEmail || isNotifying}
                          className="whitespace-nowrap bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          <Bell className="h-4 w-4 mr-1" />
                          {isNotifying ? 'Envoi...' : 'Notifier'}
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-green-300 font-medium">
                        ✓ Coach notifié !
                      </p>
                      <p className="text-green-400/80 text-sm mt-1">
                        Vous serez contacté s&apos;il réactive son profil
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Sticky CTA */}
      {!isInactive && (
        <div
          className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 transition-transform duration-300 ${
            isSticky ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 hidden sm:block">
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{displayName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-semibold text-gray-700">{rating}</span>
                    <span className="text-sm text-gray-500">({reviewsCount} avis)</span>
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                onClick={scrollToBooking}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Réserver
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
