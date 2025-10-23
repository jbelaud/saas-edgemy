-- Migration pour simplifier le modèle Availability
-- Transformation des anciennes données vers le nouveau format

-- Étape 1: Ajouter les nouvelles colonnes avec des valeurs par défaut temporaires
ALTER TABLE "Availability" ADD COLUMN IF NOT EXISTS "start" TIMESTAMP(3);
ALTER TABLE "Availability" ADD COLUMN IF NOT EXISTS "end" TIMESTAMP(3);

-- Étape 2: Migrer les données existantes
-- Pour les créneaux SPECIFIC, utiliser specificDate + startTime/endTime
UPDATE "Availability" 
SET 
  "start" = "specificDate" + ("startTime" || ':00')::TIME,
  "end" = "specificDate" + ("endTime" || ':00')::TIME
WHERE "type" = 'SPECIFIC' AND "specificDate" IS NOT NULL;

-- Pour les créneaux RECURRING, créer des instances pour les 30 prochains jours
-- (Cette partie sera gérée manuellement ou via un script si nécessaire)

-- Étape 3: Supprimer les lignes qui n'ont pas pu être migrées (RECURRING sans dates spécifiques)
DELETE FROM "Availability" WHERE "start" IS NULL OR "end" IS NULL;

-- Étape 4: Rendre les colonnes start/end obligatoires
ALTER TABLE "Availability" ALTER COLUMN "start" SET NOT NULL;
ALTER TABLE "Availability" ALTER COLUMN "end" SET NOT NULL;

-- Étape 5: Supprimer les anciennes colonnes
ALTER TABLE "Availability" DROP COLUMN IF EXISTS "type";
ALTER TABLE "Availability" DROP COLUMN IF EXISTS "dayOfWeek";
ALTER TABLE "Availability" DROP COLUMN IF EXISTS "startTime";
ALTER TABLE "Availability" DROP COLUMN IF EXISTS "endTime";
ALTER TABLE "Availability" DROP COLUMN IF EXISTS "specificDate";
ALTER TABLE "Availability" DROP COLUMN IF EXISTS "isBlocked";

-- Étape 6: Supprimer les anciens index
DROP INDEX IF EXISTS "Availability_dayOfWeek_idx";
DROP INDEX IF EXISTS "Availability_specificDate_idx";

-- Étape 7: Créer le nouvel index
CREATE INDEX IF NOT EXISTS "Availability_start_idx" ON "Availability"("start");

-- Étape 8: Supprimer l'enum AvailabilityType s'il n'est plus utilisé
DROP TYPE IF EXISTS "AvailabilityType";
