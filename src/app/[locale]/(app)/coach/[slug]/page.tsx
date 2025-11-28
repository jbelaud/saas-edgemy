import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { CoachHeader } from '@/components/coach/public/CoachHeader';
import { CoachAnnouncements } from '@/components/coach/public/CoachAnnouncements';
import { CoachAbout } from '@/components/coach/public/CoachAbout';
import { CoachReviews } from '@/components/coach/public/CoachReviews';
import { CoachVideo } from '@/components/coach/public/CoachVideo';
import { CoachAvailabilityPreview } from '@/components/coach/public/CoachAvailabilityPreview';
// import { CoachWhyMe } from '@/components/coach/public/CoachWhyMe'; // Désactivé pour MVP - à réactiver plus tard
import { TrustBadges } from '@/components/coach/public/TrustBadges';
import { StructuredData } from '@/components/seo/StructuredData';
import { generateCoachProfileSchema, generateBreadcrumbSchema } from '@/lib/seo/structuredData';
import { getCoachReviewStats } from '@/lib/reviews';

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
      bannerUrl: true,
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
      presentationVideoUrl: true,
      bio: true,
      methodology: true,
      timezone: true,
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

// Métadonnées dynamiques pour SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const coach = await getCoach(slug);

  if (!coach) {
    return {
      title: 'Coach non trouvé | Edgemy',
      description: 'Ce profil de coach n\'existe pas ou n\'est plus disponible.',
    };
  }

  const coachName = `${coach.firstName} ${coach.lastName}`;
  const title = `${coachName} - Coach Poker sur Edgemy`;
  const description = coach.bio
    ? `${coach.bio.substring(0, 155)}...`
    : `Réservez une session de coaching poker avec ${coachName}. ${coach.experience || ''} Formations personnalisées et stratégies gagnantes sur Edgemy.`;

  const url = `https://edgemy.fr/${locale}/coach/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Edgemy',
      images: coach.avatarUrl ? [
        {
          url: coach.avatarUrl,
          width: 1200,
          height: 630,
          alt: `Photo de profil de ${coachName}`,
        }
      ] : [],
      locale: locale,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: coach.avatarUrl ? [coach.avatarUrl] : [],
    },
  };
}

export default async function CoachPublicPage({ params }: PageProps) {
  const { slug, locale } = await params;
  const coach = await getCoach(slug);

  if (!coach) {
    notFound();
  }

  const isInactive = coach.subscriptionStatus !== 'ACTIVE';

  // Récupérer les statistiques d'avis réelles
  const reviewStats = await getCoachReviewStats(coach.id);

  // Récupérer les avis publics du coach
  const reviews = await prisma.review.findMany({
    where: {
      coachId: coach.id,
      isPublic: true, // Seulement les avis approuvés
    },
    include: {
      player: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20, // Limiter à 20 avis les plus récents
  });

  // Calculer le nombre d'élèves uniques (joueurs ayant eu au moins une réservation)
  const uniqueStudents = await prisma.reservation.findMany({
    where: {
      coachId: coach.id,
      status: {
        in: ['CONFIRMED', 'COMPLETED'], // Seulement les sessions confirmées ou complétées
      },
    },
    select: {
      playerId: true,
    },
    distinct: ['playerId'],
  });

  const studentsCount = uniqueStudents.length;

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

  // Données structurées pour SEO/GEO
  const coachProfileSchemas = generateCoachProfileSchema({
    coach: {
      firstName: coach.firstName,
      lastName: coach.lastName,
      slug: coach.slug,
      bio: coach.bio || undefined,
      avatarUrl: coach.avatarUrl || undefined,
      twitterUrl: coach.twitterUrl || undefined,
      twitchUrl: coach.twitchUrl || undefined,
      youtubeUrl: coach.youtubeUrl || undefined,
    },
    locale,
    announcements: coach.announcements.map((a: {
      title?: string;
      description?: string;
      priceCents?: number;
      type?: string;
    }) => ({
      title: a.title || 'Coaching',
      description: a.description || '',
      priceCents: a.priceCents || 0,
      type: a.type || 'STRATEGY',
    })),
    averageRating: reviewStats.averageRating,
    reviewCount: reviewStats.totalReviews,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Accueil', url: `https://edgemy.fr/${locale}` },
    { name: 'Coachs', url: `https://edgemy.fr/${locale}/coachs` },
    { name: `${coach.firstName} ${coach.lastName}`, url: `https://edgemy.fr/${locale}/coach/${slug}` },
  ]);

  return (
    <PublicLayout>
      {/* Données structurées JSON-LD */}
      {coachProfileSchemas.map((schema, index) => (
        <StructuredData key={`schema-${index}`} data={schema} />
      ))}
      <StructuredData data={breadcrumbSchema} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <CoachHeader coach={coach} reviewStats={reviewStats} studentsCount={studentsCount} />

        {/* Trust Badges */}
        <div className="container mx-auto px-6 -mt-6 relative z-10">
          <TrustBadges />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="space-y-8">
            {/* Section 1: À propos + Vidéo OU Calendrier */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* À propos + Méthodologie - 2 colonnes */}
              <div className="lg:col-span-2">
                <CoachAbout coach={coach} />
              </div>

              {/* Vidéo OU Calendrier - 1 colonne */}
              <div>
                {coach.presentationVideoUrl ? (
                  <CoachVideo
                    presentationVideoUrl={coach.presentationVideoUrl}
                    coachName={`${coach.firstName} ${coach.lastName}`}
                  />
                ) : (
                  <CoachAvailabilityPreview
                    coachId={coach.id}
                    coachTimezone={coach.timezone || 'Europe/Paris'}
                  />
                )}
              </div>
            </div>

            {/* Section 2: Calendrier (si vidéo présente) */}
            {coach.presentationVideoUrl && (
              <CoachAvailabilityPreview
                coachId={coach.id}
                coachTimezone={coach.timezone || 'Europe/Paris'}
              />
            )}

            {/* Section 3: Offres de coaching - Grid responsive */}
            <div id="offers">
              <CoachAnnouncements
                announcements={transformedAnnouncements}
                coachId={coach.id}
                isInactive={isInactive}
              />
            </div>

            {/* Section 4: Avis des élèves */}
            <CoachReviews
              coachId={coach.id}
              averageRating={reviewStats.averageRating}
              totalReviews={reviewStats.totalReviews}
              reviews={reviews}
            />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
