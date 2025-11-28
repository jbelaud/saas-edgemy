# 📋 Résumé Complet : Réservation, Calendrier & Packs

**Date**: 22 octobre 2025  
**Objectif**: Document de synthèse pour implémenter un calendrier intelligent sans erreurs

---

## 🗂️ Table des matières

1. [Architecture Base de Données](#1-architecture-base-de-données)
2. [APIs Implémentées](#2-apis-implémentées)
3. [Composants Frontend](#3-composants-frontend)
4. [Flux Complets](#4-flux-complets)
5. [Points Critiques pour le Calendrier](#5-points-critiques-pour-le-calendrier)
6. [Ce qui reste à implémenter](#6-ce-qui-reste-à-implémenter)

---

## 1. Architecture Base de Données

### 1.1 Modèle `Availability` (Disponibilités du coach)

```prisma
model Availability {
  id           String           @id @default(cuid())
  coachId      String
  type         AvailabilityType @default(RECURRING)
  
  // Créneaux récurrents (ex: tous les lundis 14h-18h)
  dayOfWeek    Int?             // 0=Dimanche, 1=Lundi, ..., 6=Samedi
  startTime    String?          // Format "HH:mm" (ex: "14:00")
  endTime      String?          // Format "HH:mm" (ex: "18:00")
  
  // Créneaux spécifiques (ex: 25 oct 2025 14h-18h)
  specificDate DateTime?
  
  // Exceptions (jours bloqués)
  isBlocked    Boolean          @default(false)
  
  @@index([coachId])
  @@index([dayOfWeek])
  @@index([specificDate])
}

enum AvailabilityType {
  RECURRING  // Créneau récurrent (ex: tous les lundis)
  SPECIFIC   // Créneau spécifique (ex: 25 oct 2025)
  EXCEPTION  // Exception/blocage (ex: vacances)
}
```

---

### 1.2 Modèle `Reservation` (Réservations/Sessions)

```prisma
model Reservation {
  id              String            @id @default(cuid())
  announcementId  String
  coachId         String
  playerId        String
  
  // Pack d'heures (optionnel)
  packId          String?
  sessionNumber   Int?              // Numéro de session dans le pack (1, 2, 3...)
  
  startDate       DateTime          // Date/heure de début (UTC)
  endDate         DateTime          // Date/heure de fin (UTC)
  status          ReservationStatus @default(PENDING)
  priceCents      Int               // Prix en centimes (0 si pack)
  stripePaymentId String?
  
  @@index([packId])
}

enum ReservationStatus {
  PENDING    // En attente de confirmation
  CONFIRMED  // Confirmée
  CANCELLED  // Annulée
  COMPLETED  // Terminée
}
```

**Logique**:
- Réservation **unitaire**: `packId = null`, `priceCents > 0`
- Réservation **pack**: `packId` renseigné, `sessionNumber` (1, 2, 3...), `priceCents = 0`

---

### 1.3 Modèle `AnnouncementPack` (Packs d'heures)

```prisma
model AnnouncementPack {
  id              String        @id @default(cuid())
  announcementId  String
  hours           Int           // Nombre d'heures (5, 10, etc.)
  totalPrice      Int           // Prix total en centimes
  discountPercent Int?          // Pourcentage de réduction optionnel
  isActive        Boolean       @default(true)
  reservations    Reservation[]
  
  @@index([announcementId])
}
```

---

### 1.4 Modèle `Announcement` (Annonces de coaching)

```prisma
model Announcement {
  id           String             @id @default(cuid())
  coachId      String
  type         String             @default("STRATEGY")
  title        String
  priceCents   Int                // Prix unitaire par heure
  durationMin  Int                // Durée en minutes (60, 90, 120...)
  isActive     Boolean            @default(true)
  reservations Reservation[]
  packs        AnnouncementPack[]
}
```

---

## 2. APIs Implémentées

### ✅ APIs Disponibilités

| Endpoint | Méthode | Fichier | Description |
|----------|---------|---------|-------------|
| `/api/coach/availability` | GET | `src/app/api/coach/availability/route.ts` | Récupérer toutes les disponibilités du coach |
| `/api/coach/availability` | POST | `src/app/api/coach/availability/route.ts` | Créer une disponibilité (RECURRING ou SPECIFIC) |
| `/api/coach/availability?id={id}` | DELETE | `src/app/api/coach/availability/route.ts` | Supprimer une disponibilité |

**Exemple POST**:
```json
{
  "type": "RECURRING",
  "dayOfWeek": 2,
  "startTime": "18:00",
  "endTime": "22:00"
}
```

---

### ✅ APIs Packs

| Endpoint | Méthode | Fichier | Description |
|----------|---------|---------|-------------|
| `/api/coach/announcement/[id]/packs` | GET | `src/app/api/coach/announcement/[id]/packs/route.ts` | Récupérer les packs d'une annonce |
| `/api/coach/announcement/[id]/packs` | POST | `src/app/api/coach/announcement/[id]/packs/route.ts` | Créer un pack |
| `/api/coach/announcement/[id]/packs` | PUT | `src/app/api/coach/announcement/[id]/packs/route.ts` | Modifier un pack |
| `/api/coach/announcement/[id]/packs?packId={id}` | DELETE | `src/app/api/coach/announcement/[id]/packs/route.ts` | Supprimer un pack (si aucune réservation) |
| `/api/coach/packs` | GET | `src/app/api/coach/packs/route.ts` | Récupérer tous les packs achetés avec sessions groupées par joueur |
| `/api/coach/packs/[id]/schedule` | POST | `src/app/api/coach/packs/[id]/schedule/route.ts` | Planifier une nouvelle session d'un pack |

**Exemple GET `/api/coach/packs`**:
```json
{
  "packs": [
    {
      "id": "pack123",
      "hours": 5,
      "totalPrice": 45000,
      "announcement": { "title": "Review MTT", "durationMin": 60 },
      "playerPacks": [
        {
          "player": { "name": "PlayerX", "email": "..." },
          "sessions": [
            { "sessionNumber": 1, "startDate": "...", "status": "COMPLETED" },
            { "sessionNumber": 2, "startDate": "...", "status": "CONFIRMED" }
          ],
          "totalSessions": 5,
          "completedSessions": 1,
          "scheduledSessions": 1,
          "remainingSessions": 3
        }
      ]
    }
  ]
}
```

**Exemple POST `/api/coach/packs/[id]/schedule`**:
```json
{
  "playerId": "player123",
  "startDate": "2025-10-29T20:00:00Z",
  "endDate": "2025-10-29T21:00:00Z"
}
```

---

### ⚠️ API Créneaux Disponibles (À FINALISER)

| Endpoint | Méthode | Fichier | Description |
|----------|---------|---------|-------------|
| `/api/coach/[coachId]/available-slots` | GET | `src/app/api/coach/[coachId]/available-slots/route.ts` | Calculer les créneaux disponibles |

**Paramètres**:
- `startDate`: Date de début (ISO)
- `endDate`: Date de fin (ISO)
- `announcementId`: ID de l'annonce (pour récupérer la durée)

**Logique à implémenter**:
1. Récupérer disponibilités récurrentes du coach
2. Récupérer disponibilités spécifiques dans la période
3. Récupérer exceptions/blocages
4. Récupérer réservations existantes (CONFIRMED + PENDING)
5. Générer créneaux pour chaque jour en fonction de la durée
6. Filtrer les créneaux déjà réservés ou chevauchant

---

### ❌ APIs Réservations (À CRÉER)

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/reservations` | POST | Créer une réservation unitaire ou première session d'un pack |
| `/api/reservations/[id]` | PUT | Modifier une réservation (date/heure) |
| `/api/reservations/[id]` | DELETE | Annuler une réservation |
| `/api/player/reservations` | GET | Récupérer toutes les réservations du joueur |
| `/api/player/packs` | GET | Récupérer tous les packs du joueur avec sessions |

---

## 3. Composants Frontend

### ✅ Composants Implémentés

| Composant | Fichier | Description |
|-----------|---------|-------------|
| `AvailabilityManager` | `src/components/coach/availability/AvailabilityManager.tsx` | Gestion des disponibilités du coach (affichage par jour, ajout, suppression) |
| `SchedulePackSessionModal` | `src/components/coach/packs/SchedulePackSessionModal.tsx` | Modal pour planifier une session d'un pack (date + heure) |
| `PacksManager` | `src/components/coach/announcements/PacksManager.tsx` | Gestion des packs d'une annonce (CRUD) |

---

### ⚠️ Composants à Modifier

| Composant | Fichier | Modifications nécessaires |
|-----------|---------|---------------------------|
| `BookingModal` | `src/components/coach/public/BookingModal.tsx` | Ajouter choix entre réservation unitaire et pack |
| `CoachAvailabilityCalendar` | `src/components/coach/public/CoachAvailabilityCalendar.tsx` | Intégrer API `/available-slots` pour afficher créneaux disponibles |

---

### ❌ Pages à Créer

| Page | Fichier | Description |
|------|---------|-------------|
| `/coach/packs` | `src/app/[locale]/(app)/coach/packs/page.tsx` | Dashboard des packs achetés avec planification des sessions |
| `/player/dashboard` | `src/app/[locale]/(app)/player/dashboard/page.tsx` | Dashboard joueur avec ses réservations et packs |

---

## 4. Flux Complets

### 4.1 Flux Coach : Définir ses disponibilités

1. Coach accède à `/coach/availability`
2. Affichage `AvailabilityManager` avec créneaux groupés par jour
3. Clic "Ajouter un créneau" → Modal
4. Choix type : RECURRING (tous les mardis) ou SPECIFIC (25 oct 2025)
5. Saisie jour/date + heures (startTime, endTime)
6. POST `/api/coach/availability`
7. Sauvegarde en DB → Rafraîchissement liste

---

### 4.2 Flux Coach : Créer un pack

1. Coach édite une annonce
2. Section "Packs" → Clic "Ajouter un pack"
3. Modal : Heures (5, 10...) + Prix + Réduction (%)
4. POST `/api/coach/announcement/[id]/packs`
5. Création `AnnouncementPack` en DB
6. Affichage dans liste des packs

---

### 4.3 Flux Coach : Planifier une session de pack

1. Coach accède à `/coach/packs`
2. GET `/api/coach/packs` → Liste des packs achetés groupés par joueur
3. Clic "Ajouter une date" pour un joueur
4. `SchedulePackSessionModal` s'ouvre
5. Sélection date + heure (créneaux 8h-23h)
6. Calcul automatique endDate (startDate + durationMin)
7. POST `/api/coach/packs/[id]/schedule`
8. Création `Reservation` avec `sessionNumber++`, `status: CONFIRMED`, `priceCents: 0`
9. TODO: Notification joueur par email
10. Rafraîchissement dashboard

---

### 4.4 Flux Joueur : Réserver une session unitaire (À IMPLÉMENTER)

1. Joueur sur profil public du coach
2. Sélection d'une annonce → `BookingModal`
3. Choix "Réservation unitaire"
4. GET `/api/coach/[coachId]/available-slots?announcementId=xxx&startDate=...&endDate=...`
5. Affichage créneaux disponibles dans calendrier
6. Sélection d'un créneau
7. Paiement Stripe
8. POST `/api/reservations` avec `packId = null`, `priceCents > 0`
9. Création `Reservation` avec `status: CONFIRMED`
10. Email de confirmation coach + joueur

---

### 4.5 Flux Joueur : Acheter un pack (À IMPLÉMENTER)

1. Joueur sur profil public du coach
2. Sélection d'une annonce → `BookingModal`
3. Choix "Pack 5h" ou "Pack 10h"
4. Message : "Vous réservez la première session. Les autres seront planifiées avec votre coach."
5. GET `/api/coach/[coachId]/available-slots` pour 1ère session
6. Sélection d'un créneau pour 1ère session
7. Paiement Stripe du pack complet
8. POST `/api/reservations` avec `packId`, `sessionNumber: 1`, `priceCents: 0`
9. Création 1ère `Reservation` avec `status: CONFIRMED`
10. Email de confirmation + instructions pour planifier les autres sessions
11. Coach planifie les sessions restantes via `/coach/packs`

---

## 5. Points Critiques pour le Calendrier

### 5.1 Algorithme de calcul des créneaux disponibles

**Fichier**: `src/app/api/coach/[coachId]/available-slots/route.ts`

**Étapes**:
1. **Récupérer disponibilités récurrentes** (type: RECURRING)
2. **Récupérer disponibilités spécifiques** (type: SPECIFIC, dans la période)
3. **Récupérer exceptions/blocages** (type: EXCEPTION, dans la période)
4. **Récupérer réservations existantes** (status: CONFIRMED ou PENDING, dans la période)
5. **Pour chaque jour de la période**:
   - Vérifier si jour bloqué (exception)
   - Récupérer disponibilités du jour (récurrentes + spécifiques)
   - Générer créneaux de X minutes (durationMin) dans chaque disponibilité
   - Filtrer créneaux chevauchant une réservation existante
6. **Retourner liste des créneaux disponibles**

---

### 5.2 Gestion des fuseaux horaires

⚠️ **CRITIQUE**: Toutes les dates en DB sont en **UTC**.

**Bonnes pratiques**:
- Stocker `startDate`, `endDate`, `specificDate` en UTC
- Convertir en timezone locale côté frontend uniquement
- Utiliser `date-fns-tz` ou `dayjs` avec timezone

```typescript
// Frontend → Backend : Convertir en UTC
import { zonedTimeToUtc } from 'date-fns-tz';
const utcDate = zonedTimeToUtc(localDate, 'Europe/Paris');

// Backend → Frontend : Convertir en local
import { utcToZonedTime } from 'date-fns-tz';
const localDate = utcToZonedTime(utcDate, 'Europe/Paris');
```

---

### 5.3 Validation des créneaux

**Règles à respecter**:
1. ✅ Créneau ne chevauche pas une réservation existante
2. ✅ Créneau est dans les disponibilités du coach
3. ✅ Créneau n'est pas dans le passé
4. ✅ Créneau respecte la durée de l'annonce (durationMin)
5. ✅ Pack ne peut pas avoir plus de sessions que d'heures achetées

**Exemple de validation avant création**:
```typescript
// Vérifier chevauchement
const existingReservation = await prisma.reservation.findFirst({
  where: {
    coachId,
    startDate: { lte: endDate },
    endDate: { gte: startDate },
    status: { in: ['CONFIRMED', 'PENDING'] }
  }
});

if (existingReservation) {
  throw new Error('Ce créneau est déjà réservé');
}
```

---

### 5.4 Gestion des conflits

**Scénarios**:

#### Conflit 1 : Double réservation
- Vérifier avant chaque création de réservation
- Utiliser transaction Prisma si nécessaire

#### Conflit 2 : Modification de disponibilité avec réservations futures
- Avant de supprimer une disponibilité, vérifier s'il existe des réservations futures
- Bloquer la suppression ou proposer de déplacer les réservations

#### Conflit 3 : Pack avec trop de sessions
- Vérifier `existingSessions < pack.hours` avant de planifier
- Retourner erreur 400 si limite atteinte

---

### 5.5 Intervalle de génération des créneaux

**Recommandation**: Générer des créneaux tous les **30 minutes**.

Exemple : Disponibilité 18h-22h, durée annonce 60min
- Créneaux générés : 18h-19h, 18h30-19h30, 19h-20h, 19h30-20h30, 20h-21h, 20h30-21h30, 21h-22h

---

## 6. Ce qui reste à implémenter

### 6.1 Priorité 1 : Calendrier côté joueur

- [ ] **API `/api/coach/[coachId]/available-slots`** : Finaliser l'algorithme de calcul
- [ ] **Composant `CoachAvailabilityCalendar`** : Intégrer l'API et afficher créneaux
- [ ] **Modifier `BookingModal`** : Ajouter choix unitaire vs pack
- [ ] **API `/api/reservations` POST** : Créer réservation unitaire ou 1ère session pack
- [ ] **Intégration Stripe** : Paiement unitaire vs pack

---

### 6.2 Priorité 2 : Dashboard Packs Coach

- [ ] **Page `/coach/packs`** : Afficher packs achetés avec sessions par joueur
- [ ] **Intégration `SchedulePackSessionModal`** : Bouton "Ajouter une date"
- [ ] **Affichage statut sessions** : Effectuées, planifiées, restantes

---

### 6.3 Priorité 3 : Dashboard Joueur

- [ ] **Page `/player/dashboard`** : Créer la page
- [ ] **API `/api/player/packs` GET** : Récupérer packs du joueur
- [ ] **API `/api/player/reservations` GET** : Récupérer réservations du joueur
- [ ] **Affichage packs** : Sessions effectuées, planifiées, à planifier

---

### 6.4 Priorité 4 : Notifications

- [ ] **Service de notifications** : `src/lib/notifications.ts`
- [ ] **Email pack acheté** : Coach + Joueur
- [ ] **Email session planifiée** : Joueur
- [ ] **Email session terminée** : Coach + Joueur
- [ ] **Templates Brevo** : Créer les templates

---

### 6.5 Priorité 5 : Gestion des réservations

- [ ] **API `/api/reservations/[id]` PUT** : Modifier date/heure d'une réservation
- [ ] **API `/api/reservations/[id]` DELETE** : Annuler une réservation
- [ ] **Politique d'annulation** : Définir les règles (délai, remboursement...)
- [ ] **Gestion des conflits** : Déplacer réservations si modification de disponibilité

---

## 📊 Résumé Visuel

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTÈME DE RÉSERVATION                   │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│   AVAILABILITY   │      │   ANNOUNCEMENT   │      │ ANNOUNCEMENTPACK │
│                  │      │                  │      │                  │
│ - type           │      │ - title          │      │ - hours          │
│ - dayOfWeek      │      │ - priceCents     │◄─────┤ - totalPrice     │
│ - startTime      │      │ - durationMin    │      │ - discountPercent│
│ - endTime        │      │                  │      │                  │
│ - specificDate   │      └──────────────────┘      └──────────────────┘
│ - isBlocked      │               │                         │
└──────────────────┘               │                         │
         │                         │                         │
         │                         ▼                         │
         │              ┌──────────────────┐                 │
         │              │   RESERVATION    │◄────────────────┘
         │              │                  │
         └─────────────►│ - startDate      │
                        │ - endDate        │
                        │ - status         │
                        │ - packId         │
                        │ - sessionNumber  │
                        │ - priceCents     │
                        └──────────────────┘
```

---

## 🎯 Checklist pour Implémenter le Calendrier

- [ ] Finaliser algorithme `/api/coach/[coachId]/available-slots`
- [ ] Tester calcul créneaux avec disponibilités récurrentes
- [ ] Tester calcul créneaux avec disponibilités spécifiques
- [ ] Tester filtrage créneaux avec réservations existantes
- [ ] Tester gestion des exceptions/blocages
- [ ] Implémenter gestion des fuseaux horaires
- [ ] Créer composant calendrier avec créneaux disponibles
- [ ] Intégrer dans `BookingModal`
- [ ] Tester flux complet de réservation unitaire
- [ ] Tester flux complet d'achat de pack
- [ ] Implémenter notifications email

---

**📅 Dernière mise à jour**: 22 octobre 2025  
**👤 Auteur**: Cascade AI  
**🎯 Statut**: Phase 2 en cours (Packs côté coach implémentés, calendrier joueur à finaliser)
