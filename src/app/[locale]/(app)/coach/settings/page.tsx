'use client';

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { GlassCard, GradientText } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Bell, Shield } from 'lucide-react';
import { ConnectDiscordButton } from '@/components/discord/ConnectDiscordButton';

export default function CoachSettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [coachData, setCoachData] = useState<{
    firstName: string;
    lastName: string;
    timezone: string;
  } | null>(null);

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const response = await fetch('/api/coach/profile');
        if (response.ok) {
          const data = await response.json();
          setCoachData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            timezone: data.timezone || 'Europe/Paris',
          });
        }
      } catch (error) {
        console.error('Erreur chargement profil coach:', error);
      }
    };

    if (session?.user) {
      fetchCoachData();
    }
  }, [session]);

  const handleSave = async () => {
    if (!coachData) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/coach/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(coachData),
      });

      if (response.ok) {
        alert('Paramètres enregistrés avec succès !');
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CoachLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <GradientText className="text-4xl font-bold mb-2">
            Paramètres
          </GradientText>
          <p className="text-gray-400">
            Gérez vos informations personnelles et vos préférences
          </p>
        </div>

        <div className="space-y-6">
          {/* Informations personnelles */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Informations personnelles
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-gray-300">
                    Prénom
                  </Label>
                  <Input
                    id="firstName"
                    value={coachData?.firstName || ''}
                    onChange={(e) =>
                      setCoachData((prev) =>
                        prev ? { ...prev, firstName: e.target.value } : null
                      )
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-gray-300">
                    Nom
                  </Label>
                  <Input
                    id="lastName"
                    value={coachData?.lastName || ''}
                    onChange={(e) =>
                      setCoachData((prev) =>
                        prev ? { ...prev, lastName: e.target.value } : null
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="timezone" className="text-gray-300">
                  Fuseau horaire
                </Label>
                <Input
                  id="timezone"
                  value={coachData?.timezone || ''}
                  onChange={(e) =>
                    setCoachData((prev) =>
                      prev ? { ...prev, timezone: e.target.value } : null
                    )
                  }
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </GlassCard>

          {/* Connexion Discord */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[#5865F2]/20 rounded-lg">
                <svg
                  className="h-5 w-5 text-[#5865F2]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Connexion Discord
              </h2>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm text-blue-300 mb-2 font-semibold">
                  Pourquoi connecter Discord ?
                </p>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>✅ Salons privés automatiques pour chaque élève</li>
                  <li>✅ Communication directe avec vos élèves</li>
                  <li>✅ Historique des conversations conservé</li>
                  <li>✅ Sessions vocales pour le coaching en direct</li>
                </ul>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-300 mb-1">
                    Sécurité et confidentialité
                  </p>
                  <p className="text-xs text-gray-400">
                    Un seul compte Discord par coach. Vos données sont sécurisées et ne sont jamais partagées.
                  </p>
                </div>
              </div>

              <ConnectDiscordButton />

              <p className="text-xs text-gray-500 mt-2">
                💡 Nécessaire pour créer automatiquement les salons Discord avec vos élèves
              </p>
            </div>
          </GlassCard>

          {/* Notifications */}
          <GlassCard className="p-6 opacity-60">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Bell className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Notifications
              </h2>
            </div>

            <p className="text-gray-400 text-sm">
              Bientôt disponible 🚀
            </p>
          </GlassCard>
        </div>
      </div>
    </CoachLayout>
  );
}
