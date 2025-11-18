-- Migration: Ajout des champs comptables TVA pour Edgemy
-- Date: 2025-01-20
-- Description: Ajoute les champs pour tracker les revenus HT/TVA d'Edgemy et le statut TVA des coachs

-- 1) Ajouter champs TVA dans la table Reservation
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "edgemyRevenueHT" INTEGER;
ALTER TABLE "Reservation" ADD COLUMN IF NOT EXISTS "edgemyRevenueTVACents" INTEGER;

-- 2) Ajouter champs TVA du coach dans la table coach
ALTER TABLE "coach" ADD COLUMN IF NOT EXISTS "isVATRegistered" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "coach" ADD COLUMN IF NOT EXISTS "vatNumber" TEXT;

-- 3) Commenter les champs pour documentation
COMMENT ON COLUMN "Reservation"."edgemyRevenueHT" IS 'Revenu Edgemy HT en centimes (marge nette après frais Stripe)';
COMMENT ON COLUMN "Reservation"."edgemyRevenueTVACents" IS 'TVA sur revenu Edgemy en centimes (20% en France)';
COMMENT ON COLUMN "coach"."isVATRegistered" IS 'Le coach est-il assujetti à la TVA ?';
COMMENT ON COLUMN "coach"."vatNumber" IS 'Numéro de TVA intracommunautaire du coach (si applicable)';
