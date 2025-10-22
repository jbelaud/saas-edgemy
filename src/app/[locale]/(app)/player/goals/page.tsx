'use client';

import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerGoalsForm } from '@/components/player/goals/PlayerGoalsForm';

export default function PlayerGoalsPage() {
  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Mes objectifs
        </h1>
        <p className="text-gray-600">
          Définis tes objectifs pour mieux progresser
        </p>
      </div>

      <PlayerGoalsForm />
    </PlayerLayout>
  );
}
