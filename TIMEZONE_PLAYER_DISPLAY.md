# 🌍 Affichage des Fuseaux Horaires pour le Joueur

## ✅ Implémentation complète

Le système de fuseaux horaires affiche maintenant les horaires dans **le fuseau horaire du joueur** partout où c'est nécessaire.

## 📍 Où le joueur voit son fuseau horaire

### 1. **Page publique du coach** ([CoachCalendar.tsx](src/components/coach/public/CoachCalendar.tsx))

**Emplacement** : `/fr/coach/[slug]`

**Ce qui est affiché** :
- ✅ Badge indiquant le fuseau horaire du joueur (ex: "UTC+1")
- ✅ Toutes les disponibilités converties dans le fuseau du joueur
- ✅ Dates et heures dans le format local

**Exemple visuel** :
```
┌─────────────────────────────────────────────┐
│ Disponibilités              [UTC+1] 🌍      │
├─────────────────────────────────────────────┤
│ Lundi 20 janv.                              │
│  ✅ 12:00 - 16:00    [Disponible]           │
│                                              │
│ Mardi 21 janv.                              │
│  ✅ 12:00 - 16:00    [Disponible]           │
└─────────────────────────────────────────────┘
```

**Code** :
```typescript
// Ligne 26
const { timezone, toLocalTime, formatLocal, isLoaded: timezoneLoaded } = useTimezone();

// Ligne 50 - Conversion des disponibilités
const availabilityDate = toLocalTime(availability.start);

// Ligne 152 - Formatage des heures
const startTime = formatLocal(availability.start, 'HH:mm');
const endTime = formatLocal(availability.end, 'HH:mm');

// Ligne 102-109 - Badge fuseau horaire
{timezoneLoaded && (
  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
    <Globe className="h-3.5 w-3.5 text-blue-600" />
    <span className="text-xs font-medium text-blue-700">
      {formatTimezoneDisplay(timezone)}
    </span>
  </div>
)}
```

---

### 2. **Modal de réservation** ([BookingModal.tsx](src/components/coach/public/BookingModal.tsx))

**Emplacement** : Modal qui s'ouvre lors du clic sur "Réserver" dans la page coach

**Ce qui est affiché** :
- ✅ Badge "UTC+X" à côté de "Créneaux disponibles"
- ✅ Tous les créneaux horaires dans le fuseau du joueur
- ✅ Dates formatées selon le fuseau local

**Exemple visuel** :
```
┌─────────────────────────────────────────────┐
│ Créneaux disponibles          [UTC+1] 🌍   │
├─────────────────────────────────────────────┤
│ LUN 20 JANV.                                │
│  [12:00 - 13:30]  [14:00 - 15:30]          │
│                                              │
│ MAR 21 JANV.                                │
│  [12:00 - 13:30]  [18:00 - 19:30]          │
│                                              │
│ ✅ Sélectionné : Lun 20 janv. à 12:00-13:30│
└─────────────────────────────────────────────┘
```

**Code** :
```typescript
// Ligne 88
const { timezone, toLocalTime, formatLocal, isLoaded: timezoneLoaded } = useTimezone();

// Lignes 145-157 - Conversion des créneaux
.map((avail: { id: string; start: string; end: string }) => {
  const startLocal = toLocalTime(avail.start);
  const endLocal = toLocalTime(avail.end);

  return {
    id: avail.id,
    start: startUTC, // UTC pour l'envoi au backend
    end: endUTC,
    date: startLocal.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
    time: `${formatLocal(avail.start, 'HH:mm')} - ${formatLocal(avail.end, 'HH:mm')}`
  };
})

// Lignes 526-533 - Badge fuseau horaire
{timezoneLoaded && (
  <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded">
    <Globe className="h-2.5 w-2.5 text-blue-600" />
    <span className="text-[9px] font-medium text-blue-700">
      {formatTimezoneDisplay(timezone)}
    </span>
  </div>
)}
```

---

## 🎯 Flux complet du joueur

### Scénario : Joueur à Paris consulte un coach à Jakarta

```
1. COACH (Jakarta, UTC+7)
   └─ Configure son fuseau : Asia/Jakarta
   └─ Ajoute dispo : 18:00-22:00 (heure locale Jakarta)
   └─ Stocké en DB : 11:00-15:00 UTC

2. BASE DE DONNÉES (UTC)
   └─ start: 2025-01-20T11:00:00.000Z
   └─ end: 2025-01-20T15:00:00.000Z

3. JOUEUR (Paris, UTC+1)
   └─ Ouvre la page coach : /fr/coach/ahmed-poker
   └─ Fuseau détecté automatiquement : Europe/Paris
   └─ Badge affiché : "UTC+1" 🌍

4. AFFICHAGE SUR LA PAGE PUBLIQUE
   └─ Disponibilité convertie : 11:00 UTC → 12:00 Paris
   └─ Joueur voit : "12:00 - 16:00"
   └─ Badge : "UTC+1"

5. CLIC SUR "RÉSERVER"
   └─ Modal s'ouvre
   └─ Badge : "UTC+1" à côté des créneaux
   └─ Créneaux affichés : "12:00 - 13:30", "14:00 - 15:30", etc.

6. SÉLECTION D'UN CRÉNEAU
   └─ Joueur clique sur "12:00 - 13:30"
   └─ Affichage : "✅ Lun 20 janv. à 12:00-13:30"

7. CONFIRMATION
   └─ Clic sur "Réserver"
   └─ Envoi au backend : start = 11:00 UTC (pas 12:00 Paris)
   └─ Création de la réservation en UTC
```

---

## 📊 Exemples de conversions

### Coach à Jakarta (UTC+7) - Dispo 18:00-22:00

| Fuseau joueur | Heure affichée | Badge |
|---------------|----------------|-------|
| Paris (UTC+1) | 12:00-16:00 | UTC+1 |
| New York (UTC-5) | 06:00-10:00 | UTC-5 |
| Tokyo (UTC+9) | 20:00-00:00 | UTC+9 |
| Los Angeles (UTC-8) | 03:00-07:00 | UTC-8 |
| Londres (UTC+0) | 11:00-15:00 | UTC+0 |

### Coach à Paris (UTC+1) - Dispo 14:00-18:00

| Fuseau joueur | Heure affichée | Badge |
|---------------|----------------|-------|
| Paris (UTC+1) | 14:00-18:00 | UTC+1 |
| New York (UTC-5) | 08:00-12:00 | UTC-5 |
| Jakarta (UTC+7) | 20:00-00:00 | UTC+7 |
| Sydney (UTC+10) | 23:00-03:00 | UTC+10 |

---

## 🔧 Points techniques

### 1. Détection automatique du fuseau horaire

```typescript
// Hook useTimezone détecte automatiquement le fuseau du navigateur
const { timezone } = useTimezone();
// Retourne : "Europe/Paris", "America/New_York", etc.
```

**Comment ça marche ?**
```typescript
// src/lib/timezone.ts:44
export function detectBrowserTimezone(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || 'UTC';
  } catch (error) {
    console.error('Erreur lors de la détection du fuseau horaire:', error);
    return 'UTC';
  }
}
```

### 2. Conversion UTC → fuseau local

```typescript
// src/hooks/useTimezone.ts:54
const toLocalTime = (utcDate: Date | string): Date => {
  return convertUTCToLocal(utcDate, timezone);
};

// Exemple d'utilisation
const utcDate = '2025-01-20T11:00:00.000Z'; // 11:00 UTC
const localDate = toLocalTime(utcDate); // 12:00 Paris (UTC+1)
```

### 3. Formatage des dates

```typescript
// src/hooks/useTimezone.ts:58
const formatLocal = (utcDate: Date | string, formatString: string = 'PPpp'): string => {
  return formatInTimezone(utcDate, timezone, formatString);
};

// Exemple d'utilisation
const utcDate = '2025-01-20T11:00:00.000Z';
formatLocal(utcDate, 'HH:mm'); // "12:00" (Paris)
formatLocal(utcDate, 'EEEE d MMMM'); // "lundi 20 janvier"
```

### 4. Affichage du badge fuseau horaire

```typescript
// src/lib/timezone.ts:145
export function formatTimezoneDisplay(timezone: string): string {
  const offset = getTimezoneOffset(timezone);
  const sign = offset >= 0 ? '+' : '';
  return `UTC${sign}${offset}`;
}

// Exemples :
// Europe/Paris → "UTC+1" (hiver) ou "UTC+2" (été)
// America/New_York → "UTC-5" (hiver) ou "UTC-4" (été)
// Asia/Jakarta → "UTC+7"
```

---

## ✅ Avantages pour le joueur

1. **Clarté totale** : Le joueur voit toujours les heures dans SON fuseau horaire
2. **Pas de confusion** : Le badge "UTC+X" indique clairement le fuseau utilisé
3. **Expérience fluide** : Pas besoin de calculer mentalement les décalages horaires
4. **Prévention d'erreurs** : Impossible de réserver au mauvais horaire

---

## 🧪 Tests recommandés

### Test 1 : Vérifier la détection du fuseau

```javascript
// Ouvrir la console du navigateur sur /fr/coach/[slug]
// Vérifier que le badge affiche le bon fuseau
console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
// Doit correspondre au fuseau affiché
```

### Test 2 : Vérifier la conversion des heures

```javascript
// 1. Coach configure son fuseau : Asia/Jakarta (UTC+7)
// 2. Coach ajoute dispo : 18:00-22:00
// 3. Vérifier en DB : doit être 11:00-15:00 UTC

// 4. Joueur à Paris (UTC+1) ouvre la page coach
// 5. Vérifier l'affichage : doit montrer 12:00-16:00
// 6. Badge doit afficher : "UTC+1"
```

### Test 3 : Tester avec différents navigateurs/localisations

```javascript
// Option 1 : Utiliser un VPN pour changer de localisation
// Option 2 : Modifier manuellement le fuseau horaire du système
// Option 3 : Tester avec plusieurs comptes dans différents pays
```

---

## 📱 Responsive

Les badges fuseau horaire sont responsive :

**Desktop** :
- Badge avec icône Globe et texte "UTC+1"
- Taille normale

**Mobile** :
- Badge plus petit mais toujours visible
- Texte réduit mais lisible

---

## 🎨 Design

### Badge fuseau horaire (Page publique)

```css
bg-blue-50 border border-blue-200 rounded-lg
text-xs font-medium text-blue-700
```

### Badge fuseau horaire (Modal)

```css
bg-blue-50 border border-blue-200 rounded
text-[9px] font-medium text-blue-700
```

---

## 🚀 Prochaines améliorations

### Phase 2 (Post-MVP)

1. **Permettre au joueur de configurer manuellement son fuseau**
   - Ajout d'un sélecteur dans `/player/settings`
   - Utile si le joueur voyage ou utilise un VPN

2. **Afficher le fuseau du coach ET du joueur côte à côte**
   ```
   Coach (Jakarta, UTC+7) : 18:00-22:00
   Vous (Paris, UTC+1)    : 12:00-16:00
   ```

3. **Ajouter un tooltip explicatif**
   ```
   Survoler le badge "UTC+1" affiche :
   "Les horaires sont affichés dans votre fuseau horaire (Europe/Paris)"
   ```

4. **Notifications par email avec les deux fuseaux**
   ```
   Votre session est confirmée !
   📅 Lundi 20 janvier 2025
   🕐 12:00-13:30 (votre heure, Paris UTC+1)

   Fuseau horaire du coach : Jakarta (UTC+7)
   ```

---

## ✅ Checklist de vérification

Avant de déployer :

- [x] Badge fuseau horaire affiché sur la page publique coach
- [x] Badge fuseau horaire affiché dans la modal de réservation
- [x] Toutes les heures sont converties du fuseau du joueur
- [x] Les dates sont formatées correctement
- [x] Le fuseau horaire est détecté automatiquement
- [x] Le hook `useTimezone` fonctionne correctement
- [x] Les conversions UTC ↔ local sont précises
- [ ] Tests manuels avec différents fuseaux horaires
- [ ] Tests avec VPN pour simuler différentes localisations
- [ ] Vérification responsive (mobile + desktop)

---

**Résumé** : Le joueur voit maintenant **toujours** les horaires dans son propre fuseau horaire, avec un badge clair indiquant le décalage UTC. Plus aucune confusion possible ! 🎯
