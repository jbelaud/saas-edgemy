-- Script SQL pour définir un fuseau horaire par défaut pour les coachs sans timezone
-- À exécuter en production si des coachs existent déjà sans timezone configuré

-- Option 1 : Définir Europe/Paris pour tous les coachs sans timezone
UPDATE coach
SET timezone = 'Europe/Paris'
WHERE timezone IS NULL;

-- Option 2 : Définir un fuseau selon la localisation (à adapter)
-- UPDATE coach
-- SET timezone = 'America/New_York'
-- WHERE timezone IS NULL AND country = 'US';
--
-- UPDATE coach
-- SET timezone = 'Asia/Tokyo'
-- WHERE timezone IS NULL AND country = 'JP';

-- Vérifier les résultats
SELECT
  id,
  "firstName",
  "lastName",
  timezone,
  "createdAt"
FROM coach
ORDER BY "createdAt" DESC
LIMIT 20;

-- Statistiques des fuseaux horaires
SELECT
  timezone,
  COUNT(*) as coach_count
FROM coach
GROUP BY timezone
ORDER BY coach_count DESC;
