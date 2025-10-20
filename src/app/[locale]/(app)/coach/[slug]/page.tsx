import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CoachHeader } from '@/components/coach/public/CoachHeader';
import { CoachAnnouncements } from '@/components/coach/public/CoachAnnouncements';
import { CoachAbout } from '@/components/coach/public/CoachAbout';
import { CoachAvailabilityCalendar } from '@/components/coach/public/CoachAvailabilityCalendar';

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

async function getCoach(slug: string) {
  const coach = await prisma.coach.findUnique({
    where: { slug },
    include: {
      announcements: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      },
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return coach as any;
}

export default async function CoachPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const coach = await getCoach(slug);

  if (!coach) {
    notFound();
  }

  const isInactive = coach.status === 'INACTIVE';

  // Transformer les annonces pour le composant
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformedAnnouncements = coach.announcements.map((announcement: any) => ({
    id: announcement.id,
    title: announcement.title || 'Sans titre',
    description: announcement.description || '',
    price: announcement.priceCents ? announcement.priceCents / 100 : 0, // Convertir centimes en euros
    duration: announcement.durationMin || 60,
    format: announcement.format || 'MENTAL',
    slug: announcement.slug || '',
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec bannière et infos coach */}
      <CoachHeader coach={coach} />

      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* À propos */}
            <CoachAbout coach={coach} />

            {/* Annonces */}
            <CoachAnnouncements 
              announcements={transformedAnnouncements} 
              coachId={coach.id}
              isInactive={isInactive}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Calendrier de disponibilités */}
              <CoachAvailabilityCalendar coachId={coach.id} isInactive={isInactive} />

              {/* Stats rapides */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Expérience</span>
                    <span className="font-semibold">{coach.experience || 0} ans</span>
                  </div>
                  {coach.roi && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI</span>
                      <span className="font-semibold text-green-600">{coach.roi}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Annonces actives</span>
                    <span className="font-semibold">{coach.announcements.length}</span>
                  </div>
                </div>
              </div>

              {/* Formats */}
              {coach.formats && coach.formats.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Spécialités</h3>
                  <div className="flex flex-wrap gap-2">
                    {coach.formats.map((format: string) => (
                      <span
                        key={format}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Langues */}
              {coach.languages && coach.languages.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4">Langues parlées</h3>
                  <div className="flex flex-wrap gap-2">
                    {coach.languages.map((lang: string) => (
                      <span
                        key={lang}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
