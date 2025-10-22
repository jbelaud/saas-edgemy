'use client';

import { useEffect, useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const POKER_FORMATS = [
  { id: 'MTT', label: 'MTT (Multi-Table Tournament)' },
  { id: 'Cash Game', label: 'Cash Game' },
  { id: 'SNG', label: 'SNG (Sit & Go)' },
  { id: 'Spin & Go', label: 'Spin & Go' },
  { id: 'NLHE', label: 'NLHE (No Limit Hold\'em)' },
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
      const response = await fetch(`/api/player/${playerId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Définis tes objectifs</CardTitle>
          <CardDescription>
            Partage tes objectifs pour que tes coachs puissent mieux t'accompagner
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Objectif principal */}
          <div className="space-y-2">
            <Label htmlFor="goals">Objectif principal</Label>
            <Textarea
              id="goals"
              placeholder="Ex: Améliorer mon jeu en MTT, passer de micro-stakes à low-stakes..."
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              rows={4}
            />
          </div>

          {/* Formats préférés */}
          <div className="space-y-3">
            <Label>Formats préférés</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {POKER_FORMATS.map((format) => (
                <div key={format.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={format.id}
                    checked={formats.includes(format.id)}
                    onCheckedChange={() => handleFormatToggle(format.id)}
                  />
                  <label
                    htmlFor={format.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {format.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* ABI moyen */}
          <div className="space-y-2">
            <Label htmlFor="abi">ABI moyen (€)</Label>
            <Input
              id="abi"
              type="number"
              step="0.01"
              placeholder="Ex: 25.00"
              value={abi}
              onChange={(e) => setAbi(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Average Buy-In moyen de tes tournois
            </p>
          </div>

          {/* Gains visés */}
          <div className="space-y-2">
            <Label htmlFor="winnings">Gains visés (€/mois)</Label>
            <Input
              id="winnings"
              type="number"
              step="0.01"
              placeholder="Ex: 1000.00"
              value={winnings}
              onChange={(e) => setWinnings(e.target.value)}
            />
            <p className="text-sm text-gray-500">
              Objectif de gains mensuels
            </p>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Enregistrer mes objectifs
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
