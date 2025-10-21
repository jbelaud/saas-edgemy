'use client';

import { useState, useEffect } from 'react';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Package, CheckCircle2, Clock, Settings, Plus, Loader2, Calendar } from 'lucide-react';
import { SchedulePackSessionModal } from '@/components/coach/packs/SchedulePackSessionModal';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Session {
  id: string;
  sessionNumber: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface Player {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface PlayerPack {
  player: Player;
  sessions: Session[];
  totalSessions: number;
  completedSessions: number;
  scheduledSessions: number;
  remainingSessions: number;
}

interface Pack {
  id: string;
  hours: number;
  totalPrice: number;
  discountPercent: number | null;
  announcement: {
    id: string;
    title: string;
    type: string;
    durationMin: number;
  };
  playerPacks: PlayerPack[];
}

export default function CoachPacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState<{
    open: boolean;
    packId: string;
    playerId: string;
    playerName: string;
    announcementTitle: string;
    currentSessionNumber: number;
    totalSessions: number;
    durationMin: number;
  } | null>(null);

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const response = await fetch('/api/coach/packs');
      if (response.ok) {
        const data = await response.json();
        setPacks(data.packs || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des packs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSession = (
    packId: string,
    playerId: string,
    playerName: string,
    announcementTitle: string,
    currentSessionNumber: number,
    totalSessions: number,
    durationMin: number
  ) => {
    setScheduleModal({
      open: true,
      packId,
      playerId,
      playerName,
      announcementTitle,
      currentSessionNumber,
      totalSessions,
      durationMin,
    });
  };

  const handleScheduleSuccess = () => {
    fetchPacks();
    setScheduleModal(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'CONFIRMED':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Settings className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Effectuée';
      case 'CONFIRMED':
        return 'Planifiée';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  if (isLoading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CoachLayout>
    );
  }

  return (
    <CoachLayout>
      <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Mes Packs</h1>
        <p className="text-muted-foreground">
          Gérez les sessions de vos packs d&apos;heures achetés par vos élèves
        </p>
      </div>

      {packs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Aucun pack acheté</p>
            <p className="text-sm text-muted-foreground">
              Les packs achetés par vos élèves apparaîtront ici
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {packs.map((pack) =>
            pack.playerPacks.map((playerPack) => {
              const initials = playerPack.player.name
                ?.split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase() || 'U';

              return (
                <Card key={`${pack.id}-${playerPack.player.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={playerPack.player.image || ''} />
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Package className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">
                              Pack {pack.hours}h — {playerPack.player.name}
                            </CardTitle>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {pack.announcement.title}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">
                              {playerPack.completedSessions} effectuée{playerPack.completedSessions > 1 ? 's' : ''}
                            </Badge>
                            <Badge variant="secondary">
                              {playerPack.scheduledSessions} planifiée{playerPack.scheduledSessions > 1 ? 's' : ''}
                            </Badge>
                            {playerPack.remainingSessions > 0 && (
                              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                                {playerPack.remainingSessions} à planifier
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Liste des sessions */}
                    <div className="space-y-2 mb-4">
                      {playerPack.sessions.map((session) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {getStatusIcon(session.status)}
                            <div>
                              <p className="font-medium">
                                Session {session.sessionNumber}/{pack.hours}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(session.startDate), 'PPP à HH:mm', { locale: fr })}
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusBadgeClass(session.status)}>
                            {getStatusLabel(session.status)}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Bouton ajouter une date */}
                    {playerPack.remainingSessions > 0 && (
                      <Button
                        onClick={() =>
                          handleScheduleSession(
                            pack.id,
                            playerPack.player.id,
                            playerPack.player.name || 'Joueur',
                            pack.announcement.title,
                            playerPack.sessions.length + 1,
                            pack.hours,
                            pack.announcement.durationMin
                          )
                        }
                        className="w-full"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter une date ({playerPack.remainingSessions} session{playerPack.remainingSessions > 1 ? 's' : ''} restante{playerPack.remainingSessions > 1 ? 's' : ''})
                      </Button>
                    )}

                    {playerPack.remainingSessions === 0 && (
                      <div className="text-center py-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800">
                          ✅ Toutes les sessions ont été planifiées
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Modal de planification */}
      {scheduleModal && (
        <SchedulePackSessionModal
          packId={scheduleModal.packId}
          playerId={scheduleModal.playerId}
          playerName={scheduleModal.playerName}
          announcementTitle={scheduleModal.announcementTitle}
          currentSessionNumber={scheduleModal.currentSessionNumber}
          totalSessions={scheduleModal.totalSessions}
          durationMin={scheduleModal.durationMin}
          open={scheduleModal.open}
          onOpenChange={(open) => {
            if (!open) setScheduleModal(null);
          }}
          onSuccess={handleScheduleSuccess}
        />
      )}
      </div>
    </CoachLayout>
  );
}
