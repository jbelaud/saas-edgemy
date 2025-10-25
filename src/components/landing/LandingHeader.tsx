'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';

export function LandingHeader() {
  const locale = useLocale();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-slate-950 font-bold text-xl">E</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Edgemy
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link 
              href={`/${locale}/coachs`}
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Découvrir les coachs
            </Link>
            <Link 
              href="#features" 
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Fonctionnalités
            </Link>
            <Link 
              href="#for-players" 
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Pour les joueurs
            </Link>
            <Link 
              href="#for-coaches" 
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Pour les coachs
            </Link>
            <Link 
              href="#about" 
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              À propos
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href={`/${locale}/dashboard`}
              className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Se connecter
            </Link>
            <Link
              href={`/${locale}/signup`}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl font-semibold text-sm transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20"
            >
              Créer un compte
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-300 hover:text-white"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-white/5">
            <nav className="flex flex-col gap-4">
              <Link
                href={`/${locale}/coachs`}
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Découvrir les coachs
              </Link>
              <Link
                href="#features"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Fonctionnalités
              </Link>
              <Link
                href="#for-players"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pour les joueurs
              </Link>
              <Link
                href="#for-coaches"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Pour les coachs
              </Link>
              <Link
                href="#about"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                À propos
              </Link>
              <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                <Link
                  href={`/${locale}/dashboard`}
                  className="px-5 py-3 text-center text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href={`/${locale}/signup`}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl font-semibold text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Créer un compte
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
