'use client';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Grâce à Edgemy, j'ai doublé mon ROI en 3 mois. Mon coach m'a aidé à identifier mes leaks et à optimiser ma stratégie MTT. La plateforme est super intuitive.",
      author: "Julien M.",
      role: "Joueur MTT",
      avatar: "JM",
      rating: 5,
    },
    {
      quote: "En tant que coach, Edgemy me permet de me concentrer sur l'essentiel : accompagner mes élèves. La gestion des paiements et des réservations est automatisée, c'est un gain de temps énorme.",
      author: "Sophie L.",
      role: "Coach Cash Game",
      avatar: "SL",
      rating: 5,
    },
    {
      quote: "J'étais sceptique au début, mais après ma première session, j'ai compris la valeur d'un bon coaching. Mon coach a analysé mes mains en profondeur et m'a donné des axes concrets de progression.",
      author: "Marc D.",
      role: "Joueur Cash Game",
      avatar: "MD",
      rating: 5,
    },
    {
      quote: "La qualité des coachs sur Edgemy est exceptionnelle. J'ai trouvé un coach spécialisé en mindset qui m'a aidé à gérer la variance et à rester focus. Mes résultats ont explosé !",
      author: "Laura K.",
      role: "Joueuse MTT",
      avatar: "LK",
      rating: 5,
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl">❝</div>
        <div className="absolute bottom-10 right-10 text-9xl rotate-180">❝</div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Ils progressent avec Edgemy
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Découvre les témoignages de joueurs et coachs qui utilisent Edgemy au quotidien
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-slate-900/80 to-slate-900/40 backdrop-blur-sm border border-white/5 rounded-3xl p-8 hover:border-amber-500/20 transition-all duration-300 hover:transform hover:-translate-y-2"
            >
              {/* Quote Icon */}
              <div className="absolute -top-3 -left-3 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-500/20">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 leading-relaxed mb-6 text-sm">
                "{testimonial.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500/20 to-amber-600/20 rounded-full flex items-center justify-center text-amber-400 font-bold border border-amber-500/30">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-white">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-16 pt-16 border-t border-white/5">
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
              100+
            </div>
            <div className="text-gray-400 text-sm">Coachs actifs</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-600 bg-clip-text text-transparent mb-2">
              500+
            </div>
            <div className="text-gray-400 text-sm">Joueurs accompagnés</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-600 bg-clip-text text-transparent mb-2">
              1000+
            </div>
            <div className="text-gray-400 text-sm">Sessions réalisées</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-2">
              4.9/5
            </div>
            <div className="text-gray-400 text-sm">Note moyenne</div>
          </div>
        </div>
      </div>
    </section>
  );
}
