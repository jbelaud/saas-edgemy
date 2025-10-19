'use client';

import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Plus } from 'lucide-react';

export default function CoachAvailabilityPage() {
  return (
    <CoachLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Disponibilités
            </h1>
            <p className="text-gray-600">
              Gérez vos créneaux de disponibilité
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un créneau
          </Button>
        </div>

        {/* Calendrier de disponibilités */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendrier
            </CardTitle>
            <CardDescription>
              Définissez vos créneaux de disponibilité pour les réservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Aucun créneau de disponibilité défini
                </p>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer mon premier créneau
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de réservation */}
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de réservation</CardTitle>
            <CardDescription>
              Configurez les règles de réservation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Délai minimum de réservation</p>
                <p className="text-sm text-gray-600">
                  Temps minimum avant une session
                </p>
              </div>
              <span className="text-sm text-gray-900">24 heures</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Durée des sessions</p>
                <p className="text-sm text-gray-600">
                  Durée par défaut d'une session
                </p>
              </div>
              <span className="text-sm text-gray-900">1 heure</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Pause entre sessions</p>
                <p className="text-sm text-gray-600">
                  Temps de repos entre deux sessions
                </p>
              </div>
              <span className="text-sm text-gray-900">15 minutes</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </CoachLayout>
  );
}
