import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CoachCalendar from '@/components/calendar/CoachCalendar';
import { GradientText, GlassCard } from '@/components/ui';
import { Clock } from 'lucide-react';

export default async function CoachAgendaPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/sign-in');
  }

  // Récupérer le coach
  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
  });

  if (!coach) {
    redirect('/dashboard');
  }

  return (
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
        <CoachCalendar coachId={coach.id} />

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
  );
}
