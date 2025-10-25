'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export function FinalCTASection() {
  const locale = useLocale();
  
  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Content */}
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Rejoins la communauté
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              Edgemy dès aujourd'hui
            </span>
          </h2>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Que tu sois joueur ou coach, commence ton parcours vers l'excellence. 
            Rejoins des centaines de membres qui progressent déjà avec Edgemy.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href={`/${locale}/signup?context=player`}
              className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-lg rounded-2xl transition-all transform hover:scale-105 shadow-2xl shadow-emerald-500/25 w-full sm:w-auto"
            >
              <span className="relative z-10">Créer un compte joueur</span>
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </Link>
            
            <Link
              href={`/${locale}/signup?context=coach`}
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-lg rounded-2xl transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/25 w-full sm:w-auto"
            >
              <span className="relative z-10">Devenir coach sur Edgemy</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Inscription gratuite</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Support 7j/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
