'use client';

import { PlayerLayout } from '@/components/player/layout/PlayerLayout';
import { PlayerSettingsForm } from '@/components/player/settings/PlayerSettingsForm';
import { GradientText } from '@/components/ui';
import { useTranslations } from 'next-intl';

export default function PlayerSettingsPage() {
  const t = useTranslations('player.settings');
  
  return (
    <PlayerLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <GradientText variant="emerald">{t('title')}</GradientText>
        </h1>
        <p className="text-gray-400 text-lg">
          {t('subtitle')}
        </p>
      </div>

      <PlayerSettingsForm />
    </PlayerLayout>
  );
}
