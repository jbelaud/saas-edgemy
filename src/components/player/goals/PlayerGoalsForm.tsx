'use client';

import { useEffect, useState } from 'react';
import { fetchWithCsrf } from '@/lib/security/csrf-client';
import { useSession } from '@/lib/auth-client';
import { GlassCard, GradientButton, GradientText } from '@/components/ui';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, Target, Rocket, BarChart3, CalendarRange } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const POKER_FORMATS = [
  { id: 'MTT', label: 'MTT (Multi-Table Tournament)' },
  { id: 'Cash Game', label: 'Cash Game' },
  { id: 'SNG', label: 'SNG (Sit & Go)' },
  { id: 'Spin & Go', label: 'Spin & Go' },
  { id: 'NLHE', label: 'NLHE (No Limit Hold&apos;em)' },
  { id: 'PLO', label: 'PLO (Pot Limit Omaha)' },
  { id: 'PLO5', label: 'PLO5 (5 cartes)' },
];

export function PlayerGoalsForm() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  
  const [goals, setGoals] = useState('');
  const [formats, setFormats] = useState<string[]>([]);
  const [abi, setAbi] = useState('');
  const [winnings, setWinnings] = useState('');

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
        setGoals(player.goals || '');
        setFormats(player.formats || []);
        setAbi(player.abi?.toString() || '');
        setWinnings(player.winnings?.toString() || '');
      } catch (error) {
        console.error('Erreur:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos objectifs",
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

  const handleFormatToggle = (formatId: string) => {
    setFormats((prev) =>
      prev.includes(formatId)
        ? prev.filter((f) => f !== formatId)
        : [...prev, formatId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerId) return;

    setIsSaving(true);
    try {
      const response = await fetchWithCsrf(`/api/player/${playerId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          goals,
          formats,
          abi: abi ? parseFloat(abi) : null,
          winnings: winnings ? parseFloat(winnings) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde');
      }

      toast({
        title: "Objectifs sauvegardés",
        description: "Vos objectifs ont été mis à jour avec succès",
      });
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos objectifs",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero section */}
      <GlassCard className="border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                <Target className="h-6 w-6 text-emerald-300" />
              </div>
              <GradientText as="h2" variant="emerald" className="text-2xl font-semibold">
                Définis ton plan de progression
              </GradientText>
            </div>
            <p className="text-gray-300 max-w-2xl">
              Clarifie ta vision, priorise les formats qui comptent pour toi et suis tes objectifs financiers pour que chaque session soit un pas de plus vers le succès.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-gray-200">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                <CalendarRange className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Planifie tes sessions</p>
                <p className="text-xs text-gray-400">Des objectifs clairs pour des coachings ciblés</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Rocket className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Projection mensuelle</p>
                <p className="text-xs text-gray-400">Visualise ton ABI et tes gains visés</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <BarChart3 className="h-5 w-5 text-cyan-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Mesure tes progrès</p>
                <p className="text-xs text-gray-400">Un suivi pour toi et tes coachs</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                <Save className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <p className="font-semibold text-white">Sauvegarde instantanée</p>
                <p className="text-xs text-gray-400">Mets à jour tes objectifs à tout moment</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Objectif principal */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Target className="h-5 w-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Vision principale</h3>
                <p className="text-sm text-gray-400">Décris ce que tu veux accomplir dans les 3 à 6 prochains mois.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals" className="text-sm text-gray-300">Objectif principal</Label>
              <Textarea
                id="goals"
                placeholder="Exemple : Passer des micro-stakes aux low-stakes et deep run au moins un 50€ dans les deux prochains mois."
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                rows={5}
                className="border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-emerald-400"
              />
            </div>
          </section>

          {/* Formats préférés */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Rocket className="h-5 w-5 text-purple-300" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Formats prioritaires</h3>
                <p className="text-sm text-gray-400">Sélectionne les formats sur lesquels tu veux concentrer ton volume.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {POKER_FORMATS.map((format) => (
                <label
                  key={format.id}
                  htmlFor={format.id}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 cursor-pointer transition hover:border-emerald-400/60"
                >
                  <Checkbox
                    id={format.id}
                    checked={formats.includes(format.id)}
                    onCheckedChange={() => handleFormatToggle(format.id)}
                    className="h-4 w-4 border-white/30 data-[state=checked]:bg-emerald-400 data-[state=checked]:border-emerald-400"
                  />
                  <span className="text-sm text-gray-200">{format.label}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ABI moyen */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <BarChart3 className="h-5 w-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">ABI moyen cible</h3>
                  <p className="text-sm text-gray-400">Calcule la moyenne des buy-ins que tu veux jouer.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="abi" className="text-sm text-gray-300">ABI moyen (€)</Label>
                <Input
                  id="abi"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 25.00"
                  value={abi}
                  onChange={(e) => setAbi(e.target.value)}
                  className="border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-emerald-400"
                />
                <p className="text-xs text-gray-500">
                  Donne une cible réaliste pour que tes coachs adaptent leurs recommandations.
                </p>
              </div>
            </section>

            {/* Gains visés */}
            <section className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <Rocket className="h-5 w-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Objectif de gains</h3>
                  <p className="text-sm text-gray-400">Fixe un objectif mensuel pour suivre ta progression.</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="winnings" className="text-sm text-gray-300">Gains visés (€/mois)</Label>
                <Input
                  id="winnings"
                  type="number"
                  step="0.01"
                  placeholder="Ex: 1000.00"
                  value={winnings}
                  onChange={(e) => setWinnings(e.target.value)}
                  className="border border-white/10 bg-white/5 text-white placeholder:text-gray-500 focus:border-emerald-400"
                />
                <p className="text-xs text-gray-500">
                  Utilise cet objectif comme boussole pour tes prochains coachings.
                </p>
              </div>
            </section>
          </div>

          <div className="flex justify-end">
            <GradientButton type="submit" size="lg" variant="emerald" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Enregistrement en cours...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Enregistrer mes objectifs
                </>
              )}
            </GradientButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
