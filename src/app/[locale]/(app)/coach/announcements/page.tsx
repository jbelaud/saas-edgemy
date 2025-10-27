'use client';

import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { DashboardAnnouncements } from '@/components/coach/dashboard/DashboardAnnouncements';
import { CreateAnnouncementModalV2 } from '@/components/coach/announcements/CreateAnnouncementModalV2';
import { useSession } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Plus, Eye, Megaphone } from 'lucide-react';
import { GradientText } from '@/components/ui';

export default function CoachAnnouncementsPage() {
  const { data: session, isPending } = useSession();
  const params = useParams();
  const locale = params.locale as string;
  const [coach, setCoach] = useState<{ id: string; slug: string; status: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        const response = await fetch('/api/coach/dashboard');
        if (response.ok) {
          const data = await response.json();
          setCoach(data.coach);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil coach:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchCoach();
    }
  }, [session]);

  if (isPending || isLoading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CoachLayout>
    );
  }

  if (!coach) {
    return null;
  }

  const isInactive = coach.status === 'INACTIVE';

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <GradientText variant="purple" className="text-4xl font-bold mb-2 flex items-center gap-3">
              <Megaphone className="w-10 h-10" />
              Mes Annonces
            </GradientText>
            <p className="text-gray-400 text-lg">
              Créez et gérez vos offres de coaching
            </p>
          </div>
          {!isInactive && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.open(`/${locale}/coach/${coach.slug}`, '_blank')}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 border border-white/10 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Voir mon profil public
              </button>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer une annonce
              </button>
            </div>
          )}
        </div>

        <DashboardAnnouncements coach={coach} key={refreshKey} />
      </div>

      {!isInactive && (
        <CreateAnnouncementModalV2
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      )}
    </CoachLayout>
  );
}
