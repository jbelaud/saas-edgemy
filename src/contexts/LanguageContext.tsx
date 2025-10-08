'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traductions simples pour commencer
const translations = {
  fr: {
    'home.title': 'Bienvenue sur Edgemy',
    'home.subtitle': 'La plateforme de coaching poker qui connecte joueurs et coachs passionnés',
    'home.description': 'Trouvez votre coach poker adapté en quelques clics',
    'nav.dashboard': 'Accéder au Dashboard',
    'nav.profile': 'Mon Profil',
    'common.development': 'Application en cours de développement',
  },
  en: {
    'home.title': 'Welcome to Edgemy',
    'home.subtitle': 'The poker coaching platform that connects passionate players and coaches',
    'home.description': 'Find the perfect coach to take your game to the next level',
    'nav.dashboard': 'Access Dashboard',
    'nav.profile': 'My Profile',
    'common.development': 'Application under development',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  // Fonction de traduction
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['fr']] || key;
  };

  // Sauvegarder la langue dans localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem('edgemy-language') as Language;
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('edgemy-language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
