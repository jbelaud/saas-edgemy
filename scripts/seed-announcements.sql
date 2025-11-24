-- Script pour ajouter des annonces de test pour les 4 types d'annonces
-- Ce script permet de tester le système de filtrage avec tous les types

-- 1. STRATEGY - Annonce pour Olivier Belaud
INSERT INTO "Announcement" (
  "id",
  "coachId",
  "type",
  "title",
  "description",
  "priceCents",
  "durationMin",
  "isActive",
  "variant",
  "format",
  "abiRange",
  "tags",
  "createdAt",
  "updatedAt"
)
VALUES (
  'test-strategy-001',
  'cmhv2cleb0003uyvs9xacware', -- Olivier Belaud
  'STRATEGY',
  'Coaching NLHE Cash Game',
  'Coaching stratégique pour le Cash Game NLHE',
  12000, -- 120€
  90,
  true,
  'NLHE',
  'CASH_GAME',
  '100-200',
  ARRAY['Postflop', 'GTO', 'Exploitative'],
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = NOW();

-- 2. REVIEW - Annonce pour Olivier Belaud
INSERT INTO "Announcement" (
  "id",
  "coachId",
  "type",
  "title",
  "description",
  "priceCents",
  "durationMin",
  "isActive",
  "reviewType",
  "reviewSupport",
  "format",
  "createdAt",
  "updatedAt"
)
VALUES (
  'test-review-001',
  'cmhv2cleb0003uyvs9xacware', -- Olivier Belaud
  'REVIEW',
  'Review de session MTT',
  'Analyse détaillée de votre session MTT',
  8000, -- 80€
  60,
  true,
  'SESSION_MTT',
  'VIDEO_REPLAY',
  'MTT',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = NOW();

-- 3. TOOL - Annonce pour Pierre Dubois (si existe) ou Olivier Belaud
INSERT INTO "Announcement" (
  "id",
  "coachId",
  "type",
  "title",
  "description",
  "priceCents",
  "durationMin",
  "isActive",
  "toolName",
  "toolObjective",
  "createdAt",
  "updatedAt"
)
VALUES (
  'test-tool-001',
  'cmhv2cleb0003uyvs9xacware', -- Olivier Belaud
  'TOOL',
  'Formation GTO Wizard',
  'Prise en main complète de GTO Wizard',
  6000, -- 60€
  45,
  true,
  'GTO_WIZARD',
  'ONBOARDING',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = NOW();

-- 4. MENTAL - Annonce pour Marie Martin (si existe) ou Olivier Belaud
INSERT INTO "Announcement" (
  "id",
  "coachId",
  "type",
  "title",
  "description",
  "priceCents",
  "durationMin",
  "isActive",
  "mentalFocus",
  "createdAt",
  "updatedAt"
)
VALUES (
  'test-mental-001',
  'cmhv2cleb0003uyvs9xacware', -- Olivier Belaud
  'MENTAL',
  'Gestion du tilt',
  'Session de coaching mental sur la gestion du tilt',
  7000, -- 70€
  50,
  true,
  'TILT_MANAGEMENT',
  NOW(),
  NOW()
)
ON CONFLICT ("id") DO UPDATE SET
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = NOW();

-- 5. Ajouter quelques annonces supplémentaires pour Marie Martin si elle existe
-- STRATEGY PLO
INSERT INTO "Announcement" (
  "id",
  "coachId",
  "type",
  "title",
  "description",
  "priceCents",
  "durationMin",
  "isActive",
  "variant",
  "format",
  "abiRange",
  "tags",
  "createdAt",
  "updatedAt"
)
SELECT
  'test-strategy-002',
  "id",
  'STRATEGY',
  'Coaching PLO MTT',
  'Stratégie avancée PLO pour les tournois',
  15000, -- 150€
  120,
  true,
  'PLO',
  'MTT',
  '50-100',
  ARRAY['Ranges', 'ICM', 'Bubble'],
  NOW(),
  NOW()
FROM "Coach"
WHERE "slug" = 'marie-martin'
LIMIT 1
ON CONFLICT ("id") DO UPDATE SET
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = NOW();

-- 6. TOOL pour Jean Dupont si il existe
INSERT INTO "Announcement" (
  "id",
  "coachId",
  "type",
  "title",
  "description",
  "priceCents",
  "durationMin",
  "isActive",
  "toolName",
  "toolObjective",
  "createdAt",
  "updatedAt"
)
SELECT
  'test-tool-002',
  "id",
  'TOOL',
  'Formation Hold\'em Manager 3',
  'Maîtrise complète de HM3 pour l\'analyse de votre jeu',
  5500, -- 55€
  40,
  true,
  'HM3',
  'ADVANCED',
  NOW(),
  NOW()
FROM "Coach"
WHERE "slug" = 'jean-dupont'
LIMIT 1
ON CONFLICT ("id") DO UPDATE SET
  "priceCents" = EXCLUDED."priceCents",
  "updatedAt" = NOW();

-- Vérification : Compter le nombre d'annonces par type
SELECT
  type,
  COUNT(*) as count,
  MIN("priceCents" / 100) as "min_price_euros",
  MAX("priceCents" / 100) as "max_price_euros"
FROM "Announcement"
WHERE "isActive" = true
GROUP BY type
ORDER BY type;
