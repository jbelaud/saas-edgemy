'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const reviewSchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  reviewType: z.string().min(1, 'Veuillez sélectionner un type de review'),
  format: z.string().min(1, 'Veuillez sélectionner un format'),
  reviewSupport: z.string().min(1, 'Veuillez sélectionner un support'),
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

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const REVIEW_TYPES = [
  { value: 'SESSION_MTT', label: 'Session MTT' },
  { value: 'SESSION_CASH', label: 'Session Cash Game' },
  { value: 'HAND_SPECIFIC', label: 'Main spécifique' },
  { value: 'DATABASE', label: 'Database Review' },
];

const FORMATS = [
  { value: 'NLHE', label: 'NLHE (No Limit Hold\'em)' },
  { value: 'PLO', label: 'PLO (Pot Limit Omaha)' },
  { value: 'PLO5', label: 'PLO5 (Pot Limit Omaha 5 cartes)' },
  { value: 'MIXED', label: 'Mixed (Mixte)' },
];

const REVIEW_SUPPORTS = [
  { value: 'VIDEO_REPLAY', label: 'Replay vidéo' },
  { value: 'SCREEN_SHARE', label: 'Partage d\'écran' },
  { value: 'HAND_IMPORT', label: 'Main importée' },
  { value: 'SOFTWARE', label: 'Via logiciel (HM3, PT4, etc.)' },
];

const DURATIONS = [
  { value: '60', label: '1 heure' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2 heures' },
];

export function ReviewForm({ onSuccess, isLoading, setIsLoading }: ReviewFormProps) {
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      title: '',
      reviewType: '',
      format: '',
      reviewSupport: '',
      durationMin: '60',
      priceCents: '',
      description: '',
      isActive: true,
    },
  });

  const onSubmit = async (data: ReviewFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        type: 'REVIEW',
        title: data.title,
        reviewType: data.reviewType,
        format: data.format,
        reviewSupport: data.reviewSupport,
        durationMin: parseInt(data.durationMin, 10),
        priceCents: parseInt(data.priceCents, 10) * 100,
        description: data.description,
        isActive: data.isActive,
      };

      console.log('📤 Envoi annonce Review:', payload);

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
              <Input placeholder="Ex: Review de session MTT" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reviewType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de review *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {REVIEW_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Format *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reviewSupport"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Support de review *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez" />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_SUPPORTS.map((support) => (
                    <SelectItem key={support.value} value={support.value}>
                      {support.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  placeholder="100"
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
                placeholder="Détails sur le process de review..."
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
