'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Save, User, Image as ImageIcon } from 'lucide-react';
import { POKER_FORMATS, LANGUAGES } from '@/types/coach';

const profileSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  bio: z.string().min(50, 'Minimum 50 caractères').max(1000),
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

interface DashboardProfileProps {
  coach: any;
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
        <Card className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-6">
            <p className={message.type === 'success' ? 'text-green-900' : 'text-red-900'}>
              {message.text}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informations personnelles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informations personnelles
          </CardTitle>
          <CardDescription>
            Vos informations de base visibles sur votre profil public
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input id="firstName" {...register('firstName')} />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="lastName">Nom *</Label>
              <Input id="lastName" {...register('lastName')} />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Biographie *</Label>
            <Textarea
              id="bio"
              {...register('bio')}
              rows={6}
              placeholder="Parlez de votre parcours, votre style de jeu, vos résultats..."
            />
            {errors.bio && (
              <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expertise Poker */}
      <Card>
        <CardHeader>
          <CardTitle>Expertise Poker</CardTitle>
          <CardDescription>
            Vos spécialités et compétences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formats */}
          <div>
            <Label>Formats de poker *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {POKER_FORMATS.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format}`}
                    checked={selectedFormats.includes(format)}
                    onCheckedChange={(checked) => {
                      const newFormats = checked
                        ? [...selectedFormats, format]
                        : selectedFormats.filter((f) => f !== format);
                      setValue('pokerFormats', newFormats);
                    }}
                  />
                  <label htmlFor={`format-${format}`} className="text-sm cursor-pointer">
                    {format}
                  </label>
                </div>
              ))}
            </div>
            {errors.pokerFormats && (
              <p className="text-sm text-red-600 mt-1">{errors.pokerFormats.message}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="stakes">Limites jouées</Label>
              <Input
                id="stakes"
                {...register('stakes')}
                placeholder="ex: NL50-NL200"
              />
            </div>
            <div>
              <Label htmlFor="roi">ROI (%)</Label>
              <Input
                id="roi"
                type="number"
                step="0.1"
                {...register('roi', { valueAsNumber: true })}
                placeholder="15.5"
              />
            </div>
            <div>
              <Label htmlFor="experience">Années d&apos;expérience</Label>
              <Input
                id="experience"
                type="number"
                {...register('experience', { valueAsNumber: true })}
                placeholder="5"
              />
            </div>
          </div>

          {/* Langues */}
          <div>
            <Label>Langues parlées *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {LANGUAGES.map((lang) => (
                <div key={lang} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${lang}`}
                    checked={selectedLanguages.includes(lang)}
                    onCheckedChange={(checked) => {
                      const newLangs = checked
                        ? [...selectedLanguages, lang]
                        : selectedLanguages.filter((l) => l !== lang);
                      setValue('languages', newLangs);
                    }}
                  />
                  <label htmlFor={`lang-${lang}`} className="text-sm cursor-pointer">
                    {lang}
                  </label>
                </div>
              ))}
            </div>
            {errors.languages && (
              <p className="text-sm text-red-600 mt-1">{errors.languages.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Réseaux sociaux */}
      <Card>
        <CardHeader>
          <CardTitle>Réseaux sociaux</CardTitle>
          <CardDescription>
            Liens vers vos profils (optionnel)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="twitchUrl">Twitch</Label>
            <Input
              id="twitchUrl"
              {...register('twitchUrl')}
              placeholder="https://twitch.tv/votre-chaine"
            />
          </div>
          <div>
            <Label htmlFor="youtubeUrl">YouTube</Label>
            <Input
              id="youtubeUrl"
              {...register('youtubeUrl')}
              placeholder="https://youtube.com/@votre-chaine"
            />
          </div>
          <div>
            <Label htmlFor="twitterUrl">Twitter/X</Label>
            <Input
              id="twitterUrl"
              {...register('twitterUrl')}
              placeholder="https://twitter.com/votre-compte"
            />
          </div>
          <div>
            <Label htmlFor="discordUrl">Discord</Label>
            <Input
              id="discordUrl"
              {...register('discordUrl')}
              placeholder="votre-serveur-discord ou lien d&apos;invitation"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="submit" size="lg" disabled={isLoading}>
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
        </Button>
      </div>
    </form>
  );
}
