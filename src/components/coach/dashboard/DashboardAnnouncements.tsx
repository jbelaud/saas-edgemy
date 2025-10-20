'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2, Eye, EyeOff, Euro, Clock } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  durationMin: number;
  format: string;
  isActive: boolean;
  slug: string;
  createdAt: string;
}

import type { CoachWithRelations } from '@/types/dashboard';

interface DashboardAnnouncementsProps {
  coach: CoachWithRelations;
}

const FORMAT_LABELS: Record<string, string> = {
  MTT: 'MTT',
  CASH_GAME: 'Cash Game',
  SNG: 'Sit & Go',
  SPIN: 'Spin & Go',
  AUTRE: 'Autre',
};

export function DashboardAnnouncements({}: DashboardAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/coach/announcement');
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      const response = await fetch('/api/coach/announcement', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: announcement.id,
          isActive: !announcement.isActive,
        }),
      });

      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Erreur toggle annonce:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/coach/announcement?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Erreur suppression annonce:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            Vous n&apos;avez pas encore créé d&apos;annonce
          </p>
          <p className="text-sm text-gray-500">
            Cliquez sur &quot;Créer une annonce&quot; pour commencer
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {announcements.map((announcement) => (
        <Card key={announcement.id} className={!announcement.isActive ? 'opacity-60' : ''}>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Header avec titre et statut */}
              <div className="flex justify-between items-start gap-3">
                <h3 className="font-semibold text-lg flex-1">{announcement.title}</h3>
                <Badge variant={announcement.isActive ? 'default' : 'secondary'}>
                  {announcement.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Format */}
              <div>
                <Badge variant="outline" className="font-normal">
                  {FORMAT_LABELS[announcement.format] || announcement.format}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {announcement.description}
              </p>

              {/* Prix et durée */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Euro className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold">{(announcement.priceCents / 100).toFixed(0)}€</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{announcement.durationMin} minutes</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(announcement)}
                >
                  {announcement.isActive ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      Désactiver
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      Activer
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(announcement.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
