import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ReviewForm } from '@/components/reviews/ReviewForm';

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

async function getCoach(slug: string) {
  return prisma.coach.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      firstName: true,
      lastName: true,
      avatarUrl: true,
      bannerUrl: true,
    },
  });
}

// Métadonnées SEO pour page de collecte d'avis
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const coach = await getCoach(slug);

  if (!coach) {
    return {
      title: 'Coach non trouvé | Edgemy',
      robots: { index: false, follow: false },
    };
  }

  const coachName = `${coach.firstName} ${coach.lastName}`;
  const title = `Laisser un avis sur ${coachName} | Edgemy`;
  const description = `Partagez votre expérience avec ${coachName}, coach poker sur Edgemy. Votre avis aide d'autres joueurs à progresser.`;

  return {
    title,
    description,
    robots: {
      index: true, // ✅ Indexable pour SEO
      follow: true,
    },
    alternates: {
      canonical: `https://edgemy.fr/${locale}/coach/${slug}/review`,
    },
  };
}

export default async function CoachReviewPage({ params }: PageProps) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('coach.review');

  const coach = await getCoach(slug);

  if (!coach) {
    notFound();
  }

  const coachName = `${coach.firstName} ${coach.lastName}`;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-12">
        <div className="container mx-auto px-6 max-w-2xl">
          {/* Header avec avatar coach */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {coach.avatarUrl ? (
                <img
                  src={coach.avatarUrl}
                  alt={coachName}
                  className="w-24 h-24 rounded-full border-4 border-emerald-400/50 shadow-lg object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl font-bold text-emerald-200 border-4 border-emerald-400/50">
                  {coach.firstName[0]}{coach.lastName[0]}
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {t('pageTitle', { coachName })}
            </h1>
            <p className="text-slate-300 text-lg">
              {t('pageSubtitle')}
            </p>
          </div>

          {/* Formulaire d'avis */}
          <Suspense fallback={<div className="text-center text-slate-400">{t('loading')}</div>}>
            <ReviewForm coachId={coach.id} coachName={coachName} locale={locale} />
          </Suspense>

          {/* Note SEO/UGC */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
            <p className="text-sm text-blue-200 text-center">
              ✨ {t('publishNote', { coachName })}
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
