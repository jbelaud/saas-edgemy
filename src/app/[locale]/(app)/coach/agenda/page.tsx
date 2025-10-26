'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import CoachCalendar from '@/components/calendar/CoachCalendar';
import { GradientText, GlassCard } from '@/components/ui';
import { Clock, Loader2 } from 'lucide-react';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';

export default function CoachAgendaPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [coachId, setCoachId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isPending) return;
    
    if (!session?.user) {
      router.push('/sign-in');
      return;
    }

    // Récupérer le coach ID
    fetch('/api/coach/profile')
      .then(res => res.json())
      .then(data => {
        if (data.coach?.id) {
          setCoachId(data.coach.id);
        } else {
          router.push('/dashboard');
        }
      })
      .catch(() => router.push('/dashboard'))
      .finally(() => setIsLoading(false));
  }, [session, isPending, router]);

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
      <div className="space-y-8">
        {/* Header */}
        <div>
          <GradientText variant="amber" className="text-4xl font-bold mb-2">
            📅 Mon Agenda
          </GradientText>
          <p className="text-gray-400 text-lg">
            Gérez vos disponibilités et visualisez vos sessions réservées
          </p>
        </div>

        <div className="grid gap-6">
          {/* Calendrier de gestion des disponibilités */}
          <CoachCalendar coachId={coachId} />

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
      </div>
    </CoachLayout>
  );
}
