'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Shield, CreditCard, Video, CheckCircle } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: 'Vérifié par Edgemy',
      description: 'Coach certifié et vérifié',
      color: 'emerald'
    },
    {
      icon: CreditCard,
      title: 'Paiement sécurisé',
      description: 'Via Stripe',
      color: 'blue'
    },
    {
      icon: Video,
      title: 'Replay disponible',
      description: 'Après chaque session',
      color: 'purple'
    },
    {
      icon: CheckCircle,
      title: 'Satisfaction garantie',
      description: 'Remboursement si insatisfait',
      color: 'orange'
    }
  ];

  const colorClasses: Record<string, { bg: string; icon: string; text: string }> = {
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', text: 'text-emerald-900' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', text: 'text-blue-900' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', text: 'text-purple-900' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', text: 'text-orange-900' }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            const colors = colorClasses[badge.color];
            
            return (
              <div
                key={index}
                className={`flex items-center gap-3 p-4 ${colors.bg} rounded-xl border-2 border-transparent hover:border-gray-200 transition-all`}
              >
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <div className="min-w-0">
                  <p className={`font-bold text-sm ${colors.text} leading-tight`}>
                    {badge.title}
                  </p>
                  <p className="text-xs text-gray-600 leading-tight mt-0.5">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
