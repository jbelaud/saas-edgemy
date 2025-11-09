'use client';

import { useState } from 'react';

export function DualSection() {
  const [hoveredCard, setHoveredCard] = useState<'player' | 'coach' | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const coachPrice = isYearly ? '399' : '39';
  const coachPeriod = isYearly ? 'an' : 'mois';
  const coachDiscount = isYearly ? 'Économisez 15%' : '';
  const playerCommission = '5%';
  
  // Hauteur fixe pour les cartes
  const cardHeight = 'min-h-[680px]';

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
            className={`group relative p-10 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden ${cardHeight} flex flex-col`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent rounded-3xl transition-opacity duration-500 ${hoveredCard === 'player' ? 'opacity-100' : 'opacity-0'}`}></div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Header with Icon and Badge */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <span className="text-emerald-400 text-base font-semibold px-4 py-1.5">Pour les joueurs</span>
                </div>
              </div>

              {/* Title */}
              <div className="flex-1 flex flex-col items-center mb-6">
                <h3 className="text-3xl font-bold mb-2 text-white text-center">
                  Trouve ton coach idéal
                </h3>
                <div className="text-4xl font-extrabold text-emerald-400 mb-2">
                  Gratuit
                </div>
                <div className="text-sm text-gray-400 mb-4">
                  {playerCommission} de commission sur les réservations
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 mb-6 leading-relaxed text-center">
                Accès gratuit à tous les coachs. Payez uniquement les séances que vous réservez.
                Bénéficiez de tarifs dégressifs sur les packs d'heures.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {[
                  "Accès gratuit à la plateforme",
                  "5% de commission sur les réservations",
                  "Réductions sur les packs d'heures",
                  "Paiements sécurisés via Stripe"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-auto">
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
          </div>

          {/* Coach Card */}
          <div
            onMouseEnter={() => setHoveredCard('coach')}
            onMouseLeave={() => setHoveredCard(null)}
            className={`group relative p-10 bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all duration-500 hover:-translate-y-2 overflow-hidden ${cardHeight} flex flex-col`}
          >
            {/* Background Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent rounded-3xl transition-opacity duration-500 ${hoveredCard === 'coach' ? 'opacity-100' : 'opacity-0'}`}></div>

            <div className="relative z-10 flex flex-col h-full">
              {/* Header with Icon and Badge */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-2xl flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform flex-shrink-0">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-full">
                  <span className="text-amber-400 text-base font-semibold px-4 py-1.5">Pour les coachs</span>
                </div>
              </div>

              {/* Title */}
              <div className="flex-1 flex flex-col items-center mb-6">
                <h3 className="text-3xl font-bold mb-2 text-white text-center">
                  Développe ton activité
                </h3>
                
                {/* Toggle Annuel/Mensuel */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-gray-500'}`}>Mensuel</span>
                  <button 
                    onClick={() => setIsYearly(!isYearly)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    <span 
                      className={`${
                        isYearly ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                  </button>
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-gray-500'}`}>Annuel</span>
                    {isYearly && (
                      <span className="text-xs text-amber-400">-15%</span>
                    )}
                  </div>
                </div>

                {/* Prix */}
                <div className="text-center mb-4">
                  <span className="text-5xl font-extrabold text-amber-400">{coachPrice}€</span>
                  <span className="text-lg text-gray-400"> /{coachPeriod}</span>
                </div>
                <div className="h-6 mb-2">
                  {isYearly ? (
                    <div className="text-sm text-amber-400">
                      Soit seulement 33,25€/mois
                    </div>
                  ) : (
                    <div className="h-6">{/* Espace réservé pour maintenir la hauteur */}</div>
                  )}
                </div>
                <div className="text-sm text-gray-400 mb-2">
                  {isYearly ? 'Facturé 399€ par an' : 'Sans engagement'}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 mb-6 leading-relaxed text-center">
                Gère ton activité, tes paiements et ta visibilité en toute simplicité.
                Concentre-toi sur le coaching, on s'occupe du reste avec nos outils professionnels.
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {[
                  "39€/mois ou 399€/an (-15%)",
                  "Profil public personnalisable",
                  "Paiements automatisés et sécurisés",
                  "Outils de suivi élèves avancés"
                ].map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <div className="mt-auto">
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
      </div>
    </section>
  );
}
