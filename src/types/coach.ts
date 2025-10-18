import { z } from 'zod';

// Étape 1 : Informations personnelles
export const step1Schema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  bio: z.string().min(50, 'La bio doit contenir au moins 50 caractères').max(500, 'La bio ne peut pas dépasser 500 caractères'),
  formats: z.array(z.string()).min(1, 'Sélectionnez au moins un format'),
  stakes: z.string().optional(),
  roi: z.number().optional(),
  experience: z.number().min(0, 'L\'expérience doit être positive').optional(),
  languages: z.array(z.string()).min(1, 'Sélectionnez au moins une langue'),
});

// Étape 2 : Liens sociaux
export const step2Schema = z.object({
  twitchUrl: z.string().url('URL Twitch invalide').optional().or(z.literal('')),
  youtubeUrl: z.string().url('URL YouTube invalide').optional().or(z.literal('')),
  twitterUrl: z.string().url('URL Twitter/X invalide').optional().or(z.literal('')),
  discordUrl: z.string().optional(),
});

// Étape 3 : Médias
export const step3Schema = z.object({
  avatarUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

// Étape 4 : Stripe Connect
export const step4Schema = z.object({
  stripeAccountId: z.string().optional(),
});

// Étape 5 : Abonnement
export const step5Schema = z.object({
  subscriptionId: z.string().optional(),
});

// Type complet du formulaire
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;

export type OnboardingData = Step1Data & Step2Data & Step3Data & Step4Data & Step5Data;

// Formats de poker disponibles
export const POKER_FORMATS = [
  { value: 'MTT', label: 'Multi-Table Tournament (MTT)' },
  { value: 'CASH', label: 'Cash Game' },
  { value: 'SNG', label: 'Sit & Go' },
  { value: 'SPIN', label: 'Spin & Go' },
  { value: 'MENTAL', label: 'Mental Game' },
  { value: 'GTO', label: 'GTO Strategy' },
];

// Langues disponibles
export const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'es', label: 'Español' },
];
