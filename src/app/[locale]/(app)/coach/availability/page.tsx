'use client';

import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { AvailabilityManager } from '@/components/coach/availability/AvailabilityManager';

export default function CoachAvailabilityPage() {
  return (
    <CoachLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Disponibilités
          </h1>
          <p className="text-gray-600">
            Gérez vos créneaux de disponibilité pour les réservations
          </p>
        </div>

        <AvailabilityManager />
      </div>
    </CoachLayout>
  );
}
