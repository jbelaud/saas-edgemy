import { z } from 'zod';

/**
 * Schémas de validation Zod réutilisables pour les APIs
 * 
 * Usage:
 * ```ts
 * import { updateCoachProfileSchema } from '@/lib/validation/schemas';
 * 
 * const validatedData = updateCoachProfileSchema.parse(body);
 * ```
 */

// ============================================
// Schémas de base réutilisables
// ============================================

/** Email valide */
export const emailSchema = z.string().email('Adresse email invalide').toLowerCase().trim();

/** Mot de passe sécurisé (min 8 caractères) */
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(100, 'Le mot de passe est trop long');

/** ID CUID (format Prisma) */
export const cuidSchema = z.string().cuid('ID invalide');

/** UUID */
export const uuidSchema = z.string().uuid('UUID invalide');

/** Nom (prénom ou nom de famille) */
export const nameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(50, 'Le nom est trop long')
  .trim();

/** Texte court (titre, sujet) */
export const shortTextSchema = z
  .string()
  .min(1, 'Ce champ est requis')
  .max(200, 'Le texte est trop long')
  .trim();

/** Texte long (description, contenu) */
export const longTextSchema = z
  .string()
  .min(1, 'Ce champ est requis')
  .max(5000, 'Le texte est trop long')
  .trim();

/** Prix en centimes (positif) */
export const priceCentsSchema = z
  .number()
  .int('Le prix doit être un entier')
  .min(0, 'Le prix ne peut pas être négatif');

/** Note (1-5) */
export const ratingSchema = z
  .number()
  .int()
  .min(1, 'La note minimum est 1')
  .max(5, 'La note maximum est 5');

/** URL valide */
export const urlSchema = z.string().url('URL invalide');

/** Fuseau horaire */
export const timezoneSchema = z.string().refine(
  (tz) => {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Fuseau horaire invalide' }
);

// ============================================
// Schémas pour les profils
// ============================================

/** Mise à jour du profil coach */
export const updateCoachProfileSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  timezone: timezoneSchema.optional(),
  bio: longTextSchema.optional(),
  hourlyRate: priceCentsSchema.optional(),
});

/** Mise à jour du profil joueur */
export const updatePlayerProfileSchema = z.object({
  name: nameSchema.optional(),
  timezone: timezoneSchema.optional(),
});

// ============================================
// Schémas pour les réservations
// ============================================

/** Création d'une réservation */
export const createReservationSchema = z.object({
  announcementId: cuidSchema,
  coachId: cuidSchema,
  startDate: z.string().datetime('Date de début invalide'),
  endDate: z.string().datetime('Date de fin invalide'),
  packId: cuidSchema.optional(),
  type: z.enum(['SINGLE', 'PACK']).default('SINGLE'),
});

/** Création d'une session Stripe */
export const createStripeSessionSchema = z.object({
  reservationId: cuidSchema,
  coachId: cuidSchema,
  playerEmail: emailSchema,
  coachName: nameSchema.optional(),
  type: z.enum(['SINGLE', 'PACK']).optional(),
  locale: z.string().length(2).optional(),
});

// ============================================
// Schémas pour les avis
// ============================================

/** Création d'un avis */
export const createReviewSchema = z.object({
  coachId: cuidSchema,
  reservationId: cuidSchema.optional(),
  rating: ratingSchema,
  comment: longTextSchema.optional(),
});

/** Mise à jour d'un avis */
export const updateReviewSchema = z.object({
  rating: ratingSchema.optional(),
  comment: longTextSchema.optional(),
  isPublic: z.boolean().optional(),
});

// ============================================
// Schémas pour les notes coach
// ============================================

/** Création/mise à jour d'une note */
export const coachNoteSchema = z.object({
  content: longTextSchema,
});

// ============================================
// Schémas pour les disponibilités
// ============================================

/** Création d'une disponibilité */
export const createAvailabilitySchema = z.object({
  start: z.string().datetime('Date de début invalide'),
  end: z.string().datetime('Date de fin invalide'),
}).refine(
  (data) => new Date(data.start) < new Date(data.end),
  { message: 'La date de fin doit être après la date de début' }
);

// ============================================
// Schémas pour l'inscription
// ============================================

/** Inscription à la newsletter/liste d'attente */
export const subscriberSchema = z.object({
  email: emailSchema,
  role: z.enum(['PLAYER', 'COACH'], {
    message: 'Veuillez sélectionner votre rôle',
  }),
});

// ============================================
// Schémas pour les packs
// ============================================

/** Création d'un pack */
export const createPackSchema = z.object({
  announcementId: cuidSchema,
  hours: z.number().int().min(1).max(100),
  discountPercent: z.number().int().min(0).max(50),
  description: shortTextSchema.optional(),
});

// ============================================
// Schémas pour l'admin
// ============================================

/** Confirmation paiement LITE */
export const confirmLitePaymentSchema = z.object({
  coachId: cuidSchema,
  plan: z.enum(['LITE', 'PRO']),
  confirmed: z.boolean(),
});

/** Paramètres de rapport financier */
export const financeReportParamsSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Format de mois invalide (YYYY-MM)'),
});

// ============================================
// Helper pour valider et parser
// ============================================

/**
 * Valide les données avec un schéma Zod et retourne le résultat
 * 
 * @param schema - Schéma Zod
 * @param data - Données à valider
 * @returns { success: true, data } ou { success: false, errors }
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return { success: false, errors: result.error.issues };
}
