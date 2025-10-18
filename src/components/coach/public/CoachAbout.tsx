'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, TrendingUp } from 'lucide-react';

interface CoachAboutProps {
  coach: {
    bio: string | null;
    experience: number | null;
    roi: number | null;
    stakes: string | null;
  };
}

export function CoachAbout({ coach }: CoachAboutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">À propos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bio complète */}
        {coach.bio && (
          <div>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed">
              {coach.bio}
            </p>
          </div>
        )}

        {/* Points forts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {coach.experience && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{coach.experience} ans</p>
                <p className="text-sm text-gray-600">d&apos;expérience</p>
              </div>
            </div>
          )}

          {coach.roi && (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{coach.roi}% ROI</p>
                <p className="text-sm text-gray-600">en tournois</p>
              </div>
            </div>
          )}

          {coach.stakes && (
            <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{coach.stakes}</p>
                <p className="text-sm text-gray-600">Limites jouées</p>
              </div>
            </div>
          )}
        </div>

        {/* Méthodologie */}
        <div className="pt-4 border-t">
          <h3 className="text-lg font-semibold mb-3">Ma méthodologie</h3>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Analyse détaillée de vos mains et sessions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Travail sur les leaks et optimisation de votre jeu</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Stratégies adaptées à votre niveau et vos objectifs</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">✓</span>
              <span>Suivi personnalisé entre les sessions</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
