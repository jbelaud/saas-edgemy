'use client';

import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { GlassCard, GradientText } from '@/components/ui';
import { UsersRound, Rocket } from 'lucide-react';

export default function PlayerWorkgroupPage() {
  return (
    <PlayerLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <GradientText variant="emerald">Groupe de travail</GradientText>
          </h1>
          <p className="text-gray-400 text-lg">
            Collaborez avec d&apos;autres joueurs pour progresser ensemble
          </p>
        </div>

        {/* Message Phase 2 */}
        <div className="max-w-2xl mx-auto mt-12">
          <GlassCard className="p-8 text-center border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-blue-500/10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-slate-800/50 rounded-full p-4 shadow-lg border border-emerald-500/30">
                  <UsersRound className="h-12 w-12 text-emerald-400" />
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <Rocket className="h-5 w-5 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">
                Fonctionnalité à venir
              </h2>
            </div>
            
            <p className="text-gray-300 mb-6 text-lg">
              Les <span className="font-semibold text-emerald-400">groupes de travail</span> seront disponibles dans la <span className="font-semibold text-white">Phase 2</span> de l&apos;application.
            </p>
            
            <div className="bg-slate-800/30 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-3">Ce qui vous attend :</h3>
              <ul className="text-left space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Créez ou rejoignez des groupes de joueurs de votre niveau</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Partagez vos mains et recevez des feedbacks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Organisez des sessions d&apos;étude en groupe</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Suivez la progression collective du groupe</span>
                </li>
              </ul>
            </div>
            
            <p className="text-sm text-gray-400 mt-6">
              Restez connecté pour ne pas manquer le lancement ! 🚀
            </p>
          </GlassCard>
        </div>
      </div>
    </PlayerLayout>
  );
}
