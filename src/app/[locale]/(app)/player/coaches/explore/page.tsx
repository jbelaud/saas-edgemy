import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { CoachsPageContent } from '../../../coachs/pageClient';

export default async function PlayerCoachesExplorePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <PlayerLayout>
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <CoachsPageContent locale={locale} />
      </Suspense>
    </PlayerLayout>
  );
}
