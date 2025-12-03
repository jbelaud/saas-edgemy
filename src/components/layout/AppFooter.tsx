'use client';

import { MessageCircle, Twitter } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { routing } from '@/i18n/routing';

export function AppFooter() {
  const t = useTranslations('footer');
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const firstSegment = segments[0] ?? '';
  const locale = routing.locales.includes(firstSegment as typeof routing.locales[number])
    ? (firstSegment as typeof routing.locales[number])
    : routing.defaultLocale;
  const localizedPath = (path: string) => `/${locale}/pages${path}`;

  return (
    <footer className="relative bg-slate-950 border-t border-white/5 mt-auto">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          
          {/* Branding Column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
                <span className="text-slate-950 font-bold text-xl">E</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Edgemy
              </span>
            </Link>
            <p className="text-gray-400 text-sm font-medium mb-2">
              {t('tagline')}
            </p>
            <p className="text-gray-500 text-xs">
              {t('description')}
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('nav.title')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={localizedPath('/a-propos')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link href={localizedPath('/blog')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.blog')}
                </Link>
              </li>
              <li>
                <Link href={localizedPath('/contact')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('legal.title')}</h3>
            <ul className="space-y-3">
              <li>
                <Link href={localizedPath('/mentions-legales')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('legal.terms')}
                </Link>
              </li>
              <li>
                <Link href={localizedPath('/politique-de-confidentialite')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  {t('legal.privacy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('social.title')}</h3>
            <div className="flex gap-3">
              <a 
                href="https://discord.gg/dYDEzbVz" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label={t('social.discord')}
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/edgemy_off" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label={t('social.twitter')}
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              {t('copyright', { year: currentYear })}
            </p>
            <p className="text-gray-600 text-xs">
              {t('madeWith')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
