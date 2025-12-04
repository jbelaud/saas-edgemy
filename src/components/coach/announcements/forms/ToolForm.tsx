'use client';

import { fetchWithCsrf } from '@/lib/security/csrf-client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const toolSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  toolName: z.string().min(1, 'Veuillez indiquer le nom de l\'outil'),
  toolObjective: z.string().min(1, 'Veuillez sélectionner un objectif'),
  durationMin: z.string().min(1, 'La durée est requise'),
  priceCents: z.string()
    .min(1, 'Le prix est requis')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0 && num <= 9999 && Number.isInteger(parseFloat(val));
    }, 'Le prix doit être un nombre entier entre 0€ et 9999€'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  prerequisites: z.string().optional(),
  isActive: z.boolean(),
});

type ToolFormValues = z.infer<typeof toolSchema>;

interface ToolFormProps {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const TOOLS = [
  { value: 'GTO_WIZARD', label: 'GTO Wizard' },
  { value: 'HM3', label: 'Hold\'em Manager 3' },
  { value: 'PT4', label: 'PokerTracker 4' },
  { value: 'PIOSOLVER', label: 'PioSolver' },
  { value: 'FLOPZILLA', label: 'Flopzilla' },
  { value: 'ICMIZER', label: 'ICMizer' },
  { value: 'MENTAL', label: 'Mental' },
  { value: 'OTHER', label: 'Autre' },
];

const OBJECTIVES = [
  { value: 'ONBOARDING', label: 'Prise en main' },
  { value: 'ADVANCED', label: 'Optimisation avancée' },
  { value: 'SPOT_ANALYSIS', label: 'Analyse de spots' },
];

const DURATIONS = [
  { value: '60', label: '1 heure' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2 heures' },
];

export function ToolForm({ onSuccess, isLoading, setIsLoading }: ToolFormProps) {
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ToolFormValues>({
    resolver: zodResolver(toolSchema),
    defaultValues: {
      title: '',
      toolName: '',
      toolObjective: '',
      durationMin: '60',
      priceCents: '',
      description: '',
      prerequisites: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: ToolFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        type: 'TOOL',
        title: data.title,
        toolName: data.toolName,
        toolObjective: data.toolObjective,
        durationMin: parseInt(data.durationMin, 10),
        priceCents: parseInt(data.priceCents, 10) * 100,
        description: data.description,
        prerequisites: data.prerequisites || null,
        isActive: data.isActive,
      };

      console.log('📤 Envoi annonce Tool:', payload);

      const response = await fetchWithCsrf('/api/coach/announcement', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la création de l\'annonce');
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur:', error);
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de l&apos;annonce *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Prise en main GTO Wizard" {...field} className="bg-slate-800/50 border-slate-600 focus:border-orange-500" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="toolName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de l&apos;outil *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TOOLS.map((tool) => (
                      <SelectItem key={tool.value} value={tool.value}>
                        {tool.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="toolObjective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Objectif *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {OBJECTIVES.map((obj) => (
                      <SelectItem key={obj.value} value={obj.value}>
                        {obj.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="durationMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DURATIONS.map((duration) => (
                      <SelectItem key={duration.value} value={duration.value}>
                        {duration.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priceCents"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (€) *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="1"
                    min="0"
                    max="9999"
                    placeholder="70"
                    {...field}
                    className="bg-slate-800/50 border-slate-600 focus:border-orange-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Détail du contenu..."
                  rows={5}
                  {...field}
                  className="bg-slate-800/50 border-slate-600 focus:border-orange-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="prerequisites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prérequis (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Avoir un compte PokerStars, connaissances de base..."
                  rows={3}
                  {...field}
                  className="bg-slate-800/50 border-slate-600 focus:border-orange-500"
                />
              </FormControl>
              <FormDescription className="text-gray-400">
                Indiquez les prérequis nécessaires pour cette session
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              'Créer l&apos;annonce'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
