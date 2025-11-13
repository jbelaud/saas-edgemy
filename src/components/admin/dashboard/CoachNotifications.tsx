'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CoachNotification {
  id: string;
  coachId: string;
  playerId: string;
  playerEmail: string | null;
  playerName: string | null;
  isFollowUp: boolean;
  emailSent: boolean;
  discordSent: boolean;
  createdAt: Date;
  coach: {
    firstName: string;
    lastName: string;
  };
}

interface CoachNotificationsProps {
  notifications: CoachNotification[];
}

export function CoachNotifications({ notifications }: CoachNotificationsProps) {
  if (notifications.length === 0) {
    return (
      <Card className="p-6 bg-slate-800/50 border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Notifications Coachs Inactifs
          </h2>
        </div>
        <p className="text-sm text-gray-400 text-center py-8">
          Aucune notification envoyée récemment
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-slate-800/50 border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Notifications Coachs Inactifs
        </h2>
        <Badge variant="outline" className="border-amber-500/50 text-amber-300">
          {notifications.length} notification{notifications.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="flex items-start gap-3 p-4 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
          >
            <div className="flex-shrink-0 mt-1">
              {notification.isFollowUp ? (
                <RefreshCw className="w-5 h-5 text-orange-400" />
              ) : (
                <Bell className="w-5 h-5 text-blue-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-white truncate">
                  {notification.playerName || 'Joueur inconnu'}
                </p>
                {notification.isFollowUp && (
                  <Badge variant="outline" className="border-orange-500/50 text-orange-300 text-xs">
                    Relance
                  </Badge>
                )}
              </div>

              <p className="text-xs text-gray-400 mb-2">
                a contacté <span className="text-white font-medium">{notification.coach.firstName} {notification.coach.lastName}</span>
                {notification.playerEmail && (
                  <span className="text-gray-500"> • {notification.playerEmail}</span>
                )}
              </p>

              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500">
                  {format(new Date(notification.createdAt), 'PPp', { locale: fr })}
                </span>

                <div className="flex items-center gap-2">
                  {notification.emailSent && (
                    <span className="flex items-center gap-1 text-green-400">
                      <Mail className="w-3 h-3" />
                      Email
                    </span>
                  )}
                  {notification.discordSent && (
                    <span className="flex items-center gap-1 text-purple-400">
                      <MessageSquare className="w-3 h-3" />
                      Discord
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
