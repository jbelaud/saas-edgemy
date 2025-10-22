'use client';

import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerSettingsForm } from '@/components/player/settings/PlayerSettingsForm';

export default function PlayerSettingsPage() {
  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Paramètres
        </h1>
        <p className="text-gray-600">
          Gère les paramètres de ton profil
        </p>
      </div>

      <PlayerSettingsForm />
    </PlayerLayout>
  );
}
