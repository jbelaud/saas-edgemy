# Logique de Réservation et Disponibilités

## 🎯 Concepts Clés

### Disponibilité (Availability)
Une **plage horaire** où le coach est disponible pour recevoir des réservations.
- Exemple: 8h-14h (6 heures de disponibilité)
- **Plusieurs réservations** peuvent être faites dans cette plage
- La disponibilité reste visible tant qu'il y a de l'espace libre

### Réservation (Reservation / PackageSession)
Un **créneau spécifique** réservé par un joueur.
- Exemple: 10h-11h30 (1h30 de session)
- **Bloque uniquement** ce créneau précis
- Empêche d'autres réservations qui chevaucheraient

---

## 📊 Exemples Concrets

### Exemple 1: Réservations Multiples sur une Disponibilité

**Coach crée une disponibilité**:
```
Dispo: Lundi 8h-14h (6 heures)
```

**Scénario de réservations**:
```
8h  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 14h
    🟢 DISPONIBLE (6h)

Joueur A réserve: 10h-11h30 (1h30)
8h  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 14h
    🟢 DISPO (2h)  🔴 RÉSERVÉ (1h30)  🟢 DISPO (2h30)

Joueur B réserve: 12h-13h (1h)
8h  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 14h
    🟢 (2h)  🔴 (1h30)  🟢 (30min)  🔴 (1h)  🟢 (1h)

Créneaux encore disponibles:
- 8h-10h (2h)
- 11h30-12h (30min)
- 13h-14h (1h)
```

**✅ Résultat**: La disponibilité 8h-14h reste active, mais avec des "trous" réservés.

---

### Exemple 2: Chevauchements Multi-Annonces

**Setup**:
- Coach a 2 annonces:
  - Annonce A: Sessions de 1h
  - Annonce B: Sessions de 1h30
- Disponibilité: Mardi 9h-12h (3h)

**Scénario**:
```
9h  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 12h
    🟢 DISPONIBLE (3h)

Joueur A réserve Annonce A: 9h-10h (1h)
9h  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 12h
    🔴 RÉSERVÉ (1h)  🟢 DISPONIBLE (2h)

Joueur B veut réserver Annonce B (1h30):
```

**Options pour Joueur B**:
- ✅ **10h-11h30** → OK (pas de chevauchement, dans la dispo)
- ❌ **10h30-12h** → IMPOSSIBLE (seulement 1h30 dispo, mais besoin de 1h30 CONTINUES)
- ❌ **11h-12h30** → IMPOSSIBLE (dépasse la disponibilité de 12h)
- ❌ **9h30-11h** → IMPOSSIBLE (chevauche la réservation de Joueur A)

**✅ Validation automatique** dans l'API:
1. Vérifier que le créneau est dans une disponibilité
2. Vérifier qu'il n'y a pas de chevauchement avec d'autres réservations
3. Vérifier que la durée demandée est respectée

---

### Exemple 3: Session de Pack sur Disponibilité Existante

**Coach crée une disponibilité**:
```
Mercredi 8h-12h (4h)
```

**Coach planifie une session de pack**:
```
Session pack avec Joueur C: 11h-12h (1h)
```

**Affichage dans le calendrier**:
```
8h  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 12h
    🟢 DISPONIBILITÉ (4h)
    🟣 SESSION PACK (1h) ← Par-dessus à 11h-12h
```

**✅ Les deux événements coexistent**:
- La disponibilité 8h-12h reste visible (vert)
- La session pack 11h-12h apparaît par-dessus (violet)
- Les joueurs voient que 11h-12h est occupé
- Ils peuvent réserver: 8h-11h (si durée ≤ 3h)

---

## 🔧 Implémentation Actuelle

### 1. Validation des Chevauchements (API)

**Fichier**: `src/app/api/coach/schedule-pack-session/route.ts` (ligne ~110)

```typescript
// Vérifier les chevauchements avec d'autres sessions du coach
const overlapping = await prisma.packageSession.findFirst({
  where: {
    package: {
      coachId: coach.id,
    },
    status: {
      in: ['SCHEDULED', 'COMPLETED'],
    },
    OR: [
      {
        AND: [
          { startDate: { lte: start } },
          { endDate: { gt: start } },
        ],
      },
      {
        AND: [
          { startDate: { lt: end } },
          { endDate: { gte: end } },
        ],
      },
      {
        AND: [
          { startDate: { gte: start } },
          { endDate: { lte: end } },
        ],
      },
    ],
  },
});

if (overlapping) {
  return NextResponse.json(
    { error: 'Ce créneau chevauche une session existante' },
    { status: 400 }
  );
}
```

**✅ Cette validation empêche**:
- Deux sessions qui se chevauchent
- Réserver un créneau déjà occupé

---

### 2. Affichage dans le Calendrier

**Fichier**: `src/components/calendar/CoachCalendar.tsx` (ligne ~45)

```typescript
// Combiner les deux types d'événements
const allEvents: CalendarEvent[] = [
  // Disponibilités (vert)
  ...availabilities.map((slot) => ({
    id: `avail-${slot.id}`,
    title: "Disponible",
    start: new Date(slot.start),
    end: new Date(slot.end),
    type: 'availability' as const,
  })),
  // Sessions (violet)
  ...sessions.map((session) => ({
    id: `session-${session.id}`,
    sessionId: session.id,
    title: `Session - ${session.package.player.name}`,
    start: new Date(session.startDate),
    end: new Date(session.endDate),
    type: 'session' as const,
    playerName: session.package.player.name,
  })),
];
```

**✅ Les deux types d'événements s'affichent simultanément**:
- React Big Calendar gère automatiquement la superposition
- Les couleurs différentes permettent de distinguer

---

### 3. Validation Côté Réservation Joueur (À VÉRIFIER)

**Fichier à vérifier**: `src/app/api/reservations/route.ts` ou équivalent

**Doit inclure**:
```typescript
// 1. Vérifier que le créneau est dans une disponibilité
const availability = await prisma.availability.findFirst({
  where: {
    coachId: coachId,
    start: { lte: requestedStart },
    end: { gte: requestedEnd },
  },
});

if (!availability) {
  return NextResponse.json(
    { error: 'Aucune disponibilité pour ce créneau' },
    { status: 400 }
  );
}

// 2. Vérifier les chevauchements avec d'autres réservations
const overlappingReservation = await prisma.reservation.findFirst({
  where: {
    coach: { id: coachId },
    status: { in: ['CONFIRMED', 'PENDING'] },
    OR: [
      // Même logique de chevauchement que pour les sessions
    ],
  },
});

// 3. Vérifier les chevauchements avec les sessions de pack
const overlappingPackSession = await prisma.packageSession.findFirst({
  where: {
    package: { coachId: coachId },
    status: { in: ['SCHEDULED', 'COMPLETED'] },
    OR: [
      // Même logique de chevauchement
    ],
  },
});

if (overlappingReservation || overlappingPackSession) {
  return NextResponse.json(
    { error: 'Ce créneau est déjà réservé' },
    { status: 400 }
  );
}
```

---

## 🎨 Affichage Visuel pour le Joueur

### Dans le Calendrier Public (BookingModal)

**Fichier**: `src/components/calendar/CoachPublicCalendarSimple.tsx`

**Actuellement**: Affiche seulement les disponibilités (vert)

**À AMÉLIORER**: Afficher aussi les créneaux occupés (grisés)

```typescript
// Récupérer les disponibilités
const availabilities = await fetch(`/api/coach/${coachId}/availability`);

// Récupérer les créneaux occupés (réservations + sessions)
const occupiedSlots = await fetch(`/api/coach/${coachId}/occupied-slots`);

// Afficher:
// - Disponibilités en vert
// - Créneaux occupés en gris (non cliquables)
// - Créneaux libres = disponibilités MOINS créneaux occupés
```

---

## ✅ Checklist de Vérification

### Actuellement Implémenté:
- ✅ Disponibilités peuvent contenir plusieurs réservations
- ✅ Sessions de pack s'affichent en violet sur le calendrier coach
- ✅ Validation des chevauchements pour sessions de pack
- ✅ Différenciation visuelle (vert/violet)

### À Vérifier/Améliorer:
- [ ] API de réservation joueur valide bien les chevauchements
- [ ] Calendrier public affiche les créneaux occupés
- [ ] Algorithme de calcul des créneaux disponibles (tous les 30min)
- [ ] Gestion des cas limites (ex: session 10h30-12h sur dispo 9h-12h avec réservation 9h-10h)

### À Implémenter:
- [ ] API `/api/coach/[coachId]/occupied-slots` pour le calendrier public
- [ ] Affichage des créneaux occupés dans `CoachPublicCalendarSimple`
- [ ] Tests de chevauchement multi-annonces

---

## 🚨 Cas Limites à Gérer

### Cas 1: Réservation qui "coupe" une disponibilité
```
Dispo: 9h-12h
Réservation: 10h-11h
Créneaux disponibles: 9h-10h ET 11h-12h
```
**Solution**: Calculer dynamiquement les créneaux libres

### Cas 2: Durée de session > espace disponible
```
Dispo: 9h-12h (3h)
Réservation A: 9h-10h (1h)
Joueur B veut: 2h30
Espace restant: 10h-12h (2h)
```
**Solution**: ❌ Refuser, pas assez d'espace continu

### Cas 3: Chevauchement partiel
```
Réservation A: 10h-11h30
Tentative B: 11h-12h
```
**Solution**: ❌ Refuser, chevauchement de 11h-11h30

---

## 📝 Recommandations

1. **Créer une API dédiée** pour calculer les créneaux disponibles:
   ```
   GET /api/coach/[coachId]/available-slots?date=2025-01-27&duration=90
   ```
   - Prend en compte les disponibilités
   - Soustrait les réservations existantes
   - Soustrait les sessions de pack
   - Retourne une liste de créneaux libres

2. **Améliorer le calendrier public** pour afficher:
   - Créneaux disponibles (vert)
   - Créneaux occupés (gris, non cliquables)
   - Durée minimale respectée

3. **Tester tous les cas de chevauchement** avant la production

---

**Date de création**: 27 janvier 2025  
**Priorité**: HAUTE - Validation critique pour les réservations
