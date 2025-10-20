-- AlterTable Announcement: Ajouter les nouveaux champs pour les types d'annonces
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "type" TEXT NOT NULL DEFAULT 'STRATEGY';
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "variant" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "abiRange" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "reviewType" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "reviewSupport" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "toolName" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "toolObjective" TEXT;
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "prerequisites" TEXT;

-- Renommer la colonne format en variant pour les anciennes annonces
UPDATE "Announcement" SET "variant" = "format" WHERE "format" IS NOT NULL;

-- Garder format pour le format de jeu (NLHE, PLO, etc.)
-- On ne supprime pas l'ancienne colonne format, on la réutilise
