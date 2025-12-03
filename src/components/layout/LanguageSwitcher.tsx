'use client';

import { useState, useEffect, useId } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'fr', name: 'Français' },
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'es', name: 'Español' },
] as const;

type LanguageCode = typeof languages[number]['code'];

// SVG Flags as components - Simplified without clipPath to avoid hydration issues
function FlagFR() {
  return (
    <svg className="w-full h-full rounded-lg" viewBox="0 0 900 600" aria-hidden="true">
      <rect width="900" height="600" fill="#ED2939" rx="60"/>
      <rect width="600" height="600" fill="#fff"/>
      <rect width="300" height="600" fill="#002395"/>
    </svg>
  );
}

// Simplified UK flag without clipPath to avoid SSR/hydration mismatch
function FlagEN() {
  return (
    <svg className="w-full h-full rounded-lg" viewBox="0 0 60 30" aria-hidden="true">
      <rect width="60" height="30" fill="#012169" rx="3"/>
      {/* White diagonals */}
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      {/* Red diagonals (simplified without clipPath) */}
      <path d="M0,0 L25,12.5" stroke="#C8102E" strokeWidth="4"/>
      <path d="M35,17.5 L60,30" stroke="#C8102E" strokeWidth="4"/>
      <path d="M60,0 L35,12.5" stroke="#C8102E" strokeWidth="4"/>
      <path d="M25,17.5 L0,30" stroke="#C8102E" strokeWidth="4"/>
      {/* White cross */}
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      {/* Red cross */}
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
    </svg>
  );
}

function FlagDE() {
  return (
    <svg className="w-full h-full rounded-lg" viewBox="0 0 5 3" aria-hidden="true">
      <rect width="5" height="3" fill="#000" rx="0.3"/>
      <rect width="5" height="2" y="1" fill="#D00"/>
      <rect width="5" height="1" y="2" fill="#FFCE00"/>
    </svg>
  );
}

function FlagIT() {
  return (
    <svg className="w-full h-full rounded-lg" viewBox="0 0 3 2" aria-hidden="true">
      <rect width="3" height="2" fill="#CE2B37" rx="0.2"/>
      <rect width="2" height="2" fill="#fff"/>
      <rect width="1" height="2" fill="#009246"/>
    </svg>
  );
}

function FlagES() {
  return (
    <svg className="w-full h-full rounded-lg" viewBox="0 0 750 500" aria-hidden="true">
      <rect width="750" height="500" fill="#c60b1e" rx="50"/>
      <rect width="750" height="250" y="125" fill="#ffc400"/>
    </svg>
  );
}

const flagComponents: Record<LanguageCode, () => React.JSX.Element> = {
  fr: FlagFR,
  en: FlagEN,
  de: FlagDE,
  it: FlagIT,
  es: FlagES,
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const dropdownId = useId();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLanguageChange = (langCode: LanguageCode) => {
    setLanguage(langCode);
  };

  // Show a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div 
        className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 backdrop-blur-sm p-1.5"
        aria-hidden="true"
      />
    );
  }

  const CurrentFlag = flagComponents[language];

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button 
          id={`${dropdownId}-trigger`}
          className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm p-1.5 overflow-hidden"
          aria-label={`Langue actuelle: ${languages.find(l => l.code === language)?.name}`}
        >
          <CurrentFlag />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start"
        sideOffset={5}
        className="w-14 bg-slate-900/95 backdrop-blur-xl border border-white/10 p-1.5 flex flex-col items-center"
      >
        {languages.map((lang) => {
          const Flag = flagComponents[lang.code];
          const isSelected = language === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-10 h-8 flex items-center justify-center cursor-pointer rounded-lg p-1.5 transition-all overflow-hidden ${
                isSelected 
                  ? 'bg-amber-500/20 border border-amber-500/30' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
              aria-label={lang.name}
              aria-current={isSelected ? 'true' : undefined}
            >
              <Flag />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
