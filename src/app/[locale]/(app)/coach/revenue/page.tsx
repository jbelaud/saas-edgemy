'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro, TrendingUp, Calendar, DollarSign, ArrowUpRight, Loader2, Zap, CheckCircle2 } from 'lucide-react';

export default function CoachRevenuePage() {
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
              Revenus
            </h1>
            <p className="text-gray-600">
              Suivez vos revenus et statistiques financières
            </p>
          </div>
          <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardContent className="py-12">
              <div className="text-center mb-6">
                <Euro className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <p className="text-orange-900 font-semibold mb-2 text-xl">
                  Activez votre abonnement pour suivre vos revenus
                </p>
                <p className="text-orange-700 text-sm">
                  Débloquez toutes les fonctionnalités de la plateforme
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-w-2xl mx-auto">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Statistiques détaillées</p>
                    <p className="text-xs text-gray-600">Suivez vos revenus en temps réel</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Paiements sécurisés</p>
                    <p className="text-xs text-gray-600">Recevez vos paiements directement</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Historique complet</p>
                    <p className="text-xs text-gray-600">Accédez à l&apos;historique de toutes vos transactions</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 text-sm">Rapports mensuels</p>
                    <p className="text-xs text-gray-600">Générez des rapports pour votre comptabilité</p>
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
            Revenus
          </h1>
          <p className="text-gray-600">
            Suivez vos revenus et statistiques financières
          </p>
        </div>

        {/* Stats principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenus ce mois
              </CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 €</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+0%</span> vs mois dernier
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sessions ce mois
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Aucune session réalisée
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenu moyen/session
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 €</div>
              <p className="text-xs text-muted-foreground">
                Pas encore de données
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Croissance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">
                Tendance mensuelle
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Graphique des revenus */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des revenus</CardTitle>
            <CardDescription>
              Vos revenus des 12 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Aucune donnée de revenus pour le moment
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Commencez à donner des sessions pour voir vos statistiques
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dernières transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Dernières transactions</CardTitle>
            <CardDescription>
              Historique de vos paiements reçus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg">
              <p className="text-gray-600">
                Aucune transaction pour le moment
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Informations de paiement */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de paiement</CardTitle>
            <CardDescription>
              Gérez vos informations bancaires pour recevoir vos paiements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Compte Stripe</p>
                  <p className="text-sm text-gray-600">
                    Non configuré
                  </p>
                </div>
                <span className="text-sm text-orange-600 font-medium">
                  Action requise
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Vous devez configurer votre compte Stripe pour recevoir des paiements.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CoachLayout>
  );
}
