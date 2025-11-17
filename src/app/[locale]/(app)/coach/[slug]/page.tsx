import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { CoachHeader } from '@/components/coach/public/CoachHeader';
import { CoachAnnouncements } from '@/components/coach/public/CoachAnnouncements';
import { CoachAbout } from '@/components/coach/public/CoachAbout';
import { CoachReviews } from '@/components/coach/public/CoachReviews';
// import { CoachWhyMe } from '@/components/coach/public/CoachWhyMe'; // Désactivé pour MVP - à réactiver plus tard
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
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      status: true,
      subscriptionStatus: true,
      subscriptionPlan: true,
      experience: true,
      roi: true,
      formats: true,
      badges: true,
      twitchUrl: true,
      youtubeUrl: true,
      twitterUrl: true,
      discordUrl: true,
      bio: true,
      methodology: true,
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

  const isInactive = coach.subscriptionStatus !== 'ACTIVE';

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

            {/* Offres de coaching - KEEP AS IS */}
            <div id="offers">
              <CoachAnnouncements 
                announcements={transformedAnnouncements} 
                coachId={coach.id}
                isInactive={isInactive}
              />
            </div>

            {/* Avis des élèves */}
            <CoachReviews 
              coachId={coach.id}
              averageRating={4.9}
              totalReviews={127}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
