'use client';

import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { DashboardAnnouncements } from '@/components/coach/dashboard/DashboardAnnouncements';
import { CreateAnnouncementModal } from '@/components/coach/announcements/CreateAnnouncementModal';
import { useSession } from '@/lib/auth-client';
import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CoachAnnouncementsPage() {
  const { data: session, isPending } = useSession();
  const [coach, setCoach] = useState<{ id: string; slug: string } | null>(null);
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

  return (
    <CoachLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Mes Annonces
            </h1>
            <p className="text-gray-600">
              Gérez vos annonces de coaching
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Créer une annonce
          </Button>
        </div>

        <DashboardAnnouncements coach={coach} key={refreshKey} />
      </div>

      <CreateAnnouncementModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </CoachLayout>
  );
}
