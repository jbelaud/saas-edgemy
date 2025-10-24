'use client';

import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { Wallet, Rocket } from 'lucide-react';

export default function PlayerBankrollPage() {
  return (
    <PlayerLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bankroll</h1>
          <p className="text-gray-600 mt-2">
            Gérez et suivez l'évolution de votre bankroll
          </p>
        </div>

        {/* Message Phase 2 */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <Wallet className="h-12 w-12 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Fonctionnalité à venir
              </h2>
            </div>
            
            <p className="text-gray-700 mb-6 text-lg">
              Le <span className="font-semibold text-blue-600">gestionnaire de bankroll</span> sera disponible dans la <span className="font-semibold">Phase 2</span> de l'application.
            </p>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Ce qui vous attend :</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Suivez l'évolution de votre bankroll en temps réel</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Visualisez vos gains et pertes avec des graphiques détaillés</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Définissez des objectifs de bankroll et suivez votre progression</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Recevez des alertes de gestion de bankroll personnalisées</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">✓</span>
                  <span>Exportez vos données pour une analyse approfondie</span>
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              Restez connecté pour ne pas manquer le lancement ! 🚀
            </p>
          </div>
        </div>
      </div>
    </PlayerLayout>
  );
}
