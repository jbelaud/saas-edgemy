'use client';

import { CreditCard, MessageSquare, CheckCircle } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: CreditCard,
      title: 'Paiement sécurisé',
      description: 'Via Stripe'
    },
    {
      icon: MessageSquare,
      title: 'Coaching via Discord',
      description: 'Sessions et replays'
    },
    {
      icon: CheckCircle,
      title: 'Satisfaction garantie',
      description: 'Remboursement possible'
    }
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200 shadow-xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {badges.map((badge, index) => {
          const Icon = badge.icon;
          
          return (
            <div
              key={index}
              className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex-shrink-0 p-2 bg-orange-100 rounded-lg">
                <Icon className="h-5 w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-gray-900 leading-tight">
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
    </div>
  );
}
