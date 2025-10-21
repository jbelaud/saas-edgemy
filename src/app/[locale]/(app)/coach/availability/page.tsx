'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { AvailabilityManager } from '@/components/coach/availability/AvailabilityManager';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Loader2, Zap, CheckCircle2 } from 'lucide-react';

export default function CoachAvailabilityPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
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
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="py-12">
              <div className="text-center mb-6">
                <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <p className="text-orange-900 font-semibold mb-2 text-xl">
                  Activez votre abonnement pour gérer vos disponibilités
                </p>
                <p className="text-orange-700 text-sm">
                  Débloquez toutes les fonctionnalités de la plateforme
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Calendrier intelligent</p>
                    <p className="text-xs text-gray-600">Gérez vos créneaux de disponibilité</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Synchronisation</p>
                    <p className="text-xs text-gray-600">Synchronisez avec votre calendrier personnel</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Réservations automatiques</p>
                    <p className="text-xs text-gray-600">Les élèves réservent sur vos créneaux libres</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Notifications</p>
                    <p className="text-xs text-gray-600">Recevez des rappels pour vos sessions</p>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
                  onClick={() => router.push(`/${locale}/coach/onboarding`)}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Activer mon abonnement maintenant
                </Button>
              </div>
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
