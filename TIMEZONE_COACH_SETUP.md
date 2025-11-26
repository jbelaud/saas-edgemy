# ⚙️ Configuration du Fuseau Horaire Coach - Guide Pratique

## ❓ Le coach doit-il configurer son fuseau horaire ?

### ✅ **OUI, c'est OBLIGATOIRE pour le bon fonctionnement**

Sans fuseau horaire configuré, le système utilise UTC par défaut, ce qui causera des **décalages horaires incorrects**.

## 🎯 Pourquoi c'est crucial ?

### Exemple concret : Coach à Jakarta

```
❌ SANS fuseau horaire configuré :
- Coach ajoute une dispo à 18:00 (pense ajouter 18:00 Jakarta)
- Système pense que c'est 18:00 UTC
- Stocke 18:00 UTC en base de données
- Joueur à Paris voit 19:00 (18:00 UTC + 1h)
- ❌ ERREUR : Le coach voulait 18:00 Jakarta = 11:00 UTC = 12:00 Paris

✅ AVEC fuseau horaire configuré (Asia/Jakarta) :
- Coach ajoute une dispo à 18:00 (18:00 Jakarta)
- Système convertit 18:00 Jakarta → 11:00 UTC
- Stocke 11:00 UTC en base de données
- Joueur à Paris voit 12:00 (11:00 UTC + 1h)
- ✅ CORRECT : 18:00 Jakarta = 11:00 UTC = 12:00 Paris
```

### Impact du décalage

| Coach Timezone | Heure voulue | Sans config | Avec config | Différence |
|----------------|--------------|-------------|-------------|------------|
| Jakarta (UTC+7) | 18:00 | 18:00 UTC | 11:00 UTC | **-7h** ❌ |
| New York (UTC-5) | 14:00 | 14:00 UTC | 19:00 UTC | **+5h** ❌ |
| Paris (UTC+1) | 20:00 | 20:00 UTC | 19:00 UTC | **-1h** ❌ |

## 📍 État actuel de l'implémentation

### ✅ Ce qui existe déjà

1. **Page de paramètres** : [/coach/settings](src/app/[locale]/(app)/coach/settings/page.tsx:224)
   - Sélecteur de fuseau horaire fonctionnel
   - Liste de tous les fuseaux horaires disponibles
   - Bouton "Enregistrer les modifications"

2. **Backend API** : [/api/coach/profile](src/app/api/coach/availability/route.ts:80)
   - Support du champ `timezone`
   - Sauvegarde dans la base de données

3. **Schéma Prisma** : [prisma/schema.prisma](prisma/schema.prisma:94)
   - Champ `timezone String?` sur le modèle `coach`

### ⚠️ Ce qu'il faut faire

#### 1. **S'assurer que tous les coachs existants ont un fuseau horaire**

**Option A : Script SQL** (pour les coachs déjà inscrits)

```sql
-- Définir Europe/Paris comme fuseau par défaut
UPDATE coach
SET timezone = 'Europe/Paris'
WHERE timezone IS NULL;
```

**Fichier créé** : [scripts/set-default-timezone.sql](scripts/set-default-timezone.sql)

**Option B : Via Prisma Studio** (manuel)

1. Ouvrir Prisma Studio : `npx prisma studio`
2. Aller dans la table `coach`
3. Modifier le champ `timezone` pour chaque coach sans fuseau

#### 2. **Rendre le fuseau horaire obligatoire lors de l'onboarding**

Actuellement, le processus d'onboarding permet de créer un coach sans fuseau horaire. Il faut :

**Ajouter une étape "Fuseau horaire" dans l'onboarding** :

```typescript
// Dans le processus de création du profil coach
const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris';

const newCoach = await prisma.coach.create({
  data: {
    // ... autres champs
    timezone: defaultTimezone, // ✅ Défini automatiquement
  },
});
```

#### 3. **Ajouter un avertissement si le fuseau n'est pas configuré**

**Ajouter un banner d'avertissement** dans le dashboard coach :

```typescript
// Dans src/app/[locale]/(app)/coach/agenda/page.tsx

{!coachTimezone && (
  <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
    <div className="flex items-center gap-3">
      <AlertTriangle className="w-5 h-5 text-orange-400" />
      <div>
        <p className="text-orange-300 font-semibold">
          ⚠️ Fuseau horaire non configuré
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Configurez votre fuseau horaire dans les{' '}
          <Link href="/coach/settings" className="underline text-orange-400">
            paramètres
          </Link>{' '}
          pour que vos disponibilités s'affichent correctement.
        </p>
      </div>
    </div>
  </div>
)}
```

## 🚀 Comment le coach configure son fuseau horaire

### Étape 1 : Accéder aux paramètres

1. Le coach se connecte à son dashboard
2. Il clique sur **"Paramètres"** dans le menu

### Étape 2 : Sélectionner le fuseau horaire

1. Dans la section **"Informations personnelles"**
2. Trouver le champ **"Fuseau horaire"**
3. Sélectionner son fuseau horaire dans la liste déroulante :
   - `Europe/Paris` pour la France
   - `Asia/Jakarta` pour l'Indonésie
   - `America/New_York` pour New York
   - etc.

### Étape 3 : Enregistrer

1. Cliquer sur **"Enregistrer les modifications"**
2. Le fuseau horaire est sauvegardé en base de données
3. ✅ Toutes les futures disponibilités seront converties correctement

## 🧪 Comment tester

### Test manuel

1. **Configurer le fuseau à Jakarta** :
   ```
   - Aller dans /coach/settings
   - Sélectionner "Asia/Jakarta" (UTC+7)
   - Enregistrer
   ```

2. **Ajouter une disponibilité à 18:00** :
   ```
   - Aller dans /coach/agenda
   - Créer une dispo de 18:00 à 22:00
   - Vérifier en base de données :
     - start doit être : 11:00 UTC (18:00 - 7h)
     - end doit être : 15:00 UTC (22:00 - 7h)
   ```

3. **Vérifier l'affichage joueur** :
   ```
   - Ouvrir le profil public du coach
   - Vérifier que la dispo s'affiche :
     - À Paris (UTC+1) : 12:00-16:00
     - À New York (UTC-5) : 06:00-10:00
     - À Tokyo (UTC+9) : 20:00-00:00
   ```

### Test en base de données

```sql
-- Vérifier le fuseau horaire d'un coach
SELECT id, "firstName", "lastName", timezone
FROM coach
WHERE id = 'coach_id_here';

-- Vérifier les disponibilités stockées en UTC
SELECT
  c."firstName",
  c.timezone as coach_timezone,
  a.start,
  a.end
FROM "Availability" a
JOIN coach c ON c.id = a."coachId"
WHERE c.id = 'coach_id_here'
ORDER BY a.start DESC
LIMIT 5;
```

## 📊 Recommandations par pays

| Pays / Région | Fuseau horaire IANA | Décalage UTC |
|---------------|---------------------|--------------|
| 🇫🇷 France | `Europe/Paris` | UTC+1 (hiver) / UTC+2 (été) |
| 🇺🇸 USA Est | `America/New_York` | UTC-5 (hiver) / UTC-4 (été) |
| 🇺🇸 USA Ouest | `America/Los_Angeles` | UTC-8 (hiver) / UTC-7 (été) |
| 🇧🇷 Brésil | `America/Sao_Paulo` | UTC-3 |
| 🇮🇩 Indonésie (Jakarta) | `Asia/Jakarta` | UTC+7 |
| 🇯🇵 Japon | `Asia/Tokyo` | UTC+9 |
| 🇨🇳 Chine | `Asia/Shanghai` | UTC+8 |
| 🇸🇬 Singapour | `Asia/Singapore` | UTC+8 |
| 🇦🇺 Australie (Sydney) | `Australia/Sydney` | UTC+10 (hiver) / UTC+11 (été) |

## ⚠️ Erreurs courantes à éviter

### ❌ Utiliser GMT+7 au lieu de Asia/Jakarta

**Problème** : GMT+7 ne gère pas le changement d'heure (DST)

```typescript
// ❌ FAUX
coach.timezone = 'GMT+7'

// ✅ CORRECT
coach.timezone = 'Asia/Jakarta'
```

### ❌ Stocker des heures locales en base

**Problème** : Ambiguïté et bugs lors des conversions

```typescript
// ❌ FAUX : Stocker l'heure locale
await prisma.availability.create({
  data: {
    start: new Date('2025-01-25T18:00:00'), // Heure locale ???
  },
});

// ✅ CORRECT : Convertir vers UTC avant de stocker
const startUTC = convertLocalToUTC(
  new Date('2025-01-25T18:00:00'),
  'Asia/Jakarta'
);
await prisma.availability.create({
  data: {
    start: startUTC, // UTC ✅
  },
});
```

### ❌ Oublier de vérifier si le fuseau est configuré

```typescript
// ❌ FAUX : Suppose que le fuseau existe toujours
const coachTimezone = coach.timezone;

// ✅ CORRECT : Fournir un fallback
const coachTimezone = coach.timezone || 'UTC';
```

## 🎯 Checklist finale

Avant de déployer en production :

- [ ] Tous les coachs existants ont un fuseau horaire configuré
- [ ] Le processus d'onboarding demande le fuseau horaire
- [ ] Un avertissement s'affiche si le fuseau n'est pas configuré
- [ ] Le sélecteur de fuseau est accessible dans /coach/settings
- [ ] Les tests manuels ont été effectués avec différents fuseaux

## 🆘 Que faire en cas de problème ?

### Problème 1 : "Les heures ne correspondent pas"

**Solution** :
1. Vérifier que le coach a configuré son fuseau horaire
2. Vérifier en base de données que les heures sont en UTC
3. Tester la conversion avec les utilitaires [src/lib/timezone.ts](src/lib/timezone.ts)

### Problème 2 : "Le fuseau ne se sauvegarde pas"

**Solution** :
1. Vérifier l'API `/api/coach/profile` (PATCH)
2. Vérifier les logs backend
3. Vérifier que le champ `timezone` existe bien dans Prisma

### Problème 3 : "Décalage d'une heure lors du changement d'heure"

**Solution** :
1. ✅ C'est normal ! Le DST est géré automatiquement par `date-fns-tz`
2. Ne jamais utiliser GMT+X, toujours utiliser les fuseaux IANA (Europe/Paris)

---

**Conclusion** : Oui, le coach **DOIT** configurer son fuseau horaire dans les paramètres. C'est déjà possible via `/coach/settings`, il faut juste s'assurer que tous les coachs le font (soit via un script SQL pour les existants, soit en le rendant obligatoire à l'onboarding). 🎯
