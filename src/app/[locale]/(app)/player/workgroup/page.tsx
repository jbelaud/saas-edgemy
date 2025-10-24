'use client';

import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { UsersRound, Rocket } from 'lucide-react';

export default function PlayerWorkgroupPage() {
  return (
    <PlayerLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Groupe de travail</h1>
          <p className="text-gray-600 mt-2">
            Collaborez avec d&apos;autres joueurs pour progresser ensemble
          </p>
        </div>

        {/* Message Phase 2 */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-white rounded-full p-4 shadow-lg">
                  <UsersRound className="h-12 w-12 text-emerald-600" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-emerald-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Fonctionnalité à venir
              </h2>
            </div>
            
            <p className="text-gray-700 mb-6 text-lg">
              Les <span className="font-semibold text-emerald-600">groupes de travail</span> seront disponibles dans la <span className="font-semibold">Phase 2</span> de l&apos;application.
            </p>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Ce qui vous attend :</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span>Créez ou rejoignez des groupes de joueurs de votre niveau</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span>Partagez vos mains et recevez des feedbacks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span>Organisez des sessions d&apos;étude en groupe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-600 mt-1">✓</span>
                  <span>Suivez la progression collective du groupe</span>
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
