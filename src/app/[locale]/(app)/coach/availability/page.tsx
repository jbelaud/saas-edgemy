'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { AvailabilityManager } from '@/components/coach/availability/AvailabilityManager';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Loader2 } from 'lucide-react';

export default function CoachAvailabilityPage() {
  const { data: session, isPending } = useSession();
  const [coachStatus, setCoachStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoachStatus = async () => {
      try {
        const response = await fetch('/api/coach/dashboard');
        if (response.ok) {
          const data = await response.json();
          setCoachStatus(data.coach.status);
        }
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchCoachStatus();
    }
  }, [session]);

  if (isPending || isLoading) {
    return (
      <CoachLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </CoachLayout>
    );
  }

  const isInactive = coachStatus === 'INACTIVE';

  if (isInactive) {
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
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <p className="text-orange-900 font-semibold mb-2 text-lg">
                Abonnement requis
              </p>
              <p className="text-orange-700 text-sm">
                Vous devez activer votre abonnement pour gérer vos disponibilités
              </p>
            </CardContent>
          </Card>
        </div>
      </CoachLayout>
    );
  }

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
