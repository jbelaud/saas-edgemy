import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import CoachCalendar from '@/components/calendar/CoachCalendar';

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
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mon Agenda</h1>
        <p className="text-gray-600 mt-2">
          Gérez vos disponibilités et visualisez vos sessions réservées
        </p>
      </div>

      <div className="grid gap-6">
        {/* Calendrier de gestion des disponibilités */}
        <CoachCalendar coachId={coach.id} />

        {/* Prochaines sessions - À implémenter */}
        <div className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Prochaines sessions</h2>
          <p className="text-gray-500 text-sm">
            La liste de vos prochaines sessions sera affichée ici.
          </p>
        </div>
      </div>
    </div>
  );
}
