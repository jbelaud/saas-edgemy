'use client';

import { useState } from 'react';

export function DualSection() {
  const [hoveredCard, setHoveredCard] = useState<'player' | 'coach' | null>(null);

  return (
    <section id="for-players" className="relative py-24 bg-slate-950">
      <div id="for-coaches" className="absolute -top-20"></div>
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Edgemy s&apos;adapte à ton profil
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Que tu sois joueur ou coach, trouve ta place dans la communauté
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Player Card */}
          <div
            onMouseEnter={() => setHoveredCard('player')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative p-10 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl transition-opacity duration-500 ${hoveredCard === 'player' ? 'opacity-100' : 'opacity-0'}`}></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>

              {/* Badge */}
              <div className="inline-block px-4 py-1.5 mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <span className="text-emerald-400 text-sm font-semibold">Pour les joueurs</span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold mb-4 text-white">
                Trouve ton coach idéal
              </h3>

              {/* Description */}
              <p className="text-gray-400 mb-8 leading-relaxed">
                Trouve ton coach, réserve et progresse à ton rythme. Accède à des coachs vérifiés, 
                un suivi personnalisé et des outils pour tracker ta progression.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {[
                  "Profils de coachs vérifiés",
                  "Réservation en ligne simple",
                  "Dashboard de suivi complet",
                  "Paiements sécurisés"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button 
                onClick={() => {
                  const event = new CustomEvent('openLoginModal');
                  window.dispatchEvent(event);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/20"
              >
                Créer un compte joueur
              </button>
            </div>
          </div>

          {/* Coach Card */}
          <div
            onMouseEnter={() => setHoveredCard('coach')}
            onMouseLeave={() => setHoveredCard(null)}
            className="group relative p-10 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent rounded-3xl transition-opacity duration-500 ${hoveredCard === 'coach' ? 'opacity-100' : 'opacity-0'}`}></div>

            <div className="relative z-10">
              {/* Icon */}
              <div className="w-16 h-16 mb-6 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>

              {/* Badge */}
              <div className="inline-block px-4 py-1.5 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-full">
                <span className="text-amber-400 text-sm font-semibold">Pour les coachs</span>
              </div>

              {/* Title */}
              <h3 className="text-3xl font-bold mb-4 text-white">
                Développe ton activité
              </h3>

              {/* Description */}
              <p className="text-gray-400 mb-8 leading-relaxed">
                Gère ton activité, tes paiements et ta visibilité. Concentre-toi sur le coaching, 
                on s&apos;occupe du reste avec des outils professionnels.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {[
                  "Profil public personnalisable",
                  "Gestion d'agenda intégrée",
                  "Paiements automatisés",
                  "Outils de suivi élèves"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button 
                onClick={() => {
                  const event = new CustomEvent('openCoachModal');
                  window.dispatchEvent(event);
                }}
                className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-amber-500/20"
              >
                Devenir coach sur Edgemy
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
