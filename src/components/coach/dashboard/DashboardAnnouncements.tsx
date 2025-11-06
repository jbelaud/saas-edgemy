'use client';

import { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Trash2, Eye, EyeOff, Euro, Clock, Megaphone } from 'lucide-react';
import { AnnouncementPacksSection } from '@/components/coach/announcements/AnnouncementPacksSection';
import { SubscriptionGate } from '@/components/coach/dashboard/SubscriptionGate';

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

export function DashboardAnnouncements({ coach }: DashboardAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasActiveSubscription = coach.subscriptionStatus === 'ACTIVE';

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

  return (
    <SubscriptionGate
      isActive={hasActiveSubscription}
    >
      {announcements.length === 0 ? (
        <GlassCard>
          <div className="py-12 text-center">
            <p className="text-gray-400 mb-4">
              Vous n&apos;avez pas encore créé d&apos;annonce
            </p>
            <p className="text-sm text-gray-500">
              Cliquez sur &quot;Créer une annonce&quot; pour commencer
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {announcements.map((announcement) => (
        <GlassCard key={announcement.id} className={`p-6 hover:border-emerald-500/30 transition-all ${!announcement.isActive ? 'opacity-60' : ''}`}>
          <div className="space-y-4">
            {/* Header avec icône, titre et statut */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Megaphone className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-white mb-1 truncate">{announcement.title}</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                    announcement.isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                  }`}>
                    {announcement.isActive ? '✓ Active' : '○ Inactive'}
                  </span>
                </div>
              </div>
            </div>

              {/* Type et infos spécifiques */}
              <div className="flex flex-wrap gap-2">
                {/* Badge Type avec couleur */}
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                  announcement.type === 'STRATEGY' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  announcement.type === 'REVIEW' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                  announcement.type === 'MENTAL' ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20' :
                  'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  {TYPE_LABELS[announcement.type] || announcement.type}
                </span>
                
                {announcement.type === 'STRATEGY' && (
                  <>
                    {announcement.variant && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {VARIANT_LABELS[announcement.variant] || announcement.variant}
                      </span>
                    )}
                    {announcement.format && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {FORMAT_LABELS[announcement.format] || announcement.format}
                      </span>
                    )}
                    {announcement.abiRange && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ABI: {announcement.abiRange}
                      </span>
                    )}
                  </>
                )}
                
                {announcement.type === 'REVIEW' && (
                  <>
                    {announcement.reviewType && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        {announcement.reviewType.replace(/_/g, ' ')}
                      </span>
                    )}
                    {announcement.format && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {FORMAT_LABELS[announcement.format] || announcement.format}
                      </span>
                    )}
                    {announcement.reviewSupport && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {announcement.reviewSupport.replace(/_/g, ' ')}
                      </span>
                    )}
                  </>
                )}
                
                {announcement.type === 'TOOL' && (
                  <>
                    {announcement.toolName && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        {announcement.toolName.replace(/_/g, ' ')}
                      </span>
                    )}
                    {announcement.toolObjective && (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                        {announcement.toolObjective.replace(/_/g, ' ')}
                      </span>
                    )}
                  </>
                )}
                
                {announcement.type === 'MENTAL' && announcement.mentalFocus && (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    {announcement.mentalFocus.replace(/_/g, ' ')}
                  </span>
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
            <p className="text-sm text-gray-400 line-clamp-2">
              {announcement.description}
            </p>

            {/* Prix et durée */}
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <div className="flex items-center gap-1">
                <Euro className="h-4 w-4 text-amber-400" />
                <span className="font-semibold">{(announcement.priceCents / 100).toFixed(0)}€</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-400" />
                <span>{announcement.durationMin} minutes</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
              <button
                onClick={() => alert('Fonctionnalité de modification en cours de développement')}
                className="flex-1 min-w-[120px] px-4 py-2.5 bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </button>
              <button
                onClick={() => handleToggleActive(announcement)}
                className={`flex-1 min-w-[120px] px-4 py-2.5 border rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  announcement.isActive
                    ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                }`}
              >
                {announcement.isActive ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Désactiver
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4" />
                    Activer
                  </>
                )}
              </button>
              <button
                onClick={() => handleDelete(announcement.id)}
                className="flex-1 min-w-[120px] px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>

            {/* Section Packs d'heures */}
            <AnnouncementPacksSection 
              announcementId={announcement.id}
              hourlyRate={announcement.priceCents}
            />
          </div>
        </GlassCard>
      ))}
        </div>
      )}
    </SubscriptionGate>
  );
}
