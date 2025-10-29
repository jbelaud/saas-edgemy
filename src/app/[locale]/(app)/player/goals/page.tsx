'use client';

import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerGoalsForm } from '@/components/player/goals/PlayerGoalsForm';
import { GradientText } from '@/components/ui';

export default function PlayerGoalsPage() {
  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <GradientText variant="emerald">Mes Objectifs</GradientText>
        </h1>
        <p className="text-gray-400 text-lg">
          Définis tes objectifs pour mieux progresser
        </p>
      </div>

      <PlayerGoalsForm />
    </PlayerLayout>
  );
}
