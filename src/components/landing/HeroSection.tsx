'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export function HeroSection() {
  const locale = useLocale();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Background Effects */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        {/* Poker Cards Subtle Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 text-6xl">♠</div>
          <div className="absolute top-40 right-20 text-5xl">♥</div>
          <div className="absolute bottom-32 left-1/4 text-4xl">♣</div>
          <div className="absolute bottom-20 right-1/3 text-5xl">♦</div>
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-amber-100 bg-amber-500/10 backdrop-blur-sm border border-amber-400/20 rounded-full">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            +100 coachs déjà inscrits — des centaines de joueurs accompagnés
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Progresse plus vite.
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent">
              Avec les meilleurs coachs de poker.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-12 text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Edgemy te connecte à des coachs vérifiés pour des sessions personnalisées, 
            un suivi intelligent et une gestion simplifiée de ta bankroll.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href={`/${locale}/coachs`}
              className="group relative px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-lg rounded-2xl transition-all transform hover:scale-105 shadow-2xl shadow-amber-500/25 w-full sm:w-auto"
            >
              <span className="relative z-10">Trouver un coach</span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </Link>
            
            <Link
              href={`/${locale}/signup?context=coach`}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm text-white font-semibold text-lg rounded-2xl border border-white/10 hover:border-white/20 transition-all w-full sm:w-auto"
            >
              Devenir coach sur Edgemy
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Coachs vérifiés</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Paiements sécurisés</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Suivi personnalisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent"></div>
    </section>
  );
}
