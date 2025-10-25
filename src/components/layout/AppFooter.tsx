'use client';

import { MessageCircle, Twitter } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function AppFooter() {
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
              Coaching poker. Simplifi&eacute;.
            </p>
            <p className="text-gray-500 text-xs">
              La plateforme qui connecte joueurs ambitieux et coachs d'excellence.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <a href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  À propos
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <Link href={localizedPath('/contact')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-3">
              <li>
                <Link href={localizedPath('/mentions-legales')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  CGU
                </Link>
              </li>
              <li>
                <Link href={localizedPath('/politique-de-confidentialite')} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Suivez-nous</h3>
            <div className="flex gap-3">
              <a 
                href="https://discord.gg/dYDEzbVz" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Discord"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href="https://x.com/edgemy_off" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="X (Twitter)"
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
              © {currentYear} Edgemy. Tous droits réservés.
            </p>
            <p className="text-gray-600 text-xs">
              Fait avec ❤️ pour la communauté poker
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
