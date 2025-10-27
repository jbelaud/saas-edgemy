'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function CoachWhyMe() {
  const features = [
    {
      icon: '🎯',
      title: 'Approche personnalisée',
      description: 'Chaque session est adaptée à votre niveau et vos objectifs spécifiques'
    },
    {
      icon: '⚡',
      title: 'Résultats rapides',
      description: 'Méthode éprouvée pour progresser rapidement et efficacement'
    },
    {
      icon: '📚',
      title: 'Ressources complètes',
      description: 'Accès aux replays, notes de session et matériel pédagogique'
    },
    {
      icon: '👥',
      title: 'Communauté active',
      description: 'Rejoignez un groupe d\'élèves motivés et échangez vos expériences'
    }
  ];

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-3xl font-bold">Pourquoi réserver avec moi ?</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all hover:scale-105"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
