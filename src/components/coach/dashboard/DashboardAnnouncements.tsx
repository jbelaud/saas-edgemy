'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2, Eye, EyeOff, Euro, Clock } from 'lucide-react';

interface Announcement {
  id: string;
  type: string;
  title: string;
  description: string;
  priceCents: number;
  durationMin: number;
  isActive: boolean;
  slug: string;
  createdAt: string;
  // STRATEGY
  variant?: string;
  format?: string;
  abiRange?: string;
  tags?: string[];
  // REVIEW
  reviewType?: string;
  reviewSupport?: string;
  // TOOL
  toolName?: string;
  toolObjective?: string;
  prerequisites?: string;
  // MENTAL
  mentalFocus?: string;
}

import type { CoachWithRelations } from '@/types/dashboard';

interface DashboardAnnouncementsProps {
  coach: CoachWithRelations;
}

const TYPE_LABELS: Record<string, string> = {
  STRATEGY: 'Stratégie',
  REVIEW: 'Review',
  TOOL: 'Outil',
  MENTAL: 'Mental',
};

const VARIANT_LABELS: Record<string, string> = {
  MTT: 'MTT',
  CASH_GAME: 'Cash Game',
  SNG: 'Sit & Go',
  SPIN: 'Spin & Go',
  AUTRE: 'Mental',
  MENTAL: 'Mental',
};

const FORMAT_LABELS: Record<string, string> = {
  NLHE: 'NLHE',
  PLO: 'PLO',
  PLO5: 'PLO5',
  MIXED: 'Mixed',
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

              {/* Type et infos spécifiques */}
              <div className="flex flex-wrap gap-2">
                {/* Badge Type avec couleur */}
                <Badge 
                  className={`font-normal ${
                    announcement.type === 'STRATEGY' ? 'bg-blue-600 hover:bg-blue-700' :
                    announcement.type === 'REVIEW' ? 'bg-green-600 hover:bg-green-700' :
                    announcement.type === 'MENTAL' ? 'bg-pink-600 hover:bg-pink-700' :
                    'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {TYPE_LABELS[announcement.type] || announcement.type}
                </Badge>
                
                {announcement.type === 'STRATEGY' && (
                  <>
                    {announcement.variant && (
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300">
                        {VARIANT_LABELS[announcement.variant] || announcement.variant}
                      </Badge>
                    )}
                    {announcement.format && (
                      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-300">
                        {FORMAT_LABELS[announcement.format] || announcement.format}
                      </Badge>
                    )}
                    {announcement.abiRange && (
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300">
                        ABI: {announcement.abiRange}
                      </Badge>
                    )}
                  </>
                )}
                
                {announcement.type === 'REVIEW' && (
                  <>
                    {announcement.reviewType && (
                      <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-300">
                        {announcement.reviewType.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {announcement.format && (
                      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-indigo-300">
                        {FORMAT_LABELS[announcement.format] || announcement.format}
                      </Badge>
                    )}
                    {announcement.reviewSupport && (
                      <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-200 border-cyan-300">
                        {announcement.reviewSupport.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </>
                )}
                
                {announcement.type === 'TOOL' && (
                  <>
                    {announcement.toolName && (
                      <Badge className="bg-violet-100 text-violet-800 hover:bg-violet-200 border-violet-300">
                        {announcement.toolName.replace(/_/g, ' ')}
                      </Badge>
                    )}
                    {announcement.toolObjective && (
                      <Badge className="bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200 border-fuchsia-300">
                        {announcement.toolObjective.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </>
                )}
                
                {announcement.type === 'MENTAL' && announcement.mentalFocus && (
                  <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-200 border-pink-300">
                    {announcement.mentalFocus.replace(/_/g, ' ')}
                  </Badge>
                )}
              </div>
              
              {/* Tags pour STRATEGY */}
              {announcement.type === 'STRATEGY' && announcement.tags && announcement.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {announcement.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {announcement.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{announcement.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

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
                  onClick={() => alert('Fonctionnalité de modification en cours de développement')}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Modifier
                </Button>
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
