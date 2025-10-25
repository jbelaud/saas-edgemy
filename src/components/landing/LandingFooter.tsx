'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export function LandingFooter() {
  const locale = useLocale();
  
  return (
    <footer className="relative bg-slate-950 border-t border-white/5">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
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
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Coaching poker. Simplifié.
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
                <Link href={`/${locale}/coachs`} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Découvrir les coachs
                </Link>
              </li>
              <li>
                <Link href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link href="#for-players" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pour les joueurs
                </Link>
              </li>
              <li>
                <Link href="#for-coaches" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Pour les coachs
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-400 hover:text-white transition-colors text-sm">
                  À propos
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ressources</h3>
            <ul className="space-y-3">
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                  FAQ
                </a>
              </li>
              <li>
                <Link href={`/${locale}/blog`} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Centre d'aide
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-3 mb-6">
              <li>
                <Link href={`/${locale}/mentions-legales`} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/politique-de-confidentialite`} className="text-gray-400 hover:text-white transition-colors text-sm">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <a href="#cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookies
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <h3 className="text-white font-semibold mb-4">Suivez-nous</h3>
            <div className="flex gap-3">
              <a
                href="https://discord.gg/dYDEzbVz"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="Discord"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>
              <a
                href="https://x.com/edgemy_off"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                aria-label="X (Twitter)"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Edgemy. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Paiements sécurisés par Stripe
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Données protégées
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
