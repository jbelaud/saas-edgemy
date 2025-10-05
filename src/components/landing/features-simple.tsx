'use client';

import { Users, Target, Brain, Shield } from 'lucide-react';

export function LandingFeatures() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Pourquoi choisir Edgemy ?
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* For Players */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pour les joueurs
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Trouvez le coach parfait, réservez vos sessions et suivez votre progression.
            </p>
          </div>

          {/* For Coaches */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Pour les coachs
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Partagez votre expertise, créez vos offres et gérez vos réservations facilement.
            </p>
          </div>

          {/* Strategy + Mental */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Stratégie + Mental : La clé du succès
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Le poker ne se limite pas aux cartes. Sur Edgemy, trouvez des coachs spécialisés qui vous aideront à perfectionner votre stratégie et à renforcer votre mindset. Progressez avec un accompagnement sur-mesure pour jouer avec confiance et constance, même sous pression.
            </p>
          </div>

          {/* Security & Trust */}
          <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Une plateforme fiable et sécurisée
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              Nous garantissons un environnement de coaching transparent, sécurisé et de haute qualité. Chaque coach est vérifié et chaque session est optimisée pour maximiser votre progression sans perte de temps.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
