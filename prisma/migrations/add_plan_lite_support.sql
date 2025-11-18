-- Migration: Ajout du support du plan LITE
-- Date: 2025-01-17
-- Description: Ajoute la table Plan, modifie Coach, et ajoute les nouveaux statuts de paiement

-- ========================================================================
-- 1. Créer la table Plan
-- ========================================================================
CREATE TABLE IF NOT EXISTS "Plan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "monthlyPrice" INTEGER NOT NULL,
    "yearlyPrice" INTEGER NOT NULL,
    "features" JSONB,
    "requiresStripe" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- ========================================================================
-- 2. Modifier la table Coach
-- ========================================================================

-- Ajouter la colonne planKey (référence au plan)
ALTER TABLE "coach"
ADD COLUMN IF NOT EXISTS "planKey" TEXT NOT NULL DEFAULT 'PRO';

-- Ajouter la colonne paymentPreferences (pour plan LITE)
ALTER TABLE "coach"
ADD COLUMN IF NOT EXISTS "paymentPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ========================================================================
-- 3. Modifier l'enum PaymentStatus
-- ========================================================================

-- Ajouter les nouveaux statuts pour les paiements externes (plan LITE)
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'EXTERNAL_PENDING';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'EXTERNAL_PAID';

-- ========================================================================
-- 4. Seed initial des plans (optionnel - peut être fait via script)
-- ========================================================================

-- Insérer le plan PRO (existant)
INSERT INTO "Plan" ("id", "key", "name", "monthlyPrice", "yearlyPrice", "requiresStripe", "isActive", "features", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'PRO',
    'Edgemy Pro',
    3900,  -- 39€
    39900, -- 399€
    true,
    true,
    '{"stripePayments": true, "discordIntegration": true, "unlimitedSessions": true, "analytics": true, "prioritySupport": true, "customBranding": true, "replayHosting": true, "invoicing": true}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;

-- Insérer le plan LITE (nouveau)
INSERT INTO "Plan" ("id", "key", "name", "monthlyPrice", "yearlyPrice", "requiresStripe", "isActive", "features", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'LITE',
    'Edgemy Lite',
    1500,  -- 15€
    14900, -- 149€
    false, -- Pas de Stripe pour paiements joueurs
    true,
    '{"stripePayments": false, "externalPayments": true, "discordIntegration": true, "unlimitedSessions": true, "analytics": false, "prioritySupport": false, "customBranding": false, "replayHosting": false, "invoicing": false}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO NOTHING;

-- ========================================================================
-- 5. Migrer les coachs existants (tous passent en PRO par défaut)
-- ========================================================================

-- Mettre à jour tous les coachs existants qui n'ont pas de planKey
UPDATE "coach"
SET "planKey" = 'PRO'
WHERE "planKey" IS NULL OR "planKey" = '';

-- ========================================================================
-- 6. Créer les index pour performance
-- ========================================================================

-- Index sur coach.planKey pour les requêtes de filtrage
CREATE INDEX IF NOT EXISTS "coach_planKey_idx" ON "coach"("planKey");

-- Index sur Plan.key pour les lookups rapides
CREATE INDEX IF NOT EXISTS "plan_key_idx" ON "Plan"("key");

-- ========================================================================
-- 7. Vérifications
-- ========================================================================

-- Vérifier que les plans ont bien été créés
SELECT "key", "name", "monthlyPrice", "yearlyPrice", "requiresStripe", "isActive"
FROM "Plan";

-- Vérifier la distribution des coachs par plan
SELECT "planKey", COUNT(*) as "count"
FROM "coach"
GROUP BY "planKey";

-- Vérifier les nouveaux statuts de paiement
SELECT enumlabel FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PaymentStatus')
ORDER BY enumlabel;
