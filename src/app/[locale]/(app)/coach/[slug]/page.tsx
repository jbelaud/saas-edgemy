import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { CoachHeader } from '@/components/coach/public/CoachHeader';
import { CoachAnnouncements } from '@/components/coach/public/CoachAnnouncements';
import { CoachAbout } from '@/components/coach/public/CoachAbout';
import { CoachReviews } from '@/components/coach/public/CoachReviews';
import { TrustBadges } from '@/components/coach/public/TrustBadges';

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
        include: {
          packs: {
            where: { isActive: true },
            orderBy: { hours: 'asc' },
          },
        },
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
    type: announcement.type || 'STRATEGY',
    title: announcement.title || 'Sans titre',
    description: announcement.description || '',
    price: announcement.priceCents ? announcement.priceCents / 100 : 0,
    duration: announcement.durationMin || 60,
    slug: announcement.slug || '',
    // Packs
    packs: announcement.packs || [],
    // STRATEGY
    variant: announcement.variant,
    format: announcement.format,
    abiRange: announcement.abiRange,
    tags: announcement.tags || [],
    // REVIEW
    reviewType: announcement.reviewType,
    reviewSupport: announcement.reviewSupport,
    // TOOL
    toolName: announcement.toolName,
    toolObjective: announcement.toolObjective,
    prerequisites: announcement.prerequisites,
    // MENTAL
    mentalFocus: announcement.mentalFocus,
  }));

  // Mock data pour les reviews - à remplacer par de vraies données
  const averageRating = 4.9;
  const totalReviews = 127;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <CoachHeader coach={coach} />

        {/* Trust Badges */}
        <div className="container mx-auto px-6 -mt-6 relative z-10">
          <TrustBadges />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="space-y-12">
            {/* À propos + Méthodologie */}
            <CoachAbout coach={coach} />

            {/* Offres de coaching */}
            <CoachAnnouncements 
              announcements={transformedAnnouncements} 
              coachId={coach.id}
              isInactive={isInactive}
            />

            {/* Reviews */}
            <CoachReviews 
              coachId={coach.id}
              averageRating={averageRating}
              totalReviews={totalReviews}
            />

            {/* Section "Pourquoi réserver avec moi" */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-100">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Pourquoi réserver avec moi ?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Approche personnalisée</h3>
                    <p className="text-gray-600">Chaque session est adaptée à votre niveau et vos objectifs spécifiques</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Résultats rapides</h3>
                    <p className="text-gray-600">Méthode éprouvée pour progresser rapidement et efficacement</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Ressources complètes</h3>
                    <p className="text-gray-600">Accès aux replays, notes de session et matériel pédagogique</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Communauté active</h3>
                    <p className="text-gray-600">Rejoignez un groupe d'élèves motivés et échangez vos expériences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
