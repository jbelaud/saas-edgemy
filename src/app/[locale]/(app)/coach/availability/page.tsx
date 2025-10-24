'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

// Cette page redirige automatiquement vers /coach/agenda
export default function CoachAvailabilityPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    // Redirection immédiate vers la nouvelle page agenda
    router.replace(`/${locale}/coach/agenda`);
  }, [router, locale]);

  return null;
}
