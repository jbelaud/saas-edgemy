# 🌍 Gestion des Fuseaux Horaires - Edgemy MVP

## 📋 Vue d'ensemble

Ce document détaille l'implémentation complète de la gestion des fuseaux horaires pour la plateforme Edgemy. Le système garantit que les disponibilités des coachs sont affichées correctement, quel que soit le fuseau horaire du coach et du joueur.

## 🎯 Principes fondamentaux

### Source de vérité : UTC
- **Toutes les dates sont stockées en UTC** dans la base de données PostgreSQL
- Aucune heure locale n'est jamais stockée en base
- UTC est le format universel qui évite toute ambiguïté

### Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                    COACH (Jakarta, UTC+7)                    │
├─────────────────────────────────────────────────────────────┤
│  1. Ajoute disponibilité : 18:00-22:00 (heure locale)       │
│  2. Frontend envoie au backend avec timezone: Asia/Jakarta   │
│  3. Backend convertit 18:00 Jakarta → 11:00 UTC             │
│  4. Stockage en DB : start: 2025-01-20T11:00:00.000Z        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  BASE DE DONNÉES (UTC)                       │
├─────────────────────────────────────────────────────────────┤
│  Availability {                                              │
│    start: 2025-01-20T11:00:00.000Z                          │
│    end:   2025-01-20T15:00:00.000Z                          │
│  }                                                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   PLAYER (Paris, UTC+1)                      │
├─────────────────────────────────────────────────────────────┤
│  1. Frontend récupère : 2025-01-20T11:00:00.000Z            │
│  2. Détecte timezone navigateur : Europe/Paris               │
│  3. Convertit 11:00 UTC → 12:00 Paris                       │
│  4. Affiche : "Disponible le 20/01 de 12:00 à 16:00"       │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Architecture de l'implémentation

### 1. Base de données

**Schéma Prisma** ([prisma/schema.prisma](prisma/schema.prisma:94))

```prisma
model coach {
  // ...
  timezone String? // Fuseau horaire IANA (ex: "Asia/Jakarta", "Europe/Paris")
  // ...
}

model player {
  // ...
  timezone String? // Fuseau horaire IANA (détecté auto ou configuré manuellement)
  // ...
}

model Availability {
  start DateTime // Stocké en UTC
  end   DateTime // Stocké en UTC
  // ...
}
```

**Migration nécessaire** : Les champs `timezone` existent déjà dans le schéma, aucune migration requise.

### 2. Bibliothèques utilisées

- **`date-fns`** : Manipulation de dates (déjà installée)
- **`date-fns-tz`** : Gestion des fuseaux horaires (déjà installée)

```json
{
  "dependencies": {
    "date-fns": "^4.1.0",
    "date-fns-tz": "^3.2.0"
  }
}
```

### 3. Utilitaires de conversion

**Fichier** : [src/lib/timezone.ts](src/lib/timezone.ts)

#### Fonctions principales

```typescript
// 🔍 Détection automatique
detectBrowserTimezone(): string
// Retourne: "Europe/Paris", "Asia/Jakarta", etc.

// 🔄 Conversions
convertLocalToUTC(localDate: Date, timezone: string): Date
// Coach à Jakarta : 18:00 local → 11:00 UTC

convertUTCToLocal(utcDate: Date | string, timezone: string): Date
// Joueur à Paris : 11:00 UTC → 12:00 local

// 📅 Formatage
formatInTimezone(utcDate: Date | string, timezone: string, format: string): string
// Formate une date UTC dans un fuseau horaire spécifique

// 📊 Informations
getTimezoneOffset(timezone: string, date?: Date): number
// Retourne le décalage en heures (ex: +7 pour Jakarta)

formatTimezoneDisplay(timezone: string): string
// Retourne: "UTC+7", "UTC-5", etc.
```

#### Fuseaux horaires supportés

```typescript
export const COMMON_TIMEZONES = [
  { value: 'Europe/Paris', label: 'Paris (Europe/Paris)', offset: 'UTC+1/+2' },
  { value: 'America/New_York', label: 'New York', offset: 'UTC-5/-4' },
  { value: 'Asia/Jakarta', label: 'Jakarta', offset: 'UTC+7' },
  { value: 'Asia/Tokyo', label: 'Tokyo', offset: 'UTC+9' },
  // ... 18 fuseaux horaires au total
];
```

### 4. Hook React

**Fichier** : [src/hooks/useTimezone.ts](src/hooks/useTimezone.ts)

```typescript
// Pour les joueurs (détection automatique)
const { timezone, toLocalTime, formatLocal } = useTimezone(userTimezone);

// Pour les coachs
const coachTimezone = useCoachTimezone(coach.timezone);
```

**Exemple d'utilisation** :

```typescript
function PlayerCalendar() {
  const { timezone, toLocalTime, formatLocal } = useTimezone();

  // Convertir une disponibilité UTC
  const localStart = toLocalTime(availability.start);

  // Ou formater directement
  const timeString = formatLocal(availability.start, 'HH:mm');

  return (
    <div>
      Disponible à {timeString} (votre fuseau : {timezone})
    </div>
  );
}
```

## 💻 Implémentation Backend

### API : Création de disponibilité

**Fichier** : [src/app/api/coach/availability/route.ts](src/app/api/coach/availability/route.ts:69)

```typescript
import { convertLocalToUTC } from '@/lib/timezone';

export async function POST(request: NextRequest) {
  const { start, end, timezone } = await request.json();
  const coach = await getCoach();

  // Utiliser le fuseau du coach (profil ou envoyé par le client)
  const coachTimezone = timezone || coach.timezone || 'UTC';

  // Convertir les dates locales du coach en UTC
  const startLocal = new Date(start);
  const endLocal = new Date(end);
  const startDate = convertLocalToUTC(startLocal, coachTimezone);
  const endDate = convertLocalToUTC(endLocal, coachTimezone);

  // Stocker en UTC
  await prisma.availability.create({
    data: {
      coachId: coach.id,
      start: startDate, // UTC
      end: endDate,     // UTC
    },
  });
}
```

### Exemple de requête

```javascript
// Coach à Jakarta (UTC+7) ajoute une dispo de 18:00 à 22:00
fetch('/api/coach/availability', {
  method: 'POST',
  body: JSON.stringify({
    start: '2025-01-20T18:00:00', // Heure locale Jakarta
    end: '2025-01-20T22:00:00',
    timezone: 'Asia/Jakarta',
  }),
});

// Stocké en DB :
// start: 2025-01-20T11:00:00.000Z (18:00 - 7h = 11:00 UTC)
// end:   2025-01-20T15:00:00.000Z (22:00 - 7h = 15:00 UTC)
```

## 🎨 Implémentation Frontend

### Composant : Calendrier du joueur

**Fichier** : [src/components/coach/public/CoachCalendar.tsx](src/components/coach/public/CoachCalendar.tsx:26)

```typescript
import { useTimezone } from '@/hooks/useTimezone';
import { formatTimezoneDisplay } from '@/lib/timezone';

export function CoachCalendar({ coachId }: Props) {
  // Détection automatique du fuseau horaire du joueur
  const { timezone, toLocalTime, formatLocal, timezoneLoaded } = useTimezone();

  const [availabilities, setAvailabilities] = useState([]);

  // Filtrer les disponibilités (en convertissant UTC → local)
  const selectedDayAvailabilities = availabilities.filter((avail) => {
    const localDate = toLocalTime(avail.start); // UTC → Paris
    return isSameDay(localDate, selectedDate);
  });

  return (
    <div>
      {/* Indicateur de fuseau horaire */}
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        <span>{formatTimezoneDisplay(timezone)}</span>
      </div>

      {/* Affichage des créneaux */}
      {selectedDayAvailabilities.map((avail) => (
        <div key={avail.id}>
          {/* Formater en heure locale du joueur */}
          {formatLocal(avail.start, 'HH:mm')} - {formatLocal(avail.end, 'HH:mm')}
        </div>
      ))}
    </div>
  );
}
```

### Composant : Sélecteur de fuseau horaire

**Fichier** : [src/components/settings/TimezoneSelector.tsx](src/components/settings/TimezoneSelector.tsx)

```typescript
import { TimezoneSelector } from '@/components/settings/TimezoneSelector';

// Dans les paramètres du coach
<TimezoneSelector
  value={coach.timezone}
  onChange={(tz) => updateCoachTimezone(tz)}
  showAutoDetect
/>
```

**Caractéristiques** :
- ✅ Détection automatique du fuseau horaire du navigateur
- ✅ Liste de 18 fuseaux horaires courants
- ✅ Affichage du décalage UTC (ex: UTC+7)
- ✅ Bouton "Détecter automatiquement"

## 📊 Scénarios d'utilisation

### Scénario 1 : Coach ajoute une disponibilité

```
Coach: Ahmed (Jakarta, UTC+7)
Action: Ajoute dispo 18:00-22:00 le 20/01/2025

┌────────────────────────────────────────────┐
│ Frontend (Dashboard Coach)                 │
├────────────────────────────────────────────┤
│ 1. Sélection : 18:00-22:00 (heure locale) │
│ 2. Envoie timezone: "Asia/Jakarta"         │
└────────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────┐
│ Backend API                                 │
├────────────────────────────────────────────┤
│ 1. Reçoit : start="2025-01-20T18:00"       │
│ 2. Convertit : 18:00 Jakarta → 11:00 UTC  │
│ 3. Stocke : 2025-01-20T11:00:00.000Z      │
└────────────────────────────────────────────┘
                   ↓
┌────────────────────────────────────────────┐
│ Base de données PostgreSQL                 │
├────────────────────────────────────────────┤
│ start: 2025-01-20T11:00:00.000Z           │
│ end:   2025-01-20T15:00:00.000Z           │
└────────────────────────────────────────────┘
```

### Scénario 2 : Joueur voit la disponibilité

```
Player: Marie (Paris, UTC+1)
Action: Consulte le profil du coach Ahmed

┌────────────────────────────────────────────┐
│ Frontend (Page Coach Publique)             │
├────────────────────────────────────────────┤
│ 1. Détecte timezone: "Europe/Paris"        │
│ 2. Récupère : 2025-01-20T11:00:00.000Z    │
│ 3. Convertit : 11:00 UTC → 12:00 Paris    │
│ 4. Affiche : "12:00 - 16:00"              │
└────────────────────────────────────────────┘

Résultat affiché :
"Disponible le 20 janvier de 12:00 à 16:00 (UTC+1)"
```

### Scénario 3 : Différents joueurs, différents fuseaux

```
Coach Ahmed (Jakarta, UTC+7) : Dispo 18:00-22:00 local
Stocké en UTC : 11:00-15:00

Joueur 1 (Paris, UTC+1)        → Voit : 12:00-16:00
Joueur 2 (New York, UTC-5)     → Voit : 06:00-10:00
Joueur 3 (Tokyo, UTC+9)        → Voit : 20:00-00:00
Joueur 4 (Los Angeles, UTC-8)  → Voit : 03:00-07:00
```

## 🔧 Configuration requise

### 1. Configurer le fuseau horaire du coach

**Option A : Via le dashboard** (à implémenter)
```typescript
// Dans les paramètres du coach
<TimezoneSelector
  value={coach.timezone}
  onChange={async (tz) => {
    await fetch('/api/coach/profile', {
      method: 'PATCH',
      body: JSON.stringify({ timezone: tz }),
    });
  }}
/>
```

**Option B : Via Prisma Studio** (temporaire)
```sql
UPDATE coach SET timezone = 'Asia/Jakarta' WHERE id = 'coach_id';
```

### 2. Fuseau horaire du joueur

Le fuseau horaire du joueur est **détecté automatiquement** via :
```javascript
Intl.DateTimeFormat().resolvedOptions().timeZone
// Retourne: "Europe/Paris", "America/New_York", etc.
```

**Option de surcharge manuelle** :
```typescript
// Dans le profil joueur (optionnel)
const { timezone } = useTimezone(player.timezone);
```

## ⚠️ Gestion des cas limites

### 1. Changement d'heure (DST - Daylight Saving Time)

**Problème** : Le coach est en Europe, l'heure change le 30/03/2025

**Solution** : `date-fns-tz` gère automatiquement le DST

```typescript
// Le 29/03 : UTC+1
convertLocalToUTC(new Date('2025-03-29T18:00'), 'Europe/Paris')
// → 2025-03-29T17:00:00.000Z

// Le 30/03 : UTC+2 (DST activé)
convertLocalToUTC(new Date('2025-03-30T18:00'), 'Europe/Paris')
// → 2025-03-30T16:00:00.000Z (une heure de différence)
```

### 2. Fuseau horaire non configuré

**Problème** : Le coach n'a pas configuré son fuseau horaire

**Solution** : Utiliser UTC par défaut ou détecter automatiquement

```typescript
const coachTimezone = coach.timezone || detectBrowserTimezone() || 'UTC';
```

### 3. Chevauchement de disponibilités

**Problème** : Vérifier les chevauchements en tenant compte des fuseaux horaires

**Solution** : Toutes les comparaisons se font en UTC (dans la DB)

```typescript
// Backend - vérification de chevauchement
const overlapping = await prisma.availability.findFirst({
  where: {
    coachId: coach.id,
    OR: [
      { start: { lte: startDate }, end: { gt: startDate } },
      { start: { lt: endDate }, end: { gte: endDate } },
      { start: { gte: startDate }, end: { lte: endDate } },
    ],
  },
});
```

## 🧪 Tests et validation

### Test 1 : Conversion Local → UTC → Local

```typescript
// Coach à Jakarta (UTC+7)
const localStart = new Date('2025-01-20T18:00:00');
const utcStart = convertLocalToUTC(localStart, 'Asia/Jakarta');
// ✅ Attendu : 2025-01-20T11:00:00.000Z

// Joueur à Paris (UTC+1)
const parisStart = convertUTCToLocal(utcStart, 'Europe/Paris');
// ✅ Attendu : 2025-01-20T12:00:00 (représente 12:00 à Paris)
```

### Test 2 : Affichage des heures

```typescript
const utcDate = new Date('2025-01-20T11:00:00.000Z');

formatInTimezone(utcDate, 'Asia/Jakarta', 'HH:mm');
// ✅ Attendu : "18:00"

formatInTimezone(utcDate, 'Europe/Paris', 'HH:mm');
// ✅ Attendu : "12:00"

formatInTimezone(utcDate, 'America/New_York', 'HH:mm');
// ✅ Attendu : "06:00"
```

### Test 3 : DST

```typescript
// Avant DST (UTC+1)
const winter = new Date('2025-01-20T11:00:00.000Z');
formatInTimezone(winter, 'Europe/Paris', 'HH:mm');
// ✅ Attendu : "12:00" (11:00 + 1h)

// Après DST (UTC+2)
const summer = new Date('2025-07-20T11:00:00.000Z');
formatInTimezone(summer, 'Europe/Paris', 'HH:mm');
// ✅ Attendu : "13:00" (11:00 + 2h)
```

## 📈 Points d'amélioration futurs

### Phase 2 (Post-MVP)

1. **Interface de configuration du fuseau horaire du coach**
   - Ajouter dans les paramètres du dashboard coach
   - Afficher un avertissement si non configuré

2. **Fuseau horaire du joueur configurable**
   - Permettre au joueur de choisir manuellement son fuseau horaire
   - Utile si le joueur voyage ou utilise un VPN

3. **Notifications par email avec horaires locaux**
   - Les emails de confirmation de session affichent l'heure locale du destinataire

4. **Calendrier multi-fuseaux**
   - Afficher côte à côte l'heure du coach et l'heure du joueur

5. **Export iCal/Google Calendar**
   - Exporter les disponibilités avec le fuseau horaire correct

## 🎓 Ressources et références

### Documentation officielle

- **date-fns** : https://date-fns.org/
- **date-fns-tz** : https://github.com/marnusw/date-fns-tz
- **IANA Time Zone Database** : https://www.iana.org/time-zones
- **MDN Intl.DateTimeFormat** : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat

### Fuseaux horaires IANA

Format : `Continent/Ville` (ex: `Europe/Paris`, `Asia/Jakarta`)

**Pourquoi pas GMT+7 ?**
- ❌ GMT+7 ne gère pas le DST (changement d'heure)
- ✅ `Asia/Jakarta` gère automatiquement toutes les règles locales

## ✅ Checklist de déploiement

Avant de déployer en production :

- [x] Bibliothèques installées : `date-fns`, `date-fns-tz`
- [x] Utilitaires créés : [src/lib/timezone.ts](src/lib/timezone.ts)
- [x] Hook React créé : [src/hooks/useTimezone.ts](src/hooks/useTimezone.ts)
- [x] Backend mis à jour : [src/app/api/coach/availability/route.ts](src/app/api/coach/availability/route.ts)
- [x] Frontend mis à jour : [src/components/coach/public/CoachCalendar.tsx](src/components/coach/public/CoachCalendar.tsx)
- [x] Composant de sélection créé : [src/components/settings/TimezoneSelector.tsx](src/components/settings/TimezoneSelector.tsx)
- [ ] Tests unitaires ajoutés
- [ ] Tests d'intégration ajoutés
- [ ] Documentation utilisateur créée
- [ ] Fuseau horaire par défaut configuré pour tous les coachs existants

## 🆘 Support

Pour toute question sur l'implémentation des fuseaux horaires :

- **Code source** : Voir les fichiers mentionnés ci-dessus
- **Tests** : Créer des tests dans `tests/unit/timezone.test.ts`
- **Issues** : Ouvrir une issue sur le dépôt GitHub

---

**Généré par Claude Code** 🤖
_Version 1.0 - Implémentation MVP Timezone_
