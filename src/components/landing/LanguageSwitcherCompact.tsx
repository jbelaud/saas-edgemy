'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcherCompact() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Détecter la langue actuelle depuis l'URL
  const currentLang = pathname.startsWith('/en') ? 'en' : 'fr';
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    // Si on est sur la page d'accueil (/)
    if (pathname === '/' || pathname === '') {
      router.push(`/${langCode}`);
    } else {
      // Remplacer la locale dans le pathname
      const newPathname = pathname.replace(/^\/(fr|en)/, `/${langCode}`);
      router.push(newPathname);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-lg transition-all duration-200 text-white"
        aria-label="Changer de langue"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">
          {currentLanguage.flag} {currentLanguage.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <>
          {/* Overlay pour fermer le menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu déroulant */}
          <div className="absolute top-full mt-2 right-0 z-20 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[160px]">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  currentLang === lang.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
                {currentLang === lang.code && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
