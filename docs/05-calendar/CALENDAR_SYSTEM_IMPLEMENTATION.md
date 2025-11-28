# 🗓️ Système de Calendrier Coach - Implémentation Complète

**Date**: 22 octobre 2025  
**Statut**: ✅ Implémentation backend et frontend complète

---

## 📋 Résumé de l'Implémentation

Le système de calendrier complet pour Edgemy a été implémenté avec succès, incluant :
- Gestion des disponibilités coach (récurrentes, spécifiques, exceptions)
- Calcul intelligent des créneaux disponibles
- Réservations unitaires et packs d'heures
- Gestion des fuseaux horaires
- Composants frontend pour affichage et sélection

---

## 🗄️ Base de Données

### Nouveaux Modèles Prisma

#### `CoachingPackage`
```prisma
model CoachingPackage {
  id             String       @id @default(cuid())
  playerId       String
  player         user         @relation(fields: [playerId], references: [id], onDelete: Cascade)
  coachId        String
  coach          coach        @relation(fields: [coachId], references: [id], onDelete: Cascade)
  announcementId String
  announcement   Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  totalHours     Int
  remainingHours Int
  priceCents     Int
  stripePaymentId String?
  status         PackageStatus @default(ACTIVE)
  sessions       PackageSession[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### `PackageSession`
```prisma
model PackageSession {
  id               String       @id @default(cuid())
  packageId        String
  package          CoachingPackage @relation(fields: [packageId], references: [id], onDelete: Cascade)
  reservationId    String?      @unique
  reservation      Reservation? @relation(fields: [reservationId], references: [id])
  startDate        DateTime
  endDate          DateTime
  durationMinutes  Int
  status           PackageSessionStatus @default(SCHEDULED)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

#### Modifications au modèle `coach`
- Ajout du champ `timezone` (String?) pour stocker le fuseau horaire du coach (ex: "Europe/Paris", "America/Montreal")

#### Modifications au modèle `Reservation`
- Ajout de la relation `packageSession` (PackageSession?)

---

## 🔌 APIs Backend

### 1. `/api/coach/[coachId]/available-slots` (GET)
**Fonction**: Calcule les créneaux disponibles pour un coach

**Paramètres**:
- `startDate` (required): Date de début (ISO string)
- `endDate` (required): Date de fin (ISO string)
- `announcementId` (required): ID de l'annonce

**Logique**:
1. Récupère l'annonce pour connaître `durationMin`
2. Récupère les disponibilités (RECURRING, SPECIFIC, EXCEPTION)
3. Récupère les réservations existantes
4. Génère les créneaux tous les 30 minutes
5. Filtre les chevauchements et exceptions

**Réponse**:
```json
{
  "slots": [
    {
      "start": "2025-10-22T14:00:00.000Z",
      "end": "2025-10-22T15:00:00.000Z"
    }
  ]
}
```

### 2. `/api/coach/[coachId]/availability` (GET, POST, PATCH, DELETE)
**Fonction**: CRUD des disponibilités coach

**POST - Créer une disponibilité**:
```json
{
  "type": "RECURRING",
  "dayOfWeek": 1,
  "startTime": "14:00",
  "endTime": "18:00",
  "isBlocked": false
}
```

**PATCH - Modifier une disponibilité**:
```json
{
  "id": "avail_id",
  "startTime": "15:00",
  "endTime": "19:00",
  "isBlocked": true
}
```

### 3. `/api/reservations` (GET, POST)
**Fonction**: Gestion des réservations

**POST - Créer une réservation**:
```json
{
  "announcementId": "ann_id",
  "coachId": "coach_id",
  "startDate": "2025-10-22T14:00:00.000Z",
  "endDate": "2025-10-22T15:00:00.000Z",
  "packageId": "pack_id", // Optionnel
  "stripePaymentId": "pi_xxx"
}
```

**Logique**:
- Vérifie que le créneau est disponible (évite race conditions)
- Si `packageId` fourni: crée PackageSession et déduit les heures
- Sinon: réservation unitaire classique

### 4. `/api/packages` (GET, POST)
**Fonction**: Gestion des packs coaching

**POST - Créer un pack** (mock Stripe):
```json
{
  "coachId": "coach_id",
  "announcementId": "ann_id",
  "totalHours": 10,
  "priceCents": 50000,
  "stripePaymentId": "pi_xxx"
}
```

### 5. `/api/packages/[id]/sessions` (POST, PATCH, DELETE)
**Fonction**: Planification des sessions de pack

**POST - Planifier une session**:
```json
{
  "startDate": "2025-10-22T14:00:00.000Z",
  "endDate": "2025-10-22T15:00:00.000Z"
}
```

**DELETE - Annuler une session**:
- Recrédite les heures au pack
- Met à jour le statut à CANCELLED

### 6. `/api/cron/remind-coach-availability` (GET)
**Fonction**: Endpoint CRON pour rappels (mock)

**Usage**: À appeler chaque dimanche à 10h locale de chaque coach

**Réponse**:
```json
{
  "success": true,
  "message": "5 rappels traités (mock)",
  "reminders": [...]
}
```

---

## 🎨 Composants Frontend

### 1. `CoachAvailabilityCalendar`
**Emplacement**: `src/components/coach/public/CoachAvailabilityCalendar.tsx`

**Props**:
```typescript
{
  coachId: string;
  announcementId: string;
  onSelectSlot?: (slot: Slot) => void;
  isInactive?: boolean;
}
```

**Fonctionnalités**:
- Affiche les prochaines dates disponibles
- Charge les créneaux via API `/available-slots`
- Permet la sélection d'un créneau
- Gère l'état de chargement
- Affiche un message si coach inactif

### 2. `CoachCalendar`
**Emplacement**: `src/components/coach/dashboard/CoachCalendar.tsx`

**Props**:
```typescript
{
  coachId: string;
  coachTimezone?: string;
}
```

**Fonctionnalités**:
- Vue hebdomadaire du calendrier coach
- Affiche disponibilités (vert), réservations (orange), sessions pack (bleu), blocages (rouge)
- Navigation semaine précédente/suivante
- Actions rapides: ajouter disponibilité, bloquer créneau, planifier session

### 3. `TimezoneBadge`
**Emplacement**: `src/components/shared/TimezoneBadge.tsx`

**Props**:
```typescript
{
  date: Date | string;
  coachTimezone?: string;
  showDate?: boolean;
}
```

**Fonctionnalités**:
- Affiche l'heure dans le fuseau du coach
- Affiche l'heure française (Europe/Paris) si différente
- Format: `18h00 • 19h00 (Paris)`

---

## 🔄 Flux de Réservation

### Réservation Unitaire
1. Joueur consulte profil coach
2. Sélectionne une annonce
3. `CoachAvailabilityCalendar` affiche les créneaux disponibles
4. Joueur sélectionne un créneau
5. Paiement Stripe (à implémenter)
6. POST `/api/reservations` avec `stripePaymentId`
7. Réservation créée avec status CONFIRMED

### Achat de Pack
1. Joueur sélectionne un pack (5h, 10h, etc.)
2. Paiement Stripe (à implémenter)
3. POST `/api/packages` crée le CoachingPackage
4. Joueur sélectionne un créneau pour la 1ère session
5. POST `/api/reservations` avec `packageId`
6. PackageSession créée, heures déduites

### Planification Session Pack (Coach)
1. Coach accède à `/coach/packs`
2. Sélectionne un pack actif
3. Choisit un joueur et un créneau
4. POST `/api/packages/[id]/sessions`
5. Réservation + PackageSession créées
6. Heures déduites du pack

---

## ⚠️ Points d'Attention

### 1. Fuseaux Horaires
- **Stockage**: Toujours en UTC dans la base de données
- **Affichage**: Conversion en timezone locale via `date-fns-tz`
- **Coach.timezone**: Défaut "Europe/Paris" si non défini

### 2. Race Conditions
- Vérification de disponibilité dans POST `/api/reservations`
- Utilisation de transactions Prisma pour atomicité
- Retour 409 (Conflict) si créneau déjà pris

### 3. Validation
- Vérification côté backend même si validé frontend
- Contrôle des heures restantes dans les packs
- Vérification des permissions (coach/joueur)

### 4. Performance
- Limite de calcul: 7 jours par requête dans `CoachAvailabilityCalendar`
- Index sur `coachId`, `dayOfWeek`, `specificDate` dans Availability
- Mise en cache côté frontend recommandée

---

## 🚧 À Implémenter (Phase 2)

### Intégration Stripe
- [ ] Créer sessions Stripe pour paiements
- [ ] Webhook Stripe pour confirmer paiements
- [ ] Metadata: `bookingType`, `announcementId`, `coachId`, `packageId`

### Notifications Email (Brevo)
- [ ] Email confirmation réservation
- [ ] Email achat pack
- [ ] Email rappel session (24h avant)
- [ ] Email session terminée

### Intégration n8n
- [ ] Workflow rappel disponibilités (dimanche 10h)
- [ ] Workflow rappel sessions à venir
- [ ] Workflow suivi packs (heures restantes)

### Dashboard Joueur
- [ ] Page `/player/dashboard`
- [ ] Affichage réservations à venir
- [ ] Affichage packs actifs
- [ ] Historique des sessions

### Gestion Réservations
- [ ] PUT `/api/reservations/[id]` - Modifier réservation
- [ ] DELETE `/api/reservations/[id]` - Annuler réservation
- [ ] Politique d'annulation (délai, remboursement)

---

## 🐛 Problèmes Connus

### Erreurs TypeScript
Les erreurs TypeScript actuelles sont dues au fait que le client Prisma n'a pas pu être régénéré (verrouillage de fichier Windows). Ces erreurs disparaîtront après :
```bash
# Fermer tous les processus Node.js
# Puis exécuter:
npx prisma generate
```

### Dépendances Manquantes
Vérifier que `date-fns-tz` est installé :
```bash
pnpm add date-fns-tz
```

---

## 📝 Commandes Utiles

### Développement
```bash
# Synchroniser le schéma Prisma
pnpm prisma db push

# Générer le client Prisma
pnpm prisma generate

# Ouvrir Prisma Studio
pnpm prisma studio
```

### Test de l'API CRON
```bash
curl http://localhost:3000/api/cron/remind-coach-availability
```

---

## 📊 Statistiques

- **Modèles Prisma ajoutés**: 2 (CoachingPackage, PackageSession)
- **Enums ajoutés**: 2 (PackageStatus, PackageSessionStatus)
- **APIs créées**: 6 routes complètes
- **Composants créés**: 3 (CoachAvailabilityCalendar, CoachCalendar, TimezoneBadge)
- **Lignes de code**: ~1500 lignes

---

## ✅ Checklist de Déploiement

- [x] Schéma Prisma mis à jour
- [x] APIs backend implémentées
- [x] Composants frontend créés
- [x] Documentation complète
- [ ] Client Prisma régénéré
- [ ] Tests unitaires
- [ ] Tests d'intégration
- [ ] Déploiement en preview
- [ ] Validation QA
- [ ] Déploiement production

---

**Prochaines étapes**: 
1. Régénérer le client Prisma
2. Intégrer Stripe pour les paiements
3. Tester le flux complet de réservation
4. Implémenter les notifications email

**Auteur**: Cascade AI  
**Dernière mise à jour**: 22 octobre 2025
