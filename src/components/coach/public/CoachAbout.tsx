'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Target, TrendingUp, Brain, LineChart, Users, Video, MessageSquare, CheckCircle2 } from 'lucide-react';

interface CoachAboutProps {
  coach: {
    bio: string | null;
    experience: number | null;
    roi: number | null;
    stakes: string | null;
  };
}

export function CoachAbout({ coach }: CoachAboutProps) {
  const methodologyItems = [
    {
      icon: LineChart,
      title: 'Analyse de leaks',
      description: 'Identification précise de vos erreurs et axes d\'amélioration',
      color: 'blue'
    },
    {
      icon: Brain,
      title: 'Stratégie GTO',
      description: 'Apprentissage des concepts théoriques et leur application',
      color: 'purple'
    },
    {
      icon: Video,
      title: 'Review de sessions',
      description: 'Analyse détaillée de vos mains et décisions en temps réel',
      color: 'emerald'
    },
    {
      icon: Target,
      title: 'Objectifs personnalisés',
      description: 'Plan d\'action adapté à votre niveau et vos ambitions',
      color: 'orange'
    },
    {
      icon: MessageSquare,
      title: 'Suivi continu',
      description: 'Support entre les sessions pour maintenir votre progression',
      color: 'pink'
    },
    {
      icon: Users,
      title: 'Approche pédagogique',
      description: 'Méthode d\'enseignement claire et progressive',
      color: 'indigo'
    }
  ];

  const colorClasses: Record<string, { bg: string; icon: string; border: string }> = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-200' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', border: 'border-orange-200' },
    pink: { bg: 'bg-pink-50', icon: 'text-pink-600', border: 'border-pink-200' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', border: 'border-indigo-200' }
  };

  return (
    <div className="space-y-8">
      {/* À propos */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">À propos de moi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bio complète */}
          {coach.bio && (
            <div>
              <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                {coach.bio}
              </p>
            </div>
          )}

          {/* Points forts - Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            {coach.experience && (
              <div className="group relative overflow-hidden rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 transition-all hover:shadow-lg hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500 rounded-xl shadow-md">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{coach.experience}</p>
                    <p className="text-sm font-medium text-gray-600">ans d&apos;expérience</p>
                  </div>
                </div>
              </div>
            )}

            {coach.roi && (
              <div className="group relative overflow-hidden rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-6 transition-all hover:shadow-lg hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500 rounded-xl shadow-md">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{coach.roi}%</p>
                    <p className="text-sm font-medium text-gray-600">ROI moyen</p>
                  </div>
                </div>
              </div>
            )}

            {coach.stakes && (
              <div className="group relative overflow-hidden rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6 transition-all hover:shadow-lg hover:scale-105">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-500 rounded-xl shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{coach.stakes}</p>
                    <p className="text-sm font-medium text-gray-600">Limites jouées</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Méthodologie de coaching */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Ma méthodologie de coaching</CardTitle>
          <p className="text-gray-600 mt-2">Une approche structurée pour maximiser votre progression</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {methodologyItems.map((item, index) => {
              const Icon = item.icon;
              const colors = colorClasses[item.color];
              return (
                <div
                  key={index}
                  className={`group relative rounded-xl border-2 ${colors.border} ${colors.bg} p-6 transition-all hover:shadow-lg hover:scale-105 cursor-default`}
                >
                  <div className="flex flex-col gap-3">
                    <div className={`w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${colors.icon}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 className={`h-5 w-5 ${colors.icon}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
