'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { step1Schema, POKER_FORMATS, LANGUAGES, type Step1Data, type OnboardingData } from '@/types/coach';

interface Props {
  data: Partial<OnboardingData>;
  onNext: (data: Partial<OnboardingData>) => void;
}

export function OnboardingStep1({ data, onNext }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      bio: data.bio || '',
      formats: data.formats || [],
      stakes: data.stakes || '',
      roi: data.roi || undefined,
      experience: data.experience || undefined,
      languages: data.languages || [],
    },
  });

  const selectedFormats = watch('formats') || [];
  const selectedLanguages = watch('languages') || [];

  const toggleFormat = (format: string) => {
    const newFormats = selectedFormats.includes(format)
      ? selectedFormats.filter((f) => f !== format)
      : [...selectedFormats, format];
    setValue('formats', newFormats);
  };

  const toggleLanguage = (lang: string) => {
    const newLanguages = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    setValue('languages', newLanguages);
  };

  const onSubmit = (formData: Step1Data) => {
    onNext(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Informations personnelles
        </h2>
        <p className="text-gray-600">
          Présentez-vous et partagez votre expertise en poker
        </p>
      </div>

      {/* Prénom et Nom */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="Jean"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="Dupont"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio">Bio *</Label>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="Parlez de votre parcours, votre style de jeu, vos résultats..."
          rows={5}
          className="resize-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          {watch('bio')?.length || 0} / 500 caractères (min. 50)
        </p>
        {errors.bio && (
          <p className="text-sm text-red-600 mt-1">{errors.bio.message}</p>
        )}
      </div>

      {/* Formats */}
      <div>
        <Label>Formats enseignés *</Label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {POKER_FORMATS.map((format) => (
            <div key={format.value} className="flex items-center space-x-2">
              <Checkbox
                id={format.value}
                checked={selectedFormats.includes(format.value)}
                onCheckedChange={() => toggleFormat(format.value)}
              />
              <label
                htmlFor={format.value}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {format.label}
              </label>
            </div>
          ))}
        </div>
        {errors.formats && (
          <p className="text-sm text-red-600 mt-1">{errors.formats.message}</p>
        )}
      </div>

      {/* Stakes */}
      <div>
        <Label htmlFor="stakes">Limites jouées</Label>
        <Input
          id="stakes"
          {...register('stakes')}
          placeholder="Ex: NL50 à NL500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Optionnel - Indiquez les limites que vous jouez
        </p>
      </div>

      {/* ROI et Expérience */}
      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="experience">Années d'expérience</Label>
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
        <div className="grid grid-cols-3 gap-3 mt-2">
          {LANGUAGES.map((lang) => (
            <div key={lang.value} className="flex items-center space-x-2">
              <Checkbox
                id={lang.value}
                checked={selectedLanguages.includes(lang.value)}
                onCheckedChange={() => toggleLanguage(lang.value)}
              />
              <label
                htmlFor={lang.value}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {lang.label}
              </label>
            </div>
          ))}
        </div>
        {errors.languages && (
          <p className="text-sm text-red-600 mt-1">{errors.languages.message}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg">
          Continuer
        </Button>
      </div>
    </form>
  );
}
