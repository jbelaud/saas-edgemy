-- ============================================
-- SCRIPT DE RESET BASE DE DONNÉES EDGEMY
-- ============================================
-- Ce script supprime TOUTES les données SAUF la table subscribers
-- À exécuter avec précaution !
-- ============================================

-- Désactiver les contraintes de clé étrangère temporairement
-- (PostgreSQL gère automatiquement l'ordre avec CASCADE)

-- 1. Supprimer les logs et données de transfert/remboursement
TRUNCATE TABLE "TransferLog" CASCADE;
TRUNCATE TABLE "RefundLog" CASCADE;
TRUNCATE TABLE "AdminLog" CASCADE;

-- 2. Supprimer les sessions de packs
TRUNCATE TABLE "PackageSession" CASCADE;

-- 3. Supprimer les packs de coaching
TRUNCATE TABLE "CoachingPackage" CASCADE;

-- 4. Supprimer les réservations
TRUNCATE TABLE "Reservation" CASCADE;

-- 5. Supprimer les reviews
TRUNCATE TABLE "Review" CASCADE;

-- 6. Supprimer les notes et notifications coach
TRUNCATE TABLE "CoachNote" CASCADE;
TRUNCATE TABLE "CoachNotification" CASCADE;
TRUNCATE TABLE "CoachPlayerChannel" CASCADE;

-- 7. Supprimer les packs d'annonces et annonces
TRUNCATE TABLE "AnnouncementPack" CASCADE;
TRUNCATE TABLE "Announcement" CASCADE;

-- 8. Supprimer les disponibilités
TRUNCATE TABLE "Availability" CASCADE;

-- 9. Supprimer les brouillons coach
TRUNCATE TABLE "CoachDraft" CASCADE;

-- 10. Supprimer les coachs
TRUNCATE TABLE "coach" CASCADE;

-- 11. Supprimer les joueurs
TRUNCATE TABLE "player" CASCADE;

-- 12. Supprimer les sessions d'authentification
TRUNCATE TABLE "session" CASCADE;

-- 13. Supprimer les comptes OAuth
TRUNCATE TABLE "account" CASCADE;

-- 14. Supprimer les vérifications
TRUNCATE TABLE "verification" CASCADE;

-- 15. Supprimer les utilisateurs (sauf admin si besoin)
TRUNCATE TABLE "user" CASCADE;

-- ============================================
-- TABLES PRÉSERVÉES :
-- - subscribers (liste d'attente)
-- - Plan (configuration des plans)
-- ============================================

-- Vérification finale
SELECT 'subscribers' as table_name, COUNT(*) as count FROM "subscribers"
UNION ALL
SELECT 'user', COUNT(*) FROM "user"
UNION ALL
SELECT 'coach', COUNT(*) FROM "coach"
UNION ALL
SELECT 'player', COUNT(*) FROM "player"
UNION ALL
SELECT 'Reservation', COUNT(*) FROM "Reservation"
UNION ALL
SELECT 'CoachingPackage', COUNT(*) FROM "CoachingPackage";
