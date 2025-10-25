'use client';

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Grâce à Edgemy, j&apos;ai doublé mon ROI en 3 mois. Les coachs sont incroyables !",
      author: "Julien M.",
      role: "Joueur MTT",
      avatar: "JM"
    },
    {
      quote: "La plateforme parfaite pour gérer mes coachings. Simple, efficace, professionnelle.",
      author: "Sarah L.",
      role: "Coach professionnelle",
      avatar: "SL"
    },
    {
      quote: "J'ai enfin trouvé un coach qui comprend mon jeu. Les sessions sont ultra personnalisées.",
      author: "Marc D.",
      role: "Joueur Cash Game",
      avatar: "MD"
    },
    {
      quote: "En tant que coach, Edgemy me permet de me concentrer sur l'essentiel : mes élèves.",
      author: "Thomas R.",
      role: "Coach Spin&Go",
      avatar: "TR"
    }
  ];

  const stats = [
    { value: "100+", label: "Coachs actifs" },
    { value: "500+", label: "Sessions réalisées" },
    { value: "95%", label: "Satisfaction" }
  ];

  return (
    <section className="relative py-24 bg-slate-950">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Ils nous font confiance
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Découvre ce que nos utilisateurs pensent d'Edgemy
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-all duration-300"
            >
              {/* Quote */}
              <div className="mb-6">
                <svg className="w-8 h-8 text-emerald-400/20 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-gray-500 text-xs">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
