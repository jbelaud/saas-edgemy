'use client';

export function WhyEdgemySection() {
  const features = [
    {
      title: 'Coachs vérifiés',
      description: 'Tous nos coachs sont rigoureusement sélectionnés et vérifiés. Profils détaillés avec résultats, spécialités et avis clients.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      title: 'Sessions personnalisées',
      description: 'Coaching 1-on-1 adapté à ton niveau, tes objectifs et ton style de jeu. Analyse de mains, stratégie et mindset.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Paiements sécurisés',
      description: 'Transactions 100% sécurisées via Stripe. Réservation simple, paiement instantané, remboursement garanti en cas d\'annulation.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      title: 'Suivi de progression',
      description: 'Dashboard complet pour suivre tes sessions, revoir les notes de ton coach, et visualiser ta progression au fil du temps.',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-600',
    },
  ];

  return (
    <section id="features" className="relative py-24 bg-gradient-to-b from-slate-950 to-slate-900">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Pourquoi choisir Edgemy ?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Une plateforme pensée pour les joueurs ambitieux et les coachs professionnels
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-all duration-300 hover:transform hover:-translate-y-2"
            >
              {/* Icon Container */}
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed text-sm">
                {feature.description}
              </p>

              {/* Glow Effect on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-3xl opacity-0 group-hover:opacity-5 transition-opacity blur-xl`}></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-400 mb-6">
            Rejoins des centaines de joueurs qui progressent déjà avec Edgemy
          </p>
          <a
            href="#coaches"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Découvrir nos coachs
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
