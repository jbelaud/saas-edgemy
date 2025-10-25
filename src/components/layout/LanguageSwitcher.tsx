'use client';

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
];

// SVG Flags as components
const FlagFR = () => (
  <svg className="w-6 h-4" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="600" fill="#ED2939"/>
    <rect width="600" height="600" fill="#fff"/>
    <rect width="300" height="600" fill="#002395"/>
  </svg>
);

const FlagEN = () => (
  <svg className="w-6 h-4" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
    <clipPath id="t"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
    <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
    <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
  </svg>
);

const FlagDE = () => (
  <svg className="w-6 h-4" viewBox="0 0 5 3" xmlns="http://www.w3.org/2000/svg">
    <rect width="5" height="3" fill="#000"/>
    <rect width="5" height="2" y="1" fill="#D00"/>
    <rect width="5" height="1" y="2" fill="#FFCE00"/>
  </svg>
);

const FlagIT = () => (
  <svg className="w-6 h-4" viewBox="0 0 3 2" xmlns="http://www.w3.org/2000/svg">
    <rect width="3" height="2" fill="#CE2B37"/>
    <rect width="2" height="2" fill="#fff"/>
    <rect width="1" height="2" fill="#009246"/>
  </svg>
);

const FlagES = () => (
  <svg className="w-6 h-4" viewBox="0 0 750 500" xmlns="http://www.w3.org/2000/svg">
    <rect width="750" height="500" fill="#c60b1e"/>
    <rect width="750" height="250" y="125" fill="#ffc400"/>
  </svg>
);

const flagComponents: Record<string, () => React.JSX.Element> = {
  fr: FlagFR,
  en: FlagEN,
  de: FlagDE,
  it: FlagIT,
  es: FlagES,
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (langCode: 'fr' | 'en' | 'de' | 'it' | 'es') => {
    setLanguage(langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === language);
  const CurrentFlag = flagComponents[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm">
          {CurrentFlag && <CurrentFlag />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        sideOffset={5}
        className="w-16 bg-slate-900/95 backdrop-blur-xl border border-white/10 p-1.5"
      >
        {languages.map((lang) => {
          const Flag = flagComponents[lang.code];
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code as 'fr' | 'en' | 'de' | 'it' | 'es')}
              className={`flex items-center justify-center cursor-pointer rounded-lg p-2 transition-all ${
                language === lang.code 
                  ? 'bg-amber-500/20 border border-amber-500/30' 
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {Flag && <Flag />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
