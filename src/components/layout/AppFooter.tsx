'use client';

import { MessageCircle, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function AppFooter() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const locale = routing.locales.includes(segments[0] ?? '')
    ? (segments[0] as string)
    : routing.defaultLocale;
  const localizedPath = (path: string) => `/${locale}/pages${path}`;

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="container mx-auto max-w-7xl px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          
          {/* Logo + Baseline */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-3">
              <Image
                src="/logos/logo-blanc-edgemy.png"
                alt="Edgemy Logo"
                width={360}
                height={128}
                className="h-20 w-auto"
              />
            </div>
            <p className="text-gray-600 text-sm">
              Coaching poker personnalisé pour joueurs francophones
            </p>
          </div>

          {/* Navigation + Legal */}
          <div className="text-center">
            <div className="flex flex-wrap justify-center space-x-6 text-sm mb-4">
              <Link href={localizedPath('/a-propos')} className="text-gray-600 hover:text-gray-900 transition-colors">
                À propos
              </Link>
              <Link 
                href={localizedPath('/contact')} 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Contact
              </Link>
              <Link href={localizedPath('/blog')} className="text-gray-600 hover:text-gray-900 transition-colors">
                Blog
              </Link>
            </div>
            <div className="flex flex-wrap justify-center space-x-4 text-xs text-gray-500">
              <Link href={localizedPath('/mentions-legales')} className="hover:text-gray-700 transition-colors">
                Mentions légales
              </Link>
              <Link href={localizedPath('/politique-de-confidentialite')} className="hover:text-gray-700 transition-colors">
                Confidentialité
              </Link>
            </div>
          </div>

          {/* Social + Copyright */}
          <div className="text-center md:text-right">
            <div className="flex justify-center md:justify-end space-x-3 mb-4">
              <a 
                href="https://x.com/edgemy_off" 
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 cursor-pointer"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://discord.gg/dYDEzbVz" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-600 cursor-pointer"
                aria-label="Discord"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-gray-500">
              © {currentYear} Edgemy. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
