# Système de Réservation - Implémentation Complète

## 📅 Date : 23 octobre 2025

## ✅ Modifications Effectuées

### 1️⃣ API `/api/coach/[coachId]/available-slots`

**Fichier** : `src/app/api/coach/[coachId]/available-slots/route.ts`

**Changements** :
- ✅ Ajout de dates par défaut (aujourd'hui + 30 jours) si non fournies
- ✅ Seul `announcementId` est maintenant requis
- ✅ L'API génère automatiquement les créneaux disponibles tous les 30 minutes
- ✅ Filtre les réservations existantes et les exceptions

**Format de réponse** :
```json
{
  "slots": [
    {
      "start": "2025-10-25T14:00:00.000Z",
      "end": "2025-10-25T15:00:00.000Z"
    }
  ]
}
```

---

### 2️⃣ Composant `CoachCalendar`

**Fichier** : `src/components/coach/dashboard/CoachCalendar.tsx`

**Changements** :
- ✅ Ajout d'un rechargement automatique toutes les 30 secondes
- ✅ Affichage en temps réel des nouvelles réservations
- ✅ Distinction visuelle : disponibilités (vert), réservations (orange), packs (bleu)

**Utilisation** :
```tsx
<CoachCalendar coachId={coach.id} />
```

---

### 3️⃣ Composant `CoachAvailabilityCalendar`

**Fichier** : `src/components/coach/public/CoachAvailabilityCalendar.tsx`

**Changements** :
- ✅ Charge les créneaux sur 30 jours par défaut
- ✅ Affiche les créneaux groupés par date
- ✅ Permet la sélection d'un créneau
- ✅ Callback `onSelectSlot` pour communiquer avec le parent

**Utilisation** :
```tsx
<CoachAvailabilityCalendar
  coachId={coachId}
  announcementId={announcementId}
  onSelectSlot={(slot) => setSelectedSlot(slot)}
/>
```

---

### 4️⃣ Composant `BookingModal`

**Fichier** : `src/components/coach/public/BookingModal.tsx`

**Changements majeurs** :
- ✅ Intégration du composant `CoachAvailabilityCalendar`
- ✅ Suppression de la gestion manuelle des créneaux
- ✅ Envoi correct des données à l'API `/api/reservations`
- ✅ Gestion des erreurs 409 (créneau déjà réservé)
- ✅ Affichage d'un message de succès avec animation
- ✅ Rechargement automatique de la page après réservation

**Format des données envoyées** :
```json
{
  "announcementId": "...",
  "coachId": "...",
  "startDate": "2025-10-25T14:00:00.000Z",
  "endDate": "2025-10-25T15:00:00.000Z",
  "packageId": null
}
```

---

## 🧪 Scénario de Test Complet

### Prérequis
1. Un compte coach avec statut `ACTIVE`
2. Au moins une annonce publiée
3. Un compte joueur

### Étape 1 : Ajouter des disponibilités (Coach)
1. Se connecter en tant que coach
2. Aller sur `/coach/dashboard`
3. Utiliser le composant `AvailabilityManager` pour ajouter des créneaux :
   - **Type** : Récurrent
   - **Jour** : Lundi
   - **Heures** : 14:00 - 18:00
4. ✅ Vérifier que le créneau apparaît dans la liste
5. ✅ Vérifier que le `CoachCalendar` affiche le créneau en vert

### Étape 2 : Voir les disponibilités sur le profil public (Visiteur)
1. Ouvrir le profil public du coach : `/coach/[slug]`
2. Cliquer sur une annonce
3. ✅ Vérifier que les créneaux disponibles s'affichent dans le calendrier
4. ✅ Vérifier que seuls les créneaux futurs sont affichés

### Étape 3 : Réserver une session (Joueur)
1. Se connecter en tant que joueur
2. Aller sur le profil du coach
3. Cliquer sur "Réserver" sur une annonce
4. Dans le `BookingModal` :
   - ✅ Sélectionner une date avec des créneaux disponibles
   - ✅ Sélectionner un créneau horaire
   - ✅ (Optionnel) Ajouter un message
   - ✅ Cliquer sur "Confirmer la réservation"
5. ✅ Vérifier le message de succès "Réservation confirmée !"
6. ✅ Vérifier que la modale se ferme automatiquement après 2 secondes

### Étape 4 : Vérifier la réservation (Coach)
1. Retourner sur le dashboard coach
2. ✅ Vérifier que le créneau réservé apparaît en orange dans le `CoachCalendar`
3. ✅ Vérifier que le créneau n'est plus disponible pour d'autres joueurs

### Étape 5 : Tester les conflits
1. Essayer de réserver le même créneau avec un autre joueur
2. ✅ Vérifier que le créneau n'apparaît plus dans les disponibilités
3. Si on force une requête API directe :
   - ✅ Vérifier l'erreur 409 "Ce créneau n'est plus disponible"

---

## 🔄 Flux de Données

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUX DE RÉSERVATION                       │
└─────────────────────────────────────────────────────────────┘

1. Coach ajoute disponibilités
   └─> POST /api/coach/availability
       └─> Stockage en DB (type: RECURRING/SPECIFIC)

2. Joueur consulte profil coach
   └─> GET /api/coach/[coachId]/available-slots?announcementId=...
       └─> Algorithme génère créneaux de 30min
       └─> Filtre réservations existantes
       └─> Retourne { slots: [{start, end}] }

3. Joueur sélectionne créneau
   └─> CoachAvailabilityCalendar
       └─> onSelectSlot(slot)
       └─> BookingModal reçoit {start, end}

4. Joueur confirme réservation
   └─> POST /api/reservations
       ├─> Vérifie disponibilité (race condition)
       ├─> Crée Reservation (status: CONFIRMED)
       └─> Retourne { reservation }

5. Mise à jour automatique
   └─> router.refresh()
   └─> CoachCalendar recharge toutes les 30s
   └─> Créneau devient indisponible
```

---

## 🎯 Points Critiques Validés

### ✅ Gestion des fuseaux horaires
- Toutes les dates sont stockées en UTC dans la DB
- L'affichage se fait en heure locale du navigateur
- Le coach peut définir son timezone dans son profil

### ✅ Validation des créneaux
- Vérification de disponibilité avant création (évite race conditions)
- Erreur 409 si le créneau est déjà réservé
- Les créneaux réservés sont automatiquement exclus

### ✅ Algorithme de génération
- Créneaux générés tous les 30 minutes
- Respect de la durée de l'annonce (durationMin)
- Filtrage des chevauchements

### ✅ Performance
- Période limitée à 30 jours par défaut
- Rechargement automatique toutes les 30s (pas de polling intensif)
- Requêtes optimisées avec indexes Prisma

---

## 🚀 Prochaines Étapes (Non incluses)

### Phase 2 : Paiement Stripe
- [ ] Intégrer Stripe Checkout dans BookingModal
- [ ] Créer webhook pour confirmer paiement
- [ ] Mettre à jour status réservation après paiement

### Phase 3 : Gestion des packs
- [ ] Permettre réservation de packs d'heures
- [ ] Planification des sessions suivantes
- [ ] Dashboard packs pour coach et joueur

### Phase 4 : Notifications
- [ ] Email de confirmation au joueur
- [ ] Email de notification au coach
- [ ] Rappels automatiques (n8n)

### Phase 5 : Gestion avancée
- [ ] Annulation de réservation
- [ ] Modification de créneau
- [ ] Système de remboursement

---

## 📝 Notes Techniques

### Modèles Prisma utilisés
- `Availability` : Disponibilités coach (RECURRING, SPECIFIC, EXCEPTION)
- `Reservation` : Réservations avec statut (PENDING, CONFIRMED, CANCELLED, COMPLETED)
- `Announcement` : Annonces avec durée et prix
- `CoachingPackage` : Packs d'heures (pour phase 3)

### APIs disponibles
- `GET /api/coach/availability` : Récupérer disponibilités du coach connecté
- `POST /api/coach/availability` : Ajouter une disponibilité
- `DELETE /api/coach/availability?id=...` : Supprimer une disponibilité
- `GET /api/coach/[coachId]/available-slots` : Calculer créneaux disponibles
- `POST /api/reservations` : Créer une réservation
- `GET /api/reservations` : Récupérer réservations (coach ou joueur)

### Composants disponibles
- `AvailabilityManager` : Gestion CRUD des disponibilités coach
- `CoachCalendar` : Vue calendrier dashboard coach
- `CoachAvailabilityCalendar` : Sélection créneaux pour joueur
- `BookingModal` : Modale de réservation complète

---

## ✅ Checklist de Validation

- [x] API available-slots retourne le bon format
- [x] CoachCalendar se recharge automatiquement
- [x] CoachAvailabilityCalendar affiche les créneaux
- [x] BookingModal crée correctement les réservations
- [x] Gestion des erreurs 409 (conflits)
- [x] Message de succès après réservation
- [x] Rechargement automatique de la page
- [x] Les créneaux réservés disparaissent
- [ ] Test end-to-end complet (à faire manuellement)

---

**Date de dernière mise à jour** : 23 octobre 2025  
**Statut** : ✅ Prêt pour tests
