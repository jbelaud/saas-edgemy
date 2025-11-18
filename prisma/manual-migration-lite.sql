-- Migration manuelle pour ajout Plan LITE
-- À exécuter directement sur la base de données

-- ========================================================================
-- 1. Créer la table Plan (si elle n'existe pas)
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- 2. Ajouter colonnes au modèle Coach (si elles n'existent pas)
-- ========================================================================
DO $$
BEGIN
    -- Ajouter planKey
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'coach' AND column_name = 'planKey'
    ) THEN
        ALTER TABLE "coach" ADD COLUMN "planKey" TEXT NOT NULL DEFAULT 'PRO';
    END IF;

    -- Ajouter paymentPreferences
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'coach' AND column_name = 'paymentPreferences'
    ) THEN
        ALTER TABLE "coach" ADD COLUMN "paymentPreferences" TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- ========================================================================
-- 3. Ajouter nouveaux statuts PaymentStatus (si non existants)
-- ========================================================================
DO $$
BEGIN
    -- Vérifier si EXTERNAL_PENDING existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PaymentStatus')
        AND enumlabel = 'EXTERNAL_PENDING'
    ) THEN
        ALTER TYPE "PaymentStatus" ADD VALUE 'EXTERNAL_PENDING';
    END IF;

    -- Vérifier si EXTERNAL_PAID existe déjà
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PaymentStatus')
        AND enumlabel = 'EXTERNAL_PAID'
    ) THEN
        ALTER TYPE "PaymentStatus" ADD VALUE 'EXTERNAL_PAID';
    END IF;
END $$;

-- ========================================================================
-- 4. Seed des plans PRO et LITE
-- ========================================================================

-- Plan PRO
INSERT INTO "Plan" ("id", "key", "name", "monthlyPrice", "yearlyPrice", "requiresStripe", "isActive", "features", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'PRO',
    'Edgemy Pro',
    3900,
    39900,
    true,
    true,
    '{"stripePayments": true, "discordIntegration": true, "unlimitedSessions": true, "analytics": true, "prioritySupport": true, "customBranding": true, "replayHosting": true, "invoicing": true}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE SET
    "name" = EXCLUDED."name",
    "monthlyPrice" = EXCLUDED."monthlyPrice",
    "yearlyPrice" = EXCLUDED."yearlyPrice",
    "requiresStripe" = EXCLUDED."requiresStripe",
    "isActive" = EXCLUDED."isActive",
    "features" = EXCLUDED."features",
    "updatedAt" = CURRENT_TIMESTAMP;

-- Plan LITE
INSERT INTO "Plan" ("id", "key", "name", "monthlyPrice", "yearlyPrice", "requiresStripe", "isActive", "features", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid()::text,
    'LITE',
    'Edgemy Lite',
    1500,
    14900,
    false,
    true,
    '{"stripePayments": false, "externalPayments": true, "discordIntegration": true, "unlimitedSessions": true, "analytics": false, "prioritySupport": false, "customBranding": false, "replayHosting": false, "invoicing": false}'::jsonb,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("key") DO UPDATE SET
    "name" = EXCLUDED."name",
    "monthlyPrice" = EXCLUDED."monthlyPrice",
    "yearlyPrice" = EXCLUDED."yearlyPrice",
    "requiresStripe" = EXCLUDED."requiresStripe",
    "isActive" = EXCLUDED."isActive",
    "features" = EXCLUDED."features",
    "updatedAt" = CURRENT_TIMESTAMP;

-- ========================================================================
-- 5. Créer index pour performance
-- ========================================================================
CREATE INDEX IF NOT EXISTS "coach_planKey_idx" ON "coach"("planKey");
CREATE INDEX IF NOT EXISTS "plan_key_idx" ON "Plan"("key");

-- ========================================================================
-- 6. Vérifications
-- ========================================================================
SELECT '✅ Plans créés/mis à jour:' as message;
SELECT "key", "name", "monthlyPrice"/100 as "monthly_eur", "yearlyPrice"/100 as "yearly_eur", "requiresStripe", "isActive"
FROM "Plan"
ORDER BY "key";

SELECT '✅ Distribution coachs par plan:' as message;
SELECT "planKey", COUNT(*) as "count"
FROM "coach"
GROUP BY "planKey";

SELECT '✅ Statuts PaymentStatus disponibles:' as message;
SELECT enumlabel as "status"
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'PaymentStatus')
ORDER BY enumlabel;
