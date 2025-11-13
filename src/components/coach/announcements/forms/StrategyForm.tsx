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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X, AlertCircle } from 'lucide-react';
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
  prerequisites: z.string().optional(),
  isActive: z.boolean(),
});

type StrategyFormValues = z.infer<typeof strategySchema>;

interface StrategyFormProps {
  onSuccess: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const VARIANTS = [
  { value: 'NLHE', label: 'NLHE (No Limit Hold\'em)' },
  { value: 'PLO', label: 'PLO (Pot Limit Omaha)' },
  { value: 'PLO5', label: 'PLO5 (Pot Limit Omaha 5 cartes)' },
  { value: 'MIXED', label: 'Mixed (Mixte)' },
];

const FORMATS = [
  { value: 'MTT', label: 'MTT (Tournoi Multi-Tables)' },
  { value: 'CASH_GAME', label: 'Cash Game' },
  { value: 'SNG', label: 'Sit & Go' },
  { value: 'SPIN', label: 'Spin & Go' },
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
  const [error, setError] = useState<string | null>(null);

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
      prerequisites: '',
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
    setError(null);
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
        prerequisites: data.prerequisites || null,
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
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Message d'erreur */}
        {error && (
          <Alert variant="destructive" className="border-red-500/50 bg-red-500/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

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
                  className="bg-slate-800/50 border-slate-600 focus:border-orange-500"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Prérequis */}
        <FormField
          control={form.control}
          name="prerequisites"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prérequis (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ex: Avoir un compte PokerStars, connaissances de base en ICM..."
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

        {/* Tags */}
        <div className="space-y-3">
          <FormLabel>Tags (optionnel)</FormLabel>
          <FormDescription className="text-sm text-gray-400 mb-3">
            Sélectionne les tags pertinents pour ta session
          </FormDescription>
          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_TAGS.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`cursor-pointer transition-all duration-200 ${
                  tags.includes(tag)
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white border-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-md'
                    : 'border-slate-600 bg-slate-800/50 text-slate-300 hover:bg-slate-700 hover:border-orange-500/50'
                }`}
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
              className="bg-slate-800/50 border-slate-600 focus:border-orange-500"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => addTag(tagInput)}
              className="border-slate-600 bg-slate-800 text-white hover:bg-orange-500/20 hover:border-orange-500"
            >
              Ajouter
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="mt-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">Tags sélectionnés :</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {tag}
                    <X
                      className="ml-1.5 h-3.5 w-3.5 cursor-pointer hover:text-orange-200 transition-colors"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
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
