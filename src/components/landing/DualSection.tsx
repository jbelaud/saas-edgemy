'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';

export function DualSection() {
  const locale = useLocale();
  
  return (
    <section className="relative py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Edgemy s'adapte à toi
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Que tu sois joueur en quête de progression ou coach professionnel, nous avons la solution
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Player Card */}
          <div className="group relative bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/5 rounded-3xl p-10 overflow-hidden hover:border-emerald-500/30 transition-all duration-500">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Icon */}
            <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-4">
                Pour les joueurs
              </h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Trouve ton coach, réserve et progresse à ton rythme. Accède à un suivi personnalisé, 
                des analyses de mains détaillées et un accompagnement sur mesure.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Coachs experts vérifiés</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Réservation en quelques clics</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Dashboard de suivi complet</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Paiement sécurisé</span>
                </li>
              </ul>

              {/* CTA */}
              <Link
                href={`/${locale}/signup?context=player`}
                className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-emerald-500/20"
              >
                Créer un compte joueur
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          {/* Coach Card */}
          <div className="group relative bg-gradient-to-br from-slate-900 to-slate-900/50 border border-white/5 rounded-3xl p-10 overflow-hidden hover:border-amber-500/30 transition-all duration-500">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Icon */}
            <div className="relative z-10 w-20 h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10">
              <h3 className="text-3xl font-bold text-white mb-4">
                Pour les coachs
              </h3>
              <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                Gère ton activité, tes paiements et ta visibilité. Concentre-toi sur le coaching, 
                on s'occupe du reste : réservations, paiements et gestion administrative.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Profil professionnel optimisé</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Gestion automatisée des réservations</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Paiements automatiques sécurisés</span>
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Statistiques et analytics</span>
                </li>
              </ul>

              {/* CTA */}
              <Link
                href={`/${locale}/signup?context=coach`}
                className="inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold rounded-2xl transition-all transform hover:scale-105 shadow-xl shadow-amber-500/20"
              >
                Devenir coach sur Edgemy
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
