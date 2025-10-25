'use client';

export function MissionSection() {
  return (
    <section id="about" className="relative py-32 bg-slate-950 overflow-hidden">
      {/* Background Image Overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-emerald-500/20"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium text-amber-100 bg-amber-500/10 backdrop-blur-sm border border-amber-400/20 rounded-full">
            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Notre mission
          </div>

          {/* Main Title */}
          <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              Rendre le coaching poker
            </span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
              plus humain et accessible
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 leading-relaxed">
            Nous croyons qu'un bon accompagnement fait toute la différence. 
            C'est pourquoi nous avons créé Edgemy : une plateforme qui connecte 
            les joueurs ambitieux aux meilleurs coachs, dans un environnement 
            de confiance et de qualité.
          </p>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Value 1 */}
            <div className="group relative bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-amber-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-xl flex items-center justify-center text-amber-400 mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Communauté</h3>
              <p className="text-gray-400 text-sm">
                Créer un écosystème où joueurs et coachs se rencontrent et progressent ensemble
              </p>
            </div>

            {/* Value 2 */}
            <div className="group relative bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-xl flex items-center justify-center text-emerald-400 mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Qualité</h3>
              <p className="text-gray-400 text-sm">
                Sélectionner rigoureusement les meilleurs coachs pour garantir un accompagnement d'excellence
              </p>
            </div>

            {/* Value 3 */}
            <div className="group relative bg-gradient-to-br from-slate-900/50 to-slate-900/30 backdrop-blur-sm border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-xl flex items-center justify-center text-blue-400 mb-4 mx-auto group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Simplicité</h3>
              <p className="text-gray-400 text-sm">
                Offrir une expérience fluide et intuitive, du premier contact jusqu'au suivi de progression
              </p>
            </div>
          </div>

          {/* Quote */}
          <div className="relative bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-10">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-amber-500/20">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
            </div>
            <blockquote className="text-xl md:text-2xl text-gray-300 italic leading-relaxed mt-6">
              "Le poker est un jeu de stratégie, de psychologie et de discipline. 
              Avec le bon coach, chaque joueur peut révéler son plein potentiel."
            </blockquote>
            <div className="mt-6 text-amber-400 font-semibold">
              — L'équipe Edgemy
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
