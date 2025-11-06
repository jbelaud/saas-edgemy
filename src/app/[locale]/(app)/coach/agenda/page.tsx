'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import CoachCalendar from '@/components/calendar/CoachCalendar';
import QuickAddAvailability from '@/components/calendar/QuickAddAvailability';
import AvailabilityList from '@/components/calendar/AvailabilityList';
import SchedulePackSessionModal from '@/components/calendar/SchedulePackSessionModal';
import { GradientText, GlassCard } from '@/components/ui';
import { Clock, Loader2, Package } from 'lucide-react';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { SubscriptionGate } from '@/components/coach/dashboard/SubscriptionGate';

interface Availability {
  id: string;
  start: string;
  end: string;
}

export default function CoachAgendaPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [coachId, setCoachId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isPackModalOpen, setIsPackModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);

  const fetchAvailabilities = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/coach/${id}/availability`);
      if (res.ok) {
        const data = await res.json();
        setAvailabilities(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des disponibilités:', error);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;
    
    if (!session?.user) {
      router.push('/sign-in');
      return;
    }

    // Récupérer le coach ID et le statut d'abonnement
    fetch('/api/coach/profile')
      .then(res => res.json())
      .then(data => {
        if (data.coach?.id) {
          setCoachId(data.coach.id);
          setSubscriptionStatus(data.coach?.subscriptionStatus || null);
          fetchAvailabilities(data.coach.id);
        } else {
          router.push('/dashboard');
        }
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setIsLoading(false));
  }, [session, isPending, router, fetchAvailabilities]);

  const handleRefresh = useCallback(() => {
    if (coachId) {
      fetchAvailabilities(coachId);
      setRefreshKey(prev => prev + 1);
    }
  }, [coachId, fetchAvailabilities]);

  if (isPending || isLoading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      </CoachLayout>
    );
  }

  if (!coachId) {
    return null;
  }

  return (
    <CoachLayout>
      <SubscriptionGate
        isActive={subscriptionStatus === 'ACTIVE'}
      >
        <div className="space-y-6">
          {/* Header */}
          <div>
            <GradientText variant="amber" className="text-4xl font-bold mb-2">
              📅 Mon Agenda
            </GradientText>
            <p className="text-gray-400 text-lg">
              Gérez vos disponibilités et visualisez vos sessions réservées
            </p>
          </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuickAddAvailability coachId={coachId} onSuccess={handleRefresh} />
          
          {/* Bouton planifier session de pack */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-white">Sessions de pack</h2>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Planifiez une session pour un joueur ayant acheté un pack
            </p>
            <button
              onClick={() => setIsPackModalOpen(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Planifier une session
            </button>
          </GlassCard>
        </div>

        {/* Layout principal: Calendrier + Liste */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Calendrier (2/3 de l'espace) - Masqué sur mobile */}
          <div className="hidden xl:block xl:col-span-2">
            <CoachCalendar key={refreshKey} coachId={coachId} />
          </div>

          {/* Liste des disponibilités (1/3 de l'espace sur desktop, pleine largeur sur mobile) */}
          <div className="xl:col-span-1">
            <AvailabilityList
              availabilities={availabilities.map(av => ({
                ...av,
                start: new Date(av.start),
                end: new Date(av.end),
              }))}
              coachId={coachId}
              onUpdate={handleRefresh}
            />
          </div>
        </div>

        {/* Prochaines sessions - À implémenter */}
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Prochaines sessions</h2>
          </div>
          <p className="text-gray-400 text-sm">
            La liste de vos prochaines sessions sera affichée ici.
          </p>
        </GlassCard>
        </div>
      </SubscriptionGate>

      {/* Modal de planification de pack */}
      <SchedulePackSessionModal
        isOpen={isPackModalOpen}
        onClose={() => setIsPackModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </CoachLayout>
  );
}
