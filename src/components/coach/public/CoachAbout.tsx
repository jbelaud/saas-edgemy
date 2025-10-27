'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CoachAboutProps {
  coach: {
    bio: string | null;
    methodology: string | null;
  };
}

export function CoachAbout({ coach }: CoachAboutProps) {
  if (!coach.bio && !coach.methodology) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* À propos */}
      {coach.bio && (
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
      )}

      {/* Méthodologie */}
      {coach.methodology && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Ma méthodologie de coaching</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
              {coach.methodology}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
