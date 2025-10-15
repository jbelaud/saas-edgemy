'use client';

import React, { createContext, useContext, useTransition } from 'react';
import { useRouter, usePathname } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isPending: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() as Language;
  const [isPending, startTransition] = useTransition();

  const handleSetLanguage = (lang: Language) => {
    startTransition(() => {
      router.replace(pathname, { locale: lang });
    });
  };

  return (
    <LanguageContext.Provider value={{ language: locale, setLanguage: handleSetLanguage, isPending }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
