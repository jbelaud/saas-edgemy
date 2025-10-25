'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (langCode: 'fr' | 'en' | 'de' | 'it' | 'es') => {
    setLanguage(langCode);
  };

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all border border-white/10 hover:border-white/20 backdrop-blur-sm">
          <span className="text-xl">{currentLanguage?.flag}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-14 bg-slate-900/95 backdrop-blur-xl border border-white/10 p-1"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code as 'fr' | 'en' | 'de' | 'it' | 'es')}
            className={`flex items-center justify-center cursor-pointer rounded-lg p-2 transition-all ${
              language === lang.code 
                ? 'bg-amber-500/20 border border-amber-500/30' 
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="text-xl">{lang.flag}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
