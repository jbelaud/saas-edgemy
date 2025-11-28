'use client';

import Image from 'next/image';
import { Clock, Trophy } from 'lucide-react';

interface Coach {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  user: {
    image: string | null;
  } | null;
}

interface Announcement {
  title: string;
  description: string | null;
  priceCents: number;
  durationMin: number;
}

export function CoachSummary({ coach, announcement }: { coach: Coach; announcement: Announcement }) {
  const avatarUrl = coach.avatarUrl || coach.user?.image || '/default-avatar.png';

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-amber-100">
          <Image
            src={avatarUrl}
            alt={`${coach.firstName} ${coach.lastName}`}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {coach.firstName} {coach.lastName}
            </h2>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{announcement.title}</h3>
          {announcement.description && (
            <p className="text-sm text-gray-600 mb-3">{announcement.description}</p>
          )}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600">
              <Clock className="h-4 w-4 text-amber-500" />
              <span>{announcement.durationMin} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="font-semibold text-gray-900">{(announcement.priceCents / 100).toFixed(2)}€</span>
              <span className="text-xs text-gray-500">/ session</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
