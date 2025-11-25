import { Suspense } from 'react';
import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { PublicLayout } from '@/components/layout';
import { CoachsPageContent } from './pageClient';

// Métadonnées dynamiques pour SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = 'Trouvez votre Coach Poker | Edgemy';
  const description = 'Découvrez notre sélection de coachs poker professionnels. Stratégie, review de sessions, outils et mental game. Réservez votre coaching personnalisé dès maintenant.';
  const url = `https://edgemy.fr/${locale}/coachs`;

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
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function CoachsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PublicLayout>
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <CoachsPageContent locale={locale} />
      </Suspense>
    </PublicLayout>
  );
}
