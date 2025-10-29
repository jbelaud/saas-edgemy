'use client';

import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerSettingsForm } from '@/components/player/settings/PlayerSettingsForm';
import { GradientText } from '@/components/ui';

export default function PlayerSettingsPage() {
  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <GradientText variant="emerald">Paramètres</GradientText>
        </h1>
        <p className="text-gray-400 text-lg">
          Gère les paramètres de ton profil
        </p>
      </div>

      <PlayerSettingsForm />
    </PlayerLayout>
  );
}
