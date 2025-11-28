# 🎯 Système de Packs d'Heures - Documentation d'implémentation

## ✅ Phase 1 : Base de données (TERMINÉ)

### Modèles créés

#### **AnnouncementPack**
```prisma
model AnnouncementPack {
  id             String   @id @default(cuid())
  announcementId String
  announcement   Announcement @relation(fields: [announcementId], references: [id], onDelete: Cascade)
  
  hours          Int      // Nombre d'heures (5, 10, etc.)
  totalPrice     Int      // Prix total en centimes
  discountPercent Int?    // Pourcentage de réduction optionnel
  
  isActive       Boolean  @default(true)
  reservations   Reservation[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

#### **Reservation (mis à jour)**
```prisma
model Reservation {
  // ... champs existants
  
  // Nouveaux champs pour les packs
  packId          String?
  pack            AnnouncementPack? @relation(fields: [packId], references: [id])
  sessionNumber   Int?         // Numéro de session dans le pack (1, 2, 3...)
}
```

---

## 🚀 Phase 2 : Côté Coach (EN COURS)

### 2.1 Gestion des packs dans les annonces

#### **Composant : `PacksManager.tsx`**
**Localisation** : `src/components/coach/announcements/PacksManager.tsx`

**Fonctionnalités** :
- Afficher les packs existants pour une annonce
- Ajouter un nouveau pack (5h, 10h, etc.)
- Modifier/Supprimer un pack
- Calculer automatiquement le prix avec réduction

**Interface** :
```tsx
interface PacksManagerProps {
  announcementId: string;
  hourlyRate: number; // Prix de base par heure
  packs: AnnouncementPack[];
  onUpdate: () => void;
}
```

**Exemple d'affichage** :
```
📦 Packs disponibles
┌─────────────────────────────────────┐
│ Pack 5h - 450€ (10% de réduction)   │
│ [Modifier] [Supprimer]              │
├─────────────────────────────────────┤
│ Pack 10h - 850€ (15% de réduction)  │
│ [Modifier] [Supprimer]              │
└─────────────────────────────────────┘
[+ Ajouter un pack]
```

---

### 2.2 Dashboard "Mes Packs"

#### **Page : `/coach/packs`**
**Localisation** : `src/app/[locale]/(app)/coach/packs/page.tsx`

**Fonctionnalités** :
- Liste des packs achetés par les joueurs
- Statut des sessions (planifiées, effectuées, à planifier)
- Bouton "Ajouter une date" pour planifier les sessions restantes

**Structure d'affichage** :
```
🎯 Pack 5h — PlayerX
├─ ✅ 1ère session : 22 oct, 20h00 (Effectuée)
├─ ⏳ 2ème session : 29 oct, 20h00 (Planifiée)
├─ ⚙️ 3 sessions restantes à planifier
└─ [+ Ajouter une date]

🎯 Pack 10h — PlayerY
├─ ✅ 1ère session : 25 oct, 18h00 (Effectuée)
├─ ⏳ 2ème session : 01 nov, 18h00 (Planifiée)
├─ ⚙️ 8 sessions restantes à planifier
└─ [+ Ajouter une date]
```

---

### 2.3 Modale de planification

#### **Composant : `SchedulePackSessionModal.tsx`**
**Localisation** : `src/components/coach/packs/SchedulePackSessionModal.tsx`

**Fonctionnalités** :
- Sélection de la date et heure
- Vérification des disponibilités du coach
- Création automatique de la réservation
- ⚠️ **Placeholder pour notification** : "Notification à implémenter"

**Props** :
```tsx
interface SchedulePackSessionModalProps {
  packId: string;
  playerId: string;
  playerName: string;
  announcementId: string;
  currentSessionNumber: number;
  totalSessions: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}
```

---

### 2.4 API Routes

#### **Route : `/api/coach/announcement/[id]/packs`**
**Méthodes** :
- `GET` : Récupérer les packs d'une annonce
- `POST` : Créer un nouveau pack
- `PUT` : Modifier un pack
- `DELETE` : Supprimer un pack

**Exemple POST** :
```typescript
{
  announcementId: "xxx",
  hours: 5,
  totalPrice: 45000, // 450€ en centimes
  discountPercent: 10
}
```

#### **Route : `/api/coach/packs`**
**Méthodes** :
- `GET` : Récupérer tous les packs achetés (avec sessions)

**Réponse** :
```typescript
{
  packs: [
    {
      id: "pack123",
      hours: 5,
      totalPrice: 45000,
      player: { name: "PlayerX", email: "..." },
      announcement: { title: "Review MTT" },
      sessions: [
        { sessionNumber: 1, startDate: "...", status: "COMPLETED" },
        { sessionNumber: 2, startDate: "...", status: "CONFIRMED" },
      ],
      remainingSessions: 3
    }
  ]
}
```

#### **Route : `/api/coach/packs/[id]/schedule`**
**Méthode** : `POST`
**Body** :
```typescript
{
  packId: "pack123",
  startDate: "2025-10-29T20:00:00Z",
  endDate: "2025-10-29T21:00:00Z",
  sessionNumber: 3
}
```

---

## 📱 Phase 3 : Côté Joueur (À IMPLÉMENTER PLUS TARD)

### 3.1 Modale de réservation avec choix du pack

#### **Composant : `BookingModal.tsx` (à mettre à jour)**
**Localisation** : `src/components/coach/public/BookingModal.tsx`

**Modifications nécessaires** :
1. Ajouter une étape de sélection du type de réservation :
   - Session unitaire (1h - 100€)
   - Pack 5h (450€)
   - Pack 10h (850€)

2. Si pack sélectionné :
   - Afficher un message : "Vous réservez la première session de votre pack de 5h. Les autres seront planifiées avec votre coach."
   - Ne demander qu'une seule date/heure
   - Passer `packId` au paiement Stripe

3. Après paiement :
   - Créer la première réservation avec `packId` et `sessionNumber: 1`
   - Rediriger vers le dashboard joueur avec message de confirmation

---

### 3.2 Dashboard Joueur - Suivi des packs

#### **Page : `/player/dashboard`** (À CRÉER)
**Localisation** : `src/app/[locale]/(app)/player/dashboard/page.tsx`

**Section "Mes Packs"** :
```
📦 Pack 5h avec Coach Nino
├─ ✅ 22 oct, 20h00 (Effectuée)
├─ ⏳ 29 oct, 20h00 (Planifiée)
├─ ⏳ 05 nov, 20h00 (Planifiée)
└─ ⚙️ 2 sessions à planifier par le coach

📦 Pack 10h avec Coach Sarah
├─ ✅ 25 oct, 18h00 (Effectuée)
└─ ⚙️ 9 sessions à planifier par le coach
```

**Statuts** :
- ✅ `COMPLETED` : Session effectuée
- ⏳ `CONFIRMED` : Session planifiée
- ⚙️ `PENDING` : À planifier par le coach

---

### 3.3 API Routes côté joueur

#### **Route : `/api/player/packs`**
**Méthode** : `GET`
**Réponse** :
```typescript
{
  packs: [
    {
      id: "pack123",
      hours: 5,
      totalPrice: 45000,
      coach: { name: "Coach Nino", slug: "nino" },
      announcement: { title: "Review MTT" },
      sessions: [
        { sessionNumber: 1, startDate: "...", status: "COMPLETED" },
        { sessionNumber: 2, startDate: "...", status: "CONFIRMED" },
      ],
      remainingSessions: 3
    }
  ]
}
```

---

## 📧 Phase 4 : Notifications (À IMPLÉMENTER PLUS TARD)

### 4.1 Emails à envoyer

#### **Achat d'un pack**
- **Destinataires** : Coach + Joueur
- **Template** : `pack-purchased.html`
- **Variables** :
  - `playerName`
  - `coachName`
  - `packHours`
  - `totalPrice`
  - `firstSessionDate`

#### **Nouvelle session planifiée**
- **Destinataire** : Joueur
- **Template** : `pack-session-scheduled.html`
- **Variables** :
  - `playerName`
  - `coachName`
  - `sessionNumber`
  - `sessionDate`
  - `sessionTime`

#### **Session terminée**
- **Destinataires** : Coach + Joueur
- **Template** : `pack-session-completed.html`
- **Variables** :
  - `playerName`
  - `coachName`
  - `sessionNumber`
  - `remainingSessions`

---

### 4.2 Service de notification

#### **Fichier : `src/lib/notifications.ts`**
```typescript
export async function notifyPackPurchased(packId: string) {
  // TODO: Implémenter l'envoi d'email via Brevo
  console.log('🔔 Notification pack acheté:', packId);
}

export async function notifySessionScheduled(reservationId: string) {
  // TODO: Implémenter l'envoi d'email via Brevo
  console.log('🔔 Notification session planifiée:', reservationId);
}

export async function notifySessionCompleted(reservationId: string) {
  // TODO: Implémenter l'envoi d'email via Brevo
  console.log('🔔 Notification session terminée:', reservationId);
}
```

---

## 🎯 Ordre d'implémentation recommandé

### ✅ **Étape 1 : Base de données** (TERMINÉ)
- [x] Modèle `AnnouncementPack`
- [x] Champs `packId` et `sessionNumber` dans `Reservation`
- [x] Migration appliquée

### 🚀 **Étape 2 : Gestion des packs (Coach)**
- [ ] Composant `PacksManager.tsx`
- [ ] API `/api/coach/announcement/[id]/packs`
- [ ] Intégration dans la page d'édition d'annonce

### 🚀 **Étape 3 : Dashboard Packs (Coach)**
- [ ] Page `/coach/packs`
- [ ] Composant `SchedulePackSessionModal.tsx`
- [ ] API `/api/coach/packs`
- [ ] API `/api/coach/packs/[id]/schedule`

### ⏳ **Étape 4 : Côté Joueur** (PLUS TARD)
- [ ] Mise à jour `BookingModal.tsx`
- [ ] Page `/player/dashboard`
- [ ] API `/api/player/packs`

### ⏳ **Étape 5 : Notifications** (PLUS TARD)
- [ ] Service de notifications
- [ ] Templates d'emails Brevo
- [ ] Intégration dans les API

---

## 📊 Résumé des fichiers à créer/modifier

### **À créer** :
- `src/components/coach/announcements/PacksManager.tsx`
- `src/app/[locale]/(app)/coach/packs/page.tsx`
- `src/components/coach/packs/SchedulePackSessionModal.tsx`
- `src/app/api/coach/announcement/[id]/packs/route.ts`
- `src/app/api/coach/packs/route.ts`
- `src/app/api/coach/packs/[id]/schedule/route.ts`

### **À modifier** :
- `src/components/coach/announcements/CreateAnnouncementModalV2.tsx` (ajouter gestion packs)
- `src/components/coach/dashboard/DashboardAnnouncements.tsx` (afficher packs)

### **Pour plus tard** :
- `src/components/coach/public/BookingModal.tsx`
- `src/app/[locale]/(app)/player/dashboard/page.tsx`
- `src/app/api/player/packs/route.ts`
- `src/lib/notifications.ts`

---

## 🎨 Design System

### **Couleurs des statuts** :
- ✅ **Effectuée** : `bg-green-100 text-green-800`
- ⏳ **Planifiée** : `bg-blue-100 text-blue-800`
- ⚙️ **À planifier** : `bg-gray-100 text-gray-800`

### **Icônes** :
- Pack : `Package` (lucide-react)
- Session effectuée : `CheckCircle2`
- Session planifiée : `Clock`
- À planifier : `Settings`
- Ajouter date : `Plus`

---

**📅 Dernière mise à jour** : 20 octobre 2025
**👤 Auteur** : Cascade AI
**🎯 Statut** : Phase 1 terminée, Phase 2 en cours
