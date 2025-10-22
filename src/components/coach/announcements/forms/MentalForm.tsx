'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const mentalSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  focus: z.string().min(1, 'Veuillez sélectionner un focus'),
  durationMin: z.string().min(1, 'La durée est requise'),
  priceCents: z.string()
    .min(1, 'Le prix est requis')
    .refine((val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0 && num <= 9999 && Number.isInteger(parseFloat(val));
    }, 'Le prix doit être un nombre entier entre 0€ et 9999€'),
  description: z.string().min(20, 'La description doit contenir au moins 20 caractères'),
  isActive: z.boolean(),
});

type MentalFormValues = z.infer<typeof mentalSchema>;

interface MentalFormProps {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FOCUS_AREAS = [
  { value: 'TILT_MANAGEMENT', label: 'Gestion du tilt' },
  { value: 'CONFIDENCE', label: 'Confiance en soi' },
  { value: 'CONCENTRATION', label: 'Concentration' },
  { value: 'STRESS_MANAGEMENT', label: 'Gestion du stress' },
  { value: 'DECISION_MAKING', label: 'Prise de décision' },
  { value: 'BANKROLL_PSYCHOLOGY', label: 'Psychologie de la bankroll' },
  { value: 'PERFORMANCE', label: 'Performance globale' },
];

const DURATIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 heure' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2 heures' },
];

export function MentalForm({ onSuccess, isLoading, setIsLoading }: MentalFormProps) {
  const form = useForm<MentalFormValues>({
    resolver: zodResolver(mentalSchema),
    defaultValues: {
      title: '',
      focus: '',
      durationMin: '60',
      priceCents: '',
      description: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: MentalFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        type: 'MENTAL',
        title: data.title,
        mentalFocus: data.focus,
        durationMin: parseInt(data.durationMin, 10),
        priceCents: parseInt(data.priceCents, 10) * 100,
        description: data.description,
        isActive: data.isActive,
      };

      console.log('📤 Envoi annonce Mental:', payload);

      const response = await fetch('/api/coach/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de l&apos;annonce *</FormLabel>
              <Input placeholder="Ex: Coaching mental - Gestion du tilt" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="focus"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Focus principal *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_AREAS.map((focus) => (
                    <SelectItem key={focus.value} value={focus.value}>
                      {focus.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Domaine principal du coaching mental
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="durationMin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
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
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="9999"
                  placeholder="80"
                  {...field}
                />
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
              <Textarea
                placeholder="Décrivez votre approche du coaching mental..."
                rows={5}
                {...field}
              />
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
              'Créer l\'annonce'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
