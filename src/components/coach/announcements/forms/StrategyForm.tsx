'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';

const strategySchema = z.object({
  title: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  variant: z.string().min(1, 'Veuillez sélectionner une variante'),
  format: z.string().min(1, 'Veuillez sélectionner un format'),
  abiRange: z.string().min(1, 'Veuillez indiquer l\'ABI'),
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

type StrategyFormValues = z.infer<typeof strategySchema>;

interface StrategyFormProps {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const VARIANTS = [
  { value: 'MTT', label: 'MTT (Tournoi Multi-Tables)' },
  { value: 'CASH_GAME', label: 'Cash Game' },
  { value: 'SNG', label: 'Sit & Go' },
  { value: 'SPIN', label: 'Spin & Go' },
];

const FORMATS = [
  { value: 'NLHE', label: 'NLHE (No Limit Hold\'em)' },
  { value: 'PLO', label: 'PLO (Pot Limit Omaha)' },
  { value: 'PLO5', label: 'PLO5 (Pot Limit Omaha 5 cartes)' },
  { value: 'MIXED', label: 'Mixed (Mixte)' },
];

const DURATIONS = [
  { value: '30', label: '30 minutes' },
  { value: '60', label: '1 heure' },
  { value: '90', label: '1h30' },
  { value: '120', label: '2 heures' },
];

const COMMON_TAGS = ['ICM', '3-bet pot', 'Postflop', 'Preflop', 'GTO', 'Exploitant', 'Multi-tables', 'Bankroll'];

export function StrategyForm({ onSuccess, isLoading, setIsLoading }: StrategyFormProps) {
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const form = useForm<StrategyFormValues>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      title: '',
      variant: '',
      format: '',
      abiRange: '',
      durationMin: '60',
      priceCents: '',
      description: '',
      isActive: true,
    },
  });

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const onSubmit = async (data: StrategyFormValues) => {
    setIsLoading(true);
    try {
      const payload = {
        type: 'STRATEGY',
        title: data.title,
        variant: data.variant,
        format: data.format,
        abiRange: data.abiRange,
        durationMin: parseInt(data.durationMin, 10),
        priceCents: parseInt(data.priceCents, 10) * 100,
        description: data.description,
        tags,
        isActive: data.isActive,
      };

      console.log('📤 Envoi annonce Stratégie:', payload);

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
        {/* Titre */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de l&apos;annonce *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Coaching MTT - Stratégie ICM avancée" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Variante et Format */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="variant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Variante *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VARIANTS.map((variant) => (
                      <SelectItem key={variant.value} value={variant.value}>
                        {variant.label}
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
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez" />
                    </SelectTrigger>
                  </FormControl>
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

        {/* ABI Range */}
        <FormField
          control={form.control}
          name="abiRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ABI / Buy-in moyen *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: 20-25€" {...field} />
              </FormControl>
              <FormDescription>Indique la limite ciblée</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Durée et Prix */}
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
                    placeholder="80"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez le contenu de votre coaching..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tags */}
        <div className="space-y-3">
          <FormLabel>Tags (optionnel)</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {COMMON_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant={tags.includes(tag) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => tags.includes(tag) ? removeTag(tag) : addTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Ajouter un tag personnalisé"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
            />
            <Button type="button" variant="outline" onClick={() => addTag(tagInput)}>
              Ajouter
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <X
                    className="ml-1 h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
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
