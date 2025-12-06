'use client';

import { CheckCircle2, AlertCircle, Zap, MessageSquare } from 'lucide-react';
import { GlassCard, GradientButton } from '@/components/ui';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

interface PlayerOnboardingChecklistProps {
  isDiscordConnected: boolean;
}

export function PlayerOnboardingChecklist({
  isDiscordConnected,
}: PlayerOnboardingChecklistProps) {
  const locale = useLocale();
  const router = useRouter();

  const handleConnectDiscord = () => {
    router.push(`/${locale}/player/settings`);
  };

  // Si Discord est connecté, ne pas afficher la checklist
  if (isDiscordConnected) {
    return null;
  }

  return (
    <GlassCard className="mb-8 border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
      <div className="mb-6">
        <h2 className="text-white flex items-center gap-2 text-2xl font-bold mb-2">
          <Zap className="h-6 w-6 text-amber-400" />
          🚀 Une dernière étape avant de réserver !
        </h2>
        <p className="text-gray-300">
          Connecte ton compte Discord pour pouvoir réserver des sessions avec les coachs.
        </p>
      </div>

      <div className="space-y-3">
        {/* Étape Discord */}
        <div
          className="flex items-start gap-3 p-4 rounded-lg transition-all bg-amber-500/10 border border-amber-500/20"
        >
          <div className="mt-0.5">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1 text-amber-300">
              Connecter mon Discord
            </h3>
            <p className="text-sm text-gray-400 mb-3">
              Discord est utilisé pour communiquer avec ton coach. Un salon privé sera créé automatiquement lors de chaque réservation.
            </p>
            
            {/* Avantages */}
            <div className="bg-slate-800/50 rounded-lg p-3 mb-3">
              <p className="text-xs font-semibold text-gray-300 mb-2">Pourquoi Discord ?</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Salon privé créé automatiquement avec ton coach
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Communication directe et sécurisée
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Partage d&apos;écran pour les sessions de coaching
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                  Accès à la communauté Edgemy
                </li>
              </ul>
            </div>

            <GradientButton
              variant="amber"
              size="sm"
              onClick={handleConnectDiscord}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Connecter mon Discord
            </GradientButton>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
