import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { PublicLayout } from '@/components/layout';
import { CoachsPageContent } from './pageClient';

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
