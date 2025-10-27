'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CoachAboutProps {
  coach: {
    bio: string | null;
  };
}

export function CoachAbout({ coach }: CoachAboutProps) {
  if (!coach.bio) {
    return null;
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">À propos de moi</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
          {coach.bio}
        </p>
      </CardContent>
    </Card>
  );
}
