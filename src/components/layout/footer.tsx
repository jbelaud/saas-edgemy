'use client';

import { MessageCircle, Twitter } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { routing } from '@/i18n/routing';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const pathname = usePathname();
  const segments = pathname?.split('/').filter(Boolean) ?? [];
  const firstSegment = segments[0] ?? '';
  const locale = routing.locales.includes(firstSegment as typeof routing.locales[number])
    ? (firstSegment as typeof routing.locales[number])
    : routing.defaultLocale;
  const localizedPath = (path: string) => `/${locale}/pages${path}`;

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        
        {/* CTA Final avec dégradé */}
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center mb-12 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-center mb-1">
              <Image
                src="/logos/logo-blanc-transparent-edgemy.png"
                alt="Edgemy Logo"
                width={300}
                height={80}
                className="h-20 w-auto"
              />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Rejoignez la communauté Edgemy !
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Boostez votre poker dès aujourd&apos;hui et soyez parmi les premiers à découvrir notre plateforme
            </p>
            <button 
              onClick={() => {
                const newsletter = document.getElementById('newsletter-section');
                newsletter?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Rejoindre la waitlist
            </button>
          </div>
        </div>

        {/* Footer Simple */}
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
                href="https://discord.gg/2f3tJdJ3Q2" 
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
