'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GlassCard, GradientButton, Input, Label, Checkbox } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User, Target, Globe } from 'lucide-react';
import { POKER_FORMATS, LANGUAGES } from '@/types/coach';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  bio: z.string().min(50, 'Minimum 50 caractères').max(1000),
  methodology: z.string().min(50, 'Minimum 50 caractères').max(1000).optional().or(z.literal('')),
  pokerFormats: z.array(z.string()).min(1, 'Sélectionnez au moins un format'),
  stakes: z.string().optional(),
  roi: z.number().optional(),
  experience: z.number().min(0),
  languages: z.array(z.string()).min(1, 'Sélectionnez au moins une langue'),
  twitchUrl: z.string().url().optional().or(z.literal('')),
  youtubeUrl: z.string().url().optional().or(z.literal('')),
  twitterUrl: z.string().url().optional().or(z.literal('')),
  discordUrl: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

import type { CoachWithRelations } from '@/types/dashboard';

interface DashboardProfileProps {
  coach: CoachWithRelations;
}

export function DashboardProfile({ coach }: DashboardProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: coach.firstName || '',
      lastName: coach.lastName || '',
      bio: coach.bio || '',
      methodology: coach.methodology || '',
      pokerFormats: coach.pokerFormats || [],
      stakes: coach.stakes || '',
      roi: coach.roi || undefined,
      experience: coach.experience || 0,
      languages: coach.languages || [],
      twitchUrl: coach.twitchUrl || '',
      youtubeUrl: coach.youtubeUrl || '',
      twitterUrl: coach.twitterUrl || '',
      discordUrl: coach.discordUrl || '',
    },
  });

  const selectedFormats = watch('pokerFormats') || [];
  const selectedLanguages = watch('languages') || [];

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/coach/onboard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });
      
      // Recharger la page après 1 seconde
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Une erreur est survenue' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl border ${
          message.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Informations personnelles */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">Informations personnelles</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Vos informations de base visibles sur votre profil public
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName" className="text-gray-300">Prénom *</Label>
              <Input 
                id="firstName" 
                {...register('firstName')} 
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
              />
              {errors.firstName && (
                <p className="text-sm text-red-400 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName" className="text-gray-300">Nom *</Label>
              <Input 
                id="lastName" 
                {...register('lastName')} 
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
              />
              {errors.lastName && (
                <p className="text-sm text-red-400 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bio" className="text-gray-300">Biographie *</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              rows={6}
              placeholder="Parlez de votre parcours, votre style de jeu, vos résultats..."
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
            {errors.bio && (
              <p className="text-sm text-red-400 mt-1">{errors.bio.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="methodology" className="text-gray-300">Méthodologie de coaching</Label>
            <Textarea
              id="methodology"
              {...register('methodology')}
              rows={6}
              placeholder="Décrivez votre approche pédagogique, vos méthodes d'enseignement, comment vous structurez vos sessions..."
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
            {errors.methodology && (
              <p className="text-sm text-red-400 mt-1">{errors.methodology.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Optionnel - Sera affiché dans une section dédiée sur votre profil public
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Expertise Poker */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">Expertise Poker</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Vos spécialités et compétences
        </p>
        <div className="space-y-4">
          {/* Formats */}
          <div>
            <Label className="text-gray-300">Formats de poker *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {POKER_FORMATS.map((format) => (
                <div key={format.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format.value}`}
                    checked={selectedFormats.includes(format.value)}
                    onCheckedChange={(checked) => {
                      const newFormats = checked
                        ? [...selectedFormats, format.value]
                        : selectedFormats.filter((f) => f !== format.value);
                      setValue('pokerFormats', newFormats);
                    }}
                  />
                  <label htmlFor={`format-${format.value}`} className="text-sm cursor-pointer text-gray-300">
                    {format.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.pokerFormats && (
              <p className="text-sm text-red-400 mt-1">{errors.pokerFormats.message}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stakes" className="text-gray-300">Limites jouées</Label>
              <Input
                id="stakes"
                {...register('stakes')}
                placeholder="ex: NL50-NL200"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
              />
            </div>
            <div>
              <Label htmlFor="roi" className="text-gray-300">ROI (%)</Label>
              <Input
                id="roi"
                type="number"
                step="0.1"
                {...register('roi', { valueAsNumber: true })}
                placeholder="15.5"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
              />
            </div>
            <div>
              <Label htmlFor="experience" className="text-gray-300">Années d&apos;expérience</Label>
              <Input
                id="experience"
                type="number"
                {...register('experience', { valueAsNumber: true })}
                placeholder="5"
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
              />
            </div>
          </div>

          {/* Langues */}
          <div>
            <Label className="text-gray-300">Langues parlées *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {LANGUAGES.map((lang) => (
                <div key={lang.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang.value}`}
                    checked={selectedLanguages.includes(lang.value)}
                    onCheckedChange={(checked) => {
                      const newLangs = checked
                        ? [...selectedLanguages, lang.value]
                        : selectedLanguages.filter((l) => l !== lang.value);
                      setValue('languages', newLangs);
                    }}
                  />
                  <label htmlFor={`lang-${lang.value}`} className="text-sm cursor-pointer text-gray-300">
                    {lang.label}
                  </label>
                </div>
              ))}
            </div>
            {errors.languages && (
              <p className="text-sm text-red-400 mt-1">{errors.languages.message}</p>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Réseaux sociaux */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
          <Globe className="h-5 w-5 text-amber-400" />
          <h3 className="text-xl font-bold text-white">Réseaux sociaux</h3>
        </div>
        <p className="text-sm text-gray-400 mb-6">
          Liens vers vos profils (optionnel)
        </p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="twitchUrl" className="text-gray-300">Twitch</Label>
            <Input
              id="twitchUrl"
              {...register('twitchUrl')}
              placeholder="https://twitch.tv/votre-chaine"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
          </div>
          <div>
            <Label htmlFor="youtubeUrl" className="text-gray-300">YouTube</Label>
            <Input
              id="youtubeUrl"
              {...register('youtubeUrl')}
              placeholder="https://youtube.com/@votre-chaine"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
          </div>
          <div>
            <Label htmlFor="twitterUrl" className="text-gray-300">Twitter/X</Label>
            <Input
              id="twitterUrl"
              {...register('twitterUrl')}
              placeholder="https://twitter.com/votre-compte"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
          </div>
          <div>
            <Label htmlFor="discordUrl" className="text-gray-300">Discord</Label>
            <Input
              id="discordUrl"
              {...register('discordUrl')}
              placeholder="votre-serveur-discord ou lien d&apos;invitation"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500/50"
            />
          </div>
        </div>
      </GlassCard>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <GradientButton 
          type="submit" 
          variant="amber"
          size="lg" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer les modifications
            </>
          )}
        </GradientButton>
      </div>
    </form>
  );
}
