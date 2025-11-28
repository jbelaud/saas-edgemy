# 📚 Exemples Pratiques - Gestion des Fuseaux Horaires

Ce document fournit des exemples concrets d'utilisation du système de fuseaux horaires pour le MVP Edgemy.

## 🎯 Table des matières

1. [Exemples Backend (API)](#exemples-backend-api)
2. [Exemples Frontend (React)](#exemples-frontend-react)
3. [Exemples de Tests](#exemples-de-tests)
4. [Cas d'usage réels](#cas-dusage-réels)

---

## Exemples Backend (API)

### 1. Créer une disponibilité (Coach Dashboard)

**Endpoint** : `POST /api/coach/availability`

```typescript
// src/app/api/coach/availability/route.ts

import { convertLocalToUTC } from '@/lib/timezone';

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  const coach = await prisma.coach.findUnique({
    where: { userId: session.user.id },
  });

  const body = await request.json();
  const { start, end, timezone } = body;

  // Utiliser le fuseau horaire du coach
  const coachTimezone = timezone || coach.timezone || 'UTC';

  // Convertir les dates locales en UTC
  const startLocal = new Date(start);
  const endLocal = new Date(end);
  const startUTC = convertLocalToUTC(startLocal, coachTimezone);
  const endUTC = convertLocalToUTC(endLocal, coachTimezone);

  // Stocker en UTC
  const availability = await prisma.availability.create({
    data: {
      coachId: coach.id,
      start: startUTC,
      end: endUTC,
    },
  });

  return NextResponse.json(availability, { status: 201 });
}
```

**Exemple de requête** :

```javascript
// Coach à Jakarta (UTC+7) crée une dispo de 18:00 à 22:00
const response = await fetch('/api/coach/availability', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    start: '2025-01-25T18:00:00', // Heure locale Jakarta
    end: '2025-01-25T22:00:00',
    timezone: 'Asia/Jakarta',
  }),
});

// Résultat en DB :
// {
//   start: '2025-01-25T11:00:00.000Z', // 18:00 - 7h = 11:00 UTC
//   end: '2025-01-25T15:00:00.000Z'    // 22:00 - 7h = 15:00 UTC
// }
```

### 2. Récupérer les disponibilités (Player View)

**Endpoint** : `GET /api/coach/[coachId]/availability`

```typescript
// src/app/api/coach/[coachId]/availability/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { coachId: string } }
) {
  const availabilities = await prisma.availability.findMany({
    where: {
      coachId: params.coachId,
      start: { gte: new Date() }, // Futurs créneaux
    },
    orderBy: { start: 'asc' },
  });

  // Retourner en UTC (la conversion se fait côté frontend)
  return NextResponse.json(availabilities);
}
```

**Réponse** :

```json
[
  {
    "id": "avail_123",
    "start": "2025-01-25T11:00:00.000Z",
    "end": "2025-01-25T15:00:00.000Z"
  }
]
```

### 3. Créer une réservation avec fuseau horaire

```typescript
// src/app/api/reservations/route.ts

import { convertLocalToUTC, convertUTCToLocal } from '@/lib/timezone';

export async function POST(request: NextRequest) {
  const { availabilityId, playerTimezone } = await request.json();

  const availability = await prisma.availability.findUnique({
    where: { id: availabilityId },
    include: { coach: true },
  });

  // Créer la réservation (dates déjà en UTC)
  const reservation = await prisma.reservation.create({
    data: {
      startDate: availability.start, // UTC
      endDate: availability.end,     // UTC
      // ... autres champs
    },
  });

  // Envoyer un email de confirmation avec les heures locales
  await sendConfirmationEmail({
    to: player.email,
    startLocal: convertUTCToLocal(availability.start, playerTimezone),
    endLocal: convertUTCToLocal(availability.end, playerTimezone),
    timezone: playerTimezone,
  });

  return NextResponse.json(reservation);
}
```

---

## Exemples Frontend (React)

### 1. Calendrier du joueur (détection automatique du fuseau)

```typescript
// src/components/coach/public/CoachCalendar.tsx

import { useTimezone } from '@/hooks/useTimezone';
import { formatTimezoneDisplay } from '@/lib/timezone';

export function CoachCalendar({ coachId }: Props) {
  const [availabilities, setAvailabilities] = useState([]);

  // Détecter automatiquement le fuseau horaire du joueur
  const { timezone, toLocalTime, formatLocal, isLoaded } = useTimezone();

  useEffect(() => {
    async function fetchAvailabilities() {
      const res = await fetch(`/api/coach/${coachId}/availability`);
      const data = await res.json();
      setAvailabilities(data); // Données en UTC
    }
    fetchAvailabilities();
  }, [coachId]);

  return (
    <div>
      {/* Afficher le fuseau horaire détecté */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Globe className="w-4 h-4" />
        <span>Horaires affichés : {formatTimezoneDisplay(timezone)}</span>
      </div>

      {/* Afficher les créneaux convertis */}
      {availabilities.map((avail) => {
        // Convertir UTC → fuseau du joueur
        const localStart = toLocalTime(avail.start);
        const localEnd = toLocalTime(avail.end);

        return (
          <div key={avail.id}>
            <p>{format(localStart, 'EEEE d MMMM', { locale: fr })}</p>
            <p>
              {formatLocal(avail.start, 'HH:mm')} - {formatLocal(avail.end, 'HH:mm')}
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

### 2. Dashboard Coach - Ajouter une disponibilité

```typescript
// src/components/calendar/CoachCalendar.tsx

import { useCoachTimezone } from '@/hooks/useTimezone';

export function CoachCalendar({ coachId }: Props) {
  const [coach, setCoach] = useState(null);

  // Utiliser le fuseau horaire configuré du coach
  const coachTimezone = useCoachTimezone(coach?.timezone);

  const handleSelectSlot = async ({ start, end }: SlotInfo) => {
    // start et end sont déjà en heure locale (du calendrier)
    // On les envoie avec le fuseau horaire du coach

    const response = await fetch(`/api/coach/${coachId}/availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: start.toISOString(),
        end: end.toISOString(),
        timezone: coachTimezone, // Important !
      }),
    });

    if (response.ok) {
      // Rafraîchir les disponibilités
      await fetchAvailabilities();
    }
  };

  return (
    <Calendar
      localizer={localizer}
      selectable
      onSelectSlot={handleSelectSlot}
      // ... autres props
    />
  );
}
```

### 3. Composant de sélection de fuseau horaire

```typescript
// src/app/[locale]/(app)/coach/settings/page.tsx

import { TimezoneSelector } from '@/components/settings/TimezoneSelector';

export default function CoachSettingsPage() {
  const [coach, setCoach] = useState(null);

  const updateTimezone = async (timezone: string) => {
    const response = await fetch('/api/coach/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timezone }),
    });

    if (response.ok) {
      const updatedCoach = await response.json();
      setCoach(updatedCoach);
      alert('Fuseau horaire mis à jour avec succès !');
    }
  };

  return (
    <div className="space-y-6">
      <h1>Paramètres du coach</h1>

      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Fuseau horaire</h2>
        <p className="text-sm text-gray-600 mb-4">
          Configurez votre fuseau horaire pour que vos disponibilités
          soient affichées correctement.
        </p>

        <TimezoneSelector
          value={coach?.timezone}
          onChange={updateTimezone}
          showAutoDetect
        />
      </div>
    </div>
  );
}
```

### 4. Afficher une réservation avec les heures locales

```typescript
// src/components/reservations/ReservationCard.tsx

import { useTimezone } from '@/hooks/useTimezone';

interface ReservationCardProps {
  reservation: {
    id: string;
    startDate: string; // UTC
    endDate: string;   // UTC
  };
}

export function ReservationCard({ reservation }: ReservationCardProps) {
  const { formatLocal, timezone } = useTimezone();

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-semibold">Session de coaching</h3>

      <div className="mt-2 text-sm">
        <p className="text-gray-600">Date</p>
        <p className="font-medium">
          {formatLocal(reservation.startDate, 'EEEE d MMMM yyyy')}
        </p>
      </div>

      <div className="mt-2 text-sm">
        <p className="text-gray-600">Horaire (votre fuseau)</p>
        <p className="font-medium">
          {formatLocal(reservation.startDate, 'HH:mm')} -{' '}
          {formatLocal(reservation.endDate, 'HH:mm')}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Fuseau horaire : {timezone}
        </p>
      </div>
    </div>
  );
}
```

---

## Exemples de Tests

### 1. Test unitaire des utilitaires

```typescript
// tests/unit/timezone.test.ts

import { describe, it, expect } from 'vitest';
import {
  convertLocalToUTC,
  convertUTCToLocal,
  formatInTimezone,
  detectBrowserTimezone,
} from '@/lib/timezone';

describe('Timezone Utilities', () => {
  it('convertit correctement Jakarta → UTC', () => {
    const localDate = new Date('2025-01-25T18:00:00');
    const utcDate = convertLocalToUTC(localDate, 'Asia/Jakarta');

    expect(utcDate.toISOString()).toBe('2025-01-25T11:00:00.000Z');
  });

  it('convertit correctement UTC → Paris', () => {
    const utcDate = new Date('2025-01-25T11:00:00.000Z');
    const parisDate = convertUTCToLocal(utcDate, 'Europe/Paris');

    // Paris = UTC+1 en hiver
    expect(parisDate.getHours()).toBe(12);
  });

  it('formate correctement en fuseau horaire spécifique', () => {
    const utcDate = new Date('2025-01-25T11:00:00.000Z');

    expect(formatInTimezone(utcDate, 'Asia/Jakarta', 'HH:mm')).toBe('18:00');
    expect(formatInTimezone(utcDate, 'Europe/Paris', 'HH:mm')).toBe('12:00');
    expect(formatInTimezone(utcDate, 'America/New_York', 'HH:mm')).toBe('06:00');
  });

  it('détecte un fuseau horaire valide', () => {
    const detected = detectBrowserTimezone();
    expect(detected).toBeTruthy();
    expect(typeof detected).toBe('string');
  });
});
```

### 2. Test d'intégration API

```typescript
// tests/integration/api/availability.test.ts

import { describe, it, expect } from 'vitest';

describe('POST /api/coach/availability', () => {
  it('stocke une disponibilité en UTC', async () => {
    const response = await fetch('/api/coach/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        start: '2025-01-25T18:00:00',
        end: '2025-01-25T22:00:00',
        timezone: 'Asia/Jakarta', // UTC+7
      }),
    });

    const availability = await response.json();

    // Vérifier que c'est bien stocké en UTC
    expect(new Date(availability.start).toISOString()).toBe(
      '2025-01-25T11:00:00.000Z'
    );
    expect(new Date(availability.end).toISOString()).toBe(
      '2025-01-25T15:00:00.000Z'
    );
  });
});
```

### 3. Test E2E avec Playwright

```typescript
// tests/e2e/coach-availability.spec.ts

import { test, expect } from '@playwright/test';

test('Coach peut ajouter une disponibilité dans son fuseau horaire', async ({ page }) => {
  await page.goto('/coach/availability');

  // Sélectionner un créneau de 18:00 à 22:00
  await page.click('[data-testid="calendar-slot-18:00"]');
  await page.click('[data-testid="calendar-slot-22:00"]');

  // Vérifier que l'aperçu affiche les bonnes heures
  await expect(page.locator('[data-testid="slot-preview"]')).toContainText(
    '18:00 - 22:00'
  );

  // Sauvegarder
  await page.click('[data-testid="save-availability"]');

  // Vérifier le message de succès
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});

test('Joueur voit les disponibilités dans son fuseau horaire', async ({ page }) => {
  await page.goto('/coach/ahmed-poker');

  // Vérifier que le fuseau horaire est affiché
  await expect(page.locator('[data-testid="timezone-indicator"]')).toBeVisible();

  // Vérifier qu'une disponibilité est affichée (l'heure dépend du fuseau du navigateur de test)
  const slot = page.locator('[data-testid="availability-slot"]').first();
  await expect(slot).toBeVisible();
});
```

---

## Cas d'usage réels

### Cas 1 : Coach nomade

**Situation** : Ahmed est coach, il voyage souvent entre Jakarta et Bangkok.

**Solution** :
```typescript
// Ahmed met à jour son fuseau horaire dans ses paramètres

// À Jakarta (janvier)
await updateCoachTimezone('Asia/Jakarta'); // UTC+7

// À Bangkok (février)
await updateCoachTimezone('Asia/Bangkok'); // UTC+7

// Ses anciennes disponibilités restent correctes car stockées en UTC
```

### Cas 2 : Joueur avec VPN

**Situation** : Marie est à Paris mais utilise un VPN américain.

**Solution** :
```typescript
// Option 1 : Détecter automatiquement (peut être faux avec VPN)
const { timezone } = useTimezone(); // Détecte "America/New_York"

// Option 2 : Permettre à Marie de configurer manuellement
const { timezone } = useTimezone('Europe/Paris'); // Forcé par l'utilisateur

// Dans le profil joueur
<TimezoneSelector
  value={player.timezone}
  onChange={(tz) => updatePlayerTimezone(tz)}
/>
```

### Cas 3 : Session internationale

**Situation** : Coach à Tokyo, joueur à Los Angeles.

**Flux complet** :

```typescript
// 1. Coach (Tokyo, UTC+9) crée une dispo pour 20:00-22:00
POST /api/coach/availability
{
  start: '2025-01-25T20:00:00',
  end: '2025-01-25T22:00:00',
  timezone: 'Asia/Tokyo'
}

// Stocké en UTC : 11:00-13:00 UTC

// 2. Joueur (Los Angeles, UTC-8) voit le profil du coach
GET /api/coach/tokyo-sensei/availability
// Retourne : start: '2025-01-25T11:00:00.000Z'

// 3. Frontend convertit pour le joueur
const { formatLocal } = useTimezone(); // Détecte America/Los_Angeles
formatLocal('2025-01-25T11:00:00.000Z', 'HH:mm')
// Affiche : "03:00" (11:00 UTC - 8h = 03:00 LA)

// 4. Le joueur voit : "Disponible le 25 janvier de 03:00 à 05:00 (UTC-8)"
```

### Cas 4 : Changement d'heure (DST)

**Situation** : Coach en Europe, le DST change le 30 mars 2025.

```typescript
// Avant DST (29 mars, UTC+1)
const winter = convertLocalToUTC(
  new Date('2025-03-29T18:00:00'),
  'Europe/Paris'
);
// → 2025-03-29T17:00:00.000Z (18:00 - 1h = 17:00 UTC)

// Après DST (30 mars, UTC+2)
const summer = convertLocalToUTC(
  new Date('2025-03-30T18:00:00'),
  'Europe/Paris'
);
// → 2025-03-30T16:00:00.000Z (18:00 - 2h = 16:00 UTC)

// ✅ date-fns-tz gère automatiquement le changement d'heure
```

### Cas 5 : Email de confirmation avec horaires locaux

```typescript
// src/lib/email/reservation-confirmation.ts

import { convertUTCToLocal, formatInTimezone } from '@/lib/timezone';

export async function sendReservationConfirmation({
  reservation,
  player,
  coach,
}: Params) {
  // Convertir pour le joueur
  const playerStartLocal = convertUTCToLocal(
    reservation.startDate,
    player.timezone || 'UTC'
  );

  // Convertir pour le coach
  const coachStartLocal = convertUTCToLocal(
    reservation.startDate,
    coach.timezone || 'UTC'
  );

  // Email au joueur
  await sendEmail({
    to: player.email,
    subject: 'Confirmation de votre session',
    body: `
      Votre session est confirmée !

      📅 Date : ${formatInTimezone(reservation.startDate, player.timezone || 'UTC', 'EEEE d MMMM yyyy')}
      🕐 Heure : ${formatInTimezone(reservation.startDate, player.timezone || 'UTC', 'HH:mm')} (votre fuseau)

      Fuseau horaire : ${player.timezone || 'UTC'}
    `,
  });

  // Email au coach
  await sendEmail({
    to: coach.email,
    subject: 'Nouvelle réservation',
    body: `
      Nouvelle session réservée !

      📅 Date : ${formatInTimezone(reservation.startDate, coach.timezone || 'UTC', 'EEEE d MMMM yyyy')}
      🕐 Heure : ${formatInTimezone(reservation.startDate, coach.timezone || 'UTC', 'HH:mm')} (votre fuseau)

      Fuseau horaire : ${coach.timezone || 'UTC'}
    `,
  });
}
```

---

## 🎁 Snippets utiles

### Snippet 1 : Composant d'affichage de session

```typescript
// src/components/SessionTime.tsx

import { useTimezone } from '@/hooks/useTimezone';

interface SessionTimeProps {
  startDate: string | Date; // UTC
  endDate: string | Date;   // UTC
  showTimezone?: boolean;
}

export function SessionTime({ startDate, endDate, showTimezone = true }: SessionTimeProps) {
  const { formatLocal, timezone } = useTimezone();

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-4 h-4" />
      <span>
        {formatLocal(startDate, 'HH:mm')} - {formatLocal(endDate, 'HH:mm')}
      </span>
      {showTimezone && (
        <span className="text-xs text-gray-500">({timezone})</span>
      )}
    </div>
  );
}
```

### Snippet 2 : Hook personnalisé pour les disponibilités

```typescript
// src/hooks/useAvailabilities.ts

import { useState, useEffect } from 'react';
import { useTimezone } from './useTimezone';

export function useAvailabilities(coachId: string) {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toLocalTime } = useTimezone();

  useEffect(() => {
    async function fetch() {
      const res = await fetch(`/api/coach/${coachId}/availability`);
      const data = await res.json();

      // Convertir toutes les dates UTC → local
      const converted = data.map((avail) => ({
        ...avail,
        startLocal: toLocalTime(avail.start),
        endLocal: toLocalTime(avail.end),
      }));

      setAvailabilities(converted);
      setLoading(false);
    }

    fetch();
  }, [coachId, toLocalTime]);

  return { availabilities, loading };
}
```

---

**Fin des exemples pratiques** ✅

Pour plus d'informations, consultez [TIMEZONE_IMPLEMENTATION.md](TIMEZONE_IMPLEMENTATION.md)
