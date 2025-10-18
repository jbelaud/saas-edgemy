'use client';

import Image from 'next/image';
import { Star, MapPin, Award, Twitch, Youtube, Twitter, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CoachHeaderProps {
  coach: {
    firstName: string;
    lastName: string;
    bio: string | null;
    avatarUrl: string | null;
    bannerUrl: string | null;
    stakes: string | null;
    status: string;
    twitchUrl: string | null;
    youtubeUrl: string | null;
    twitterUrl: string | null;
    user: {
      name: string | null;
      image: string | null;
    } | null;
  };
}

export function CoachHeader({ coach }: CoachHeaderProps) {
  const displayName = `${coach.firstName} ${coach.lastName}`;
  const avatarUrl = coach.avatarUrl || coach.user?.image || '/default-avatar.png';
  const bannerUrl = coach.bannerUrl || '/default-banner.jpg';
  const isInactive = coach.status === 'INACTIVE';

  return (
    <div className="relative">
      {/* Badge statut inactif */}
      {isInactive && (
        <div className="absolute top-4 right-4 z-10 bg-amber-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-semibold">Temporairement indisponible</span>
        </div>
      )}

      {/* Bannière */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-600 to-purple-600">
        {bannerUrl && bannerUrl !== '/default-banner.jpg' ? (
          <Image
            src={bannerUrl}
            alt={`Bannière de ${displayName}`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>

      {/* Infos coach */}
      <div className="container mx-auto px-6">
        <div className="relative -mt-20 md:-mt-24">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Infos */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {displayName}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      {coach.stakes && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{coach.stakes}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">4.9</span>
                        <span className="text-sm text-gray-500">(127 avis)</span>
                      </div>
                    </div>
                    {coach.bio && (
                      <p className="text-gray-700 max-w-3xl line-clamp-3">
                        {coach.bio}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="flex flex-col gap-3">
                    <Button size="lg" className="whitespace-nowrap">
                      Réserver une session
                    </Button>
                    
                    {/* Réseaux sociaux */}
                    <div className="flex gap-2 justify-center md:justify-start">
                      {coach.twitchUrl && (
                        <a
                          href={coach.twitchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition"
                        >
                          <Twitch className="h-5 w-5" />
                        </a>
                      )}
                      {coach.youtubeUrl && (
                        <a
                          href={coach.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition"
                        >
                          <Youtube className="h-5 w-5" />
                        </a>
                      )}
                      {coach.twitterUrl && (
                        <a
                          href={coach.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
