'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { step2Schema, type Step2Data, type OnboardingData } from '@/types/coach';
import { Youtube, Twitter, Twitch } from 'lucide-react';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export function OnboardingStep2({ data, onNext, onBack }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      twitchUrl: data.twitchUrl || '',
      youtubeUrl: data.youtubeUrl || '',
      twitterUrl: data.twitterUrl || '',
      discordUrl: data.discordUrl || '',
    },
  });

  const onSubmit = (formData: Step2Data) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Liens sociaux
        </h2>
        <p className="text-gray-600">
          Partagez vos réseaux sociaux pour augmenter votre visibilité (optionnel)
        </p>
      </div>

      {/* Twitch */}
      <div>
        <Label htmlFor="twitchUrl" className="flex items-center gap-2">
          <Twitch className="h-4 w-4 text-purple-600" />
          Twitch
        </Label>
        <Input
          id="twitchUrl"
          {...register('twitchUrl')}
          placeholder="https://twitch.tv/votre-chaine"
          type="url"
        />
        {errors.twitchUrl && (
          <p className="text-sm text-red-600 mt-1">{errors.twitchUrl.message}</p>
        )}
      </div>

      {/* YouTube */}
      <div>
        <Label htmlFor="youtubeUrl" className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-600" />
          YouTube
        </Label>
        <Input
          id="youtubeUrl"
          {...register('youtubeUrl')}
          placeholder="https://youtube.com/@votre-chaine"
          type="url"
        />
        {errors.youtubeUrl && (
          <p className="text-sm text-red-600 mt-1">{errors.youtubeUrl.message}</p>
        )}
      </div>

      {/* Twitter/X */}
      <div>
        <Label htmlFor="twitterUrl" className="flex items-center gap-2">
          <Twitter className="h-4 w-4 text-blue-500" />
          Twitter / X
        </Label>
        <Input
          id="twitterUrl"
          {...register('twitterUrl')}
          placeholder="https://twitter.com/votre-compte"
          type="url"
        />
        {errors.twitterUrl && (
          <p className="text-sm text-red-600 mt-1">{errors.twitterUrl.message}</p>
        )}
      </div>

      {/* Discord */}
      <div>
        <Label htmlFor="discordUrl">Discord</Label>
        <Input
          id="discordUrl"
          {...register('discordUrl')}
          placeholder="votre-serveur-discord ou lien d'invitation"
        />
        <p className="text-sm text-gray-500 mt-1">
          Nom de votre serveur ou lien d'invitation
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Retour
        </Button>
        <Button type="submit" size="lg">
          Continuer
        </Button>
      </div>
    </form>
  );
}
