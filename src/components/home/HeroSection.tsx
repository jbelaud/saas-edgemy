'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export function HeroSection() {
  const locale = useLocale();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            {/* Main Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Progressez au poker
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                avec un coach 1-to-1
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              La plateforme qui connecte les joueurs sérieux à des coachs passionnés.
              Choisissez votre coach, planifiez vos sessions, progressez à votre rythme.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
              <Link
                href={`/${locale}/coachs`}
                className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-lg rounded-xl transition-all transform hover:scale-105 shadow-xl shadow-amber-500/20 w-full sm:w-auto text-center"
              >
                <span className="relative z-10">Trouver un coach</span>
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              </Link>
              <button
                onClick={() => {
                  const event = new CustomEvent('openLoginModal');
                  window.dispatchEvent(event);
                }}
                className="px-8 py-4 border border-gray-700 hover:bg-gray-800/50 text-white font-medium text-lg rounded-xl transition-all w-full sm:w-auto"
              >
                Créer un compte joueur
              </button>
            </div>

            {/* Assurance Line */}
            <p className="text-sm text-gray-500 mb-8">
              Sans engagement — Paiement sécurisé — Plateforme en lancement
            </p>

            {/* Coach CTA */}
            <div className="text-center lg:text-left">
              <span className="text-gray-400 text-sm">
                Vous êtes coach ?{' '}
                <a
                  href={`/${locale}/coach/inscription`}
                  className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                >
                  Rejoignez notre plateforme
                </a>
              </span>
            </div>
          </div>

          {/* Mockup Placeholder */}
          <div className="relative hidden lg:block">
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-1 shadow-2xl border border-slate-700/50">
              <div className="bg-slate-900 rounded-xl p-4 h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 text-amber-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="3" x2="16" y2="21"></line>
                      <line x1="3" y1="9" x2="21" y2="9"></line>
                      <line x1="3" y1="15" x2="16" y2="15"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-200 mb-1">Interface de coaching</h3>
                  <p className="text-sm text-gray-400">Calendrier intégré • Suivi de progression • Paiements sécurisés</p>
                </div>
              </div>
              {/* Badge Bêta */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Version bêta
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
