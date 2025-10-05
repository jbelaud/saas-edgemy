'use client';

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 mb-8 text-sm font-medium text-blue-100 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            Plateforme de coaching poker #1 en France
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
            Trouvez le coach de poker qui fera passer votre jeu au niveau supérieur
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Réservations faciles, suivi personnalisé, sessions Discord privées avec des pros de MTT, cash game et mindset. 
            <span className="text-blue-300 font-semibold"> L&apos;accompagnement poker nouvelle génération.</span>
          </p>
          
            <button 
              onClick={() => {
                const newsletter = document.getElementById('newsletter-section');
                newsletter?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-xl transition-all duration-300 hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
            >
              <span className="relative z-10">Rejoindre la waitlist</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
            </button>
          </div>
      </div>

      {/* Modern Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
