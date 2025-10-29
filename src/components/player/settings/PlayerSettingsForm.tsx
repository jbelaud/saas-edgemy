'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, User, Globe, Bell, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ConnectDiscordButton } from '@/components/discord/ConnectDiscordButton';

const TIMEZONES = [
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'America/Montreal', label: 'America/Montreal (EST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
];

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'es', label: 'Español' },
];

export function PlayerSettingsForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const response = await fetch('/api/player/profile');
        if (!response.ok) {
          throw new Error('Erreur lors du chargement du profil');
        }

        const data = await response.json();
        const player = data.player;
        
        setPlayerId(player.id);
        setFirstName(player.firstName || '');
        setLastName(player.lastName || '');
        setTimezone(player.timezone || 'Europe/Paris');
        // La langue sera gérée par next-intl
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos paramètres",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchPlayerData();
    }
  }, [session, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/player/${playerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          timezone,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      toast({
        title: "Paramètres sauvegardés",
        description: "Vos paramètres ont été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos paramètres",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Profil */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <User className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Informations personnelles</h2>
              <p className="text-sm text-gray-400">Mets à jour tes informations de profil</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Prénom */}
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Jean"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Dupont"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          {/* Fuseau horaire */}
          <div className="space-y-2">
            <Label htmlFor="timezone">Fuseau horaire</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Sélectionner un fuseau horaire" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Utilisé pour planifier tes sessions de coaching
            </p>
          </div>

          {/* Langue préférée */}
          <div className="space-y-2">
            <Label htmlFor="language">Langue préférée</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger id="language">
                <SelectValue placeholder="Sélectionner une langue" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Langue de l&apos;interface (à venir)
            </p>
          </div>

            {/* Bouton de sauvegarde */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </GlassCard>

      {/* Section Discord */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[#5865F2]/10 rounded-lg">
              <svg
                className="h-5 w-5 text-[#5865F2]"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Connexion Discord</h2>
              <p className="text-sm text-gray-400">Connecte ton compte Discord pour accéder aux salons de tes sessions</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
            <h3 className="text-sm font-semibold text-white mb-3">Avantages de la connexion Discord</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Accès direct aux salons privés de tes sessions de coaching</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Communication vocale et écrite avec ton coach</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Historique des conversations sauvegardé</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>Notifications en temps réel pour tes sessions</span>
              </li>
            </ul>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-orange-300 mb-1">Sécurité et confidentialité</h4>
                <p className="text-xs text-orange-200/80">
                  Un seul compte Edgemy peut être lié à un compte Discord. Ton ID Discord est stocké de manière sécurisée et n'est utilisé que pour créer tes salons de session privés.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <ConnectDiscordButton />
            
            {/* Bouton pour rejoindre le serveur Discord (toujours visible) */}
            <div className="pt-2">
              <a
                href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || 'https://discord.gg/edgemy'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full"
              >
                <Button
                  variant="outline"
                  className="w-full border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50"
                >
                  <svg
                    className="mr-2 h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                  </svg>
                  Rejoindre le serveur Edgemy
                </Button>
              </a>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Nécessaire pour accéder aux salons de tes sessions
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Section Notifications (à venir) */}
      <GlassCard className="opacity-60">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Bell className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Notifications</h2>
              <p className="text-sm text-gray-400">Gère tes préférences de notifications</p>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">Bientôt disponible 🚀</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
