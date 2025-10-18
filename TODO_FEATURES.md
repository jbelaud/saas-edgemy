# 📋 Features à Implémenter - Edgemy

## 🚀 Priorité Haute

### 1. Système de Calendrier & Disponibilités
**Status**: 🟡 Mockup créé, à implémenter

**Description**: 
- Intégration avec Google Calendar ou Calendly
- Gestion des créneaux de disponibilité par les coachs
- Synchronisation bidirectionnelle des événements
- Blocage automatique des créneaux réservés

**Fichiers concernés**:
- `src/components/coach/public/CoachAvailabilityCalendar.tsx` (mockup actuel)
- À créer: `src/app/api/availability/*`
- À créer: `src/components/coach/dashboard/AvailabilityManager.tsx`

**Données mockées actuellement**:
```typescript
const MOCK_AVAILABILITIES = [
  { date: '2025-10-20', slots: ['09:00', '14:00', '16:00'] },
  { date: '2025-10-21', slots: ['10:00', '15:00'] },
  // ...
];
```

**À faire**:
- [ ] Créer le modèle `Availability` dans Prisma
- [ ] API pour créer/modifier/supprimer des disponibilités
- [ ] Interface coach pour gérer son calendrier
- [ ] Intégration Google Calendar API
- [ ] Webhook pour synchronisation temps réel

---

### 2. Système d'Alertes pour Coachs Inactifs
**Status**: 🟡 UI créée, backend à implémenter

**Description**:
- Permettre aux joueurs de s'inscrire pour être notifiés quand un coach inactif redevient disponible
- Envoi automatique d'emails quand le coach réactive son profil

**Fichiers concernés**:
- `src/components/coach/public/CoachAnnouncements.tsx` (UI existante)
- À créer: `src/app/api/coach-alerts/*`
- À créer: Modèle `CoachAlert` dans Prisma

**Fonctionnalité actuelle**:
```typescript
const handleNotifyMe = async (announcementId: string) => {
  // TODO: Implémenter l'API pour enregistrer l'alerte
  console.log('Notify me when available:', { announcementId, email: notifyEmail });
};
```

**À faire**:
- [ ] Créer le modèle `CoachAlert` dans Prisma
- [ ] API POST `/api/coach-alerts` pour enregistrer une alerte
- [ ] Système de notification par email (Brevo)
- [ ] Trigger automatique lors de la réactivation du coach
- [ ] Dashboard coach pour voir les joueurs en attente

---

### 3. Modal de Réservation
**Status**: ❌ À créer

**Description**:
- Modal pour finaliser une réservation
- Sélection de créneau horaire
- Paiement via Stripe
- Confirmation par email

**Fichiers concernés**:
- À créer: `src/components/coach/public/BookingModal.tsx`
- À créer: `src/app/api/reservations/*`

**À faire**:
- [ ] Créer le composant BookingModal
- [ ] Intégration Stripe Payment
- [ ] API de création de réservation
- [ ] Email de confirmation (joueur + coach)
- [ ] Ajout au calendrier automatique

---

## 🎯 Priorité Moyenne

### 4. Système d'Avis et Notations
**Status**: ❌ À créer

**Description**:
- Permettre aux joueurs de laisser des avis après une session
- Affichage des notes moyennes sur les profils
- Modération des avis

**À faire**:
- [ ] Créer le modèle `Review` dans Prisma
- [ ] API pour créer/modifier/supprimer des avis
- [ ] Composant d'affichage des avis
- [ ] Système de modération

---

### 5. Messagerie Interne
**Status**: ❌ À créer

**Description**:
- Chat entre coach et joueur
- Notifications en temps réel
- Historique des conversations

**À faire**:
- [ ] Créer le modèle `Message` dans Prisma
- [ ] WebSocket pour temps réel
- [ ] Interface de chat
- [ ] Notifications push

---

### 6. Tableau de Bord Coach Avancé
**Status**: 🟡 Basique existant, à enrichir

**Description**:
- Statistiques de revenus
- Graphiques de performance
- Gestion des annonces
- Calendrier intégré

**À faire**:
- [ ] Graphiques avec Recharts
- [ ] Export des données (CSV, PDF)
- [ ] Statistiques avancées
- [ ] Objectifs et KPIs

---

## 📊 Priorité Basse

### 7. Programme de Parrainage
**Status**: ❌ À créer

**Description**:
- Codes de parrainage pour coachs
- Récompenses pour parrains et filleuls
- Tracking des conversions

---

### 8. Packs et Abonnements
**Status**: ❌ À créer

**Description**:
- Packs de sessions (5, 10, 20 sessions)
- Abonnements mensuels
- Tarifs dégressifs

---

### 9. Contenu Éducatif
**Status**: ❌ À créer

**Description**:
- Articles de blog
- Vidéos tutoriels
- Ressources téléchargeables

---

## 🔧 Améliorations Techniques

### Optimisations
- [ ] Mise en cache avec Redis
- [ ] Optimisation des images (Next.js Image)
- [ ] Lazy loading des composants
- [ ] Server-side rendering optimisé

### Sécurité
- [ ] Rate limiting sur les APIs
- [ ] Validation Zod sur toutes les routes
- [ ] CSRF protection
- [ ] Audit de sécurité

### Tests
- [ ] Tests unitaires (Vitest)
- [ ] Tests d'intégration (Playwright)
- [ ] Tests E2E
- [ ] Coverage > 80%

---

## 📝 Notes

**Dernière mise à jour**: 18 octobre 2025

**Contributeurs**: 
- Développement initial: Cascade AI + jbelaud

**Priorités actuelles**:
1. Système de calendrier (bloquant pour les réservations)
2. Modal de réservation + Stripe
3. Système d'alertes pour coachs inactifs
