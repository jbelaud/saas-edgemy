'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from '@/lib/auth-client';
import { CoachLayout } from '@/components/coach/layout/CoachLayout';
import { GlassCard, GradientText } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Bell, Shield, CreditCard, CheckCircle2, XCircle } from 'lucide-react';
import { ConnectDiscordButton } from '@/components/discord/ConnectDiscordButton';
import { StripeConnectSettings } from '@/components/coach/settings/StripeConnectSettings';
import { SubscriptionSettings } from '@/components/coach/settings/SubscriptionSettings';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSearchParams } from 'next/navigation';
import { useAlertDialog } from '@/hooks/useAlertDialog';
import { AlertDialogCustom } from '@/components/ui/alert-dialog-custom';

export default function CoachSettingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCancelMessage, setShowCancelMessage] = useState(false);
  const { alertState, showSuccess, showError, closeAlert } = useAlertDialog();
  const [coachData, setCoachData] = useState<{
    firstName: string;
    lastName: string;
    timezone: string;
  } | null>(null);

  // Vérifier les paramètres de retour Stripe
  useEffect(() => {
    if (searchParams.get('plan_changed') === 'true') {
      setShowSuccessMessage(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setShowSuccessMessage(false), 5000);
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    }
    if (searchParams.get('plan_change_cancelled') === 'true') {
      setShowCancelMessage(true);
      // Masquer le message après 5 secondes
      setTimeout(() => setShowCancelMessage(false), 5000);
      // Nettoyer l'URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const response = await fetch('/api/coach/profile');
        if (response.ok) {
          const data = await response.json();
          const coach = data?.coach ?? data ?? {};
          setCoachData({
            firstName: coach.firstName || '',
            lastName: coach.lastName || '',
            timezone: coach.timezone || 'Europe/Paris',
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
        body: JSON.stringify({
          firstName: coachData.firstName,
          lastName: coachData.lastName,
          timezone: coachData.timezone,
        }),
      });

      if (response.ok) {
        showSuccess(
          'Paramètres enregistrés',
          'Vos paramètres ont été enregistrés avec succès !'
        );
      } else {
        showError(
          'Erreur',
          'Une erreur est survenue lors de l\'enregistrement de vos paramètres.'
        );
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      showError(
        'Erreur',
        'Une erreur est survenue lors de l\'enregistrement de vos paramètres.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = useMemo(() => {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone');
    }

    return [
      'UTC',
      'Europe/Paris',
      'Europe/London',
      'America/New_York',
      'America/Los_Angeles',
      'America/Sao_Paulo',
      'Africa/Casablanca',
      'Africa/Johannesburg',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Singapore',
      'Asia/Dubai',
      'Australia/Sydney',
      'Pacific/Auckland',
    ];
  }, []);

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

        {/* Messages de retour Stripe */}
        {showSuccessMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <p className="text-green-300 font-semibold">
                Votre changement de plan a été effectué avec succès !
              </p>
            </div>
          </div>
        )}

        {showCancelMessage && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-orange-400" />
              <p className="text-orange-300 font-semibold">
                Le changement de plan a été annulé.
              </p>
            </div>
          </div>
        )}

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
                  <Label htmlFor="firstName" className="text-white/80">
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
                    className="mt-1 text-white placeholder:text-white/40 border-white/20 focus-visible:ring-emerald-400/40"
                  />
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-white/80">
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
                    className="mt-1 text-white placeholder:text-white/40 border-white/20 focus-visible:ring-emerald-400/40"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-white/80">
                  Fuseau horaire
                </Label>
                <Select
                  value={coachData?.timezone || 'Europe/Paris'}
                  onValueChange={(value) =>
                    setCoachData((prev) =>
                      prev ? { ...prev, timezone: value } : { firstName: '', lastName: '', timezone: value }
                    )
                  }
                >
                  <SelectTrigger className="w-full justify-between rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10 focus-visible:ring-emerald-400/40">
                    <SelectValue placeholder="Choisir un fuseau horaire" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 bg-slate-900/95 text-white">
                    <SelectGroup>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone} value={timezone} className="text-sm text-white">
                          {timezone}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Ce fuseau sera utilisé pour planifier vos disponibilités et envoyer les rappels.
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isLoading}
                size="sm"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </GlassCard>

          {/* Gestion de l'abonnement */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Mon abonnement
              </h2>
            </div>

            <SubscriptionSettings />
          </GlassCard>

          {/* Stripe Professionnel */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-sky-500/20 rounded-lg">
                <svg
                  className="h-5 w-5 text-sky-300"
                  viewBox="0 0 32 32"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M27.87 9.08C26.4 8.43 24.3 7.84 21.38 7.84c-4.68 0-7.85 2.03-7.85 6.2 0 4.44 3.84 4.49 7.02 4.9 2.35.3 3.2.74 3.2 1.81 0 1.5-1.88 1.73-3.4 1.73-2.26 0-3.46-.35-5.31-1.17l-.75-.35-.79 4.8c1.33.61 3.77 1.14 6.31 1.17 5.32 0 8.14-2.05 8.14-6.35 0-4.88-3.98-4.56-7.05-4.91-2.37-.26-3.2-.73-3.2-1.78 0-.97.98-1.68 3.12-1.68 1.88 0 3.49.32 4.63.83l.55.26.78-4.64z" />
                  <path d="M12.18 8.22H7.68L3.9 23.4h4.5l3.78-15.18z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white">
                Compte professionnel Stripe
              </h2>
            </div>

            <StripeConnectSettings />
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

              <Button
                onClick={() => window.open(process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/2f3tJdJ3Q2', '_blank')}
                variant="outline"
                size="sm"
                className="w-full border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 font-medium"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Voir le serveur Discord Edgemy
              </Button>

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

      {/* Modal d'alerte */}
      <AlertDialogCustom
        open={alertState.open}
        onOpenChange={closeAlert}
        title={alertState.title}
        description={alertState.description}
        type={alertState.type}
      />
    </CoachLayout>
  );
}
