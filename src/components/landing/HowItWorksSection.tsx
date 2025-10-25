'use client';

export function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Choisis ton coach',
      description: 'Explore les profils vérifiés de nos coachs experts en MTT, cash game et mindset. Compare leurs spécialités, tarifs et disponibilités.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      number: '02',
      title: 'Réserve ta session',
      description: 'Choisis un créneau qui te convient et paie en ligne de manière sécurisée via Stripe. Confirmation instantanée par email.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      number: '03',
      title: 'Progresse avec ton coach',
      description: 'Accède à ton dashboard pour revoir tes sessions, consulter les notes de ton coach et suivre ta progression au fil du temps.',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Comment ça marche ?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Trois étapes simples pour commencer ton parcours vers l'excellence au poker
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:border-amber-500/30 transition-all duration-300 hover:transform hover:scale-105"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-slate-950 font-bold text-xl shadow-xl shadow-amber-500/20">
                {step.number}
              </div>

              {/* Icon */}
              <div className="w-16 h-16 bg-gradient-to-br from-amber-500/10 to-amber-600/10 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-white mb-4">
                {step.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {step.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Connection Lines (Desktop) */}
        <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl">
          <svg className="w-full h-24" viewBox="0 0 1000 100" fill="none">
            <path
              d="M 100 50 Q 250 20, 400 50 T 700 50 T 900 50"
              stroke="url(#gradient)"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              opacity="0.3"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </section>
  );
}
