# Règles du Workflow des Packs

## 🎯 Logique Métier Importante

### Achat d'un Pack

1. **Le joueur achète un pack** (ex: Pack 5h, 10h, etc.)
2. **Lors de l'achat, le joueur DOIT réserver sa première session**
   - Sélection d'un créneau disponible du coach
   - Date et heure de la première session
   - Cette session est automatiquement créée dans `PackageSession`
   - Status: `SCHEDULED`

### Planification des Sessions Suivantes

**⚠️ RÈGLE CRITIQUE**: Le coach ne peut planifier les sessions suivantes **UNIQUEMENT SI** la première session a eu lieu.

#### Conditions pour Planifier une Session Suivante:
1. ✅ La première session du pack doit avoir le status `COMPLETED`
2. ✅ Il doit rester des heures dans le pack (`remainingHours > 0`)
3. ✅ Le pack doit être actif (`status = ACTIVE`)

#### Workflow:
```
Achat Pack
    ↓
Réservation 1ère session (obligatoire)
    ↓
Status: SCHEDULED
    ↓
[Attente de la date de la session]
    ↓
1ère session a lieu
    ↓
Status: COMPLETED (manuel ou automatique)
    ↓
🔓 Coach peut maintenant planifier les sessions suivantes
    ↓
Planification manuelle par le coach
    ↓
Notification au joueur (à implémenter)
```

---

## 🔧 Implémentations Nécessaires

### 1. **Lors de l'Achat du Pack** (À IMPLÉMENTER)

**Fichier**: `src/app/api/checkout/create-session/route.ts` ou équivalent

**Logique**:
```typescript
// Après paiement Stripe réussi
const pack = await prisma.coachingPackage.create({
  data: {
    playerId: session.user.id,
    coachId: coachId,
    announcementId: announcementId,
    totalHours: packHours,
    remainingHours: packHours,
    priceCents: amount,
    stripePaymentId: paymentIntent.id,
    status: 'ACTIVE',
  },
});

// ⚠️ IMPORTANT: Créer la première session OBLIGATOIRE
const firstSession = await prisma.packageSession.create({
  data: {
    packageId: pack.id,
    startDate: selectedSlot.start, // Créneau sélectionné par le joueur
    endDate: selectedSlot.end,
    durationMinutes: calculateDuration(selectedSlot),
    status: 'SCHEDULED',
  },
});

// Décrémenter les heures restantes
await prisma.coachingPackage.update({
  where: { id: pack.id },
  data: {
    remainingHours: {
      decrement: firstSession.durationMinutes / 60,
    },
  },
});
```

---

### 2. **Validation Avant Planification** (À AJOUTER)

**Fichier**: `src/app/api/coach/schedule-pack-session/route.ts`

**Ajouter cette validation** (ligne ~70, après vérification du pack):

```typescript
// Vérifier que la première session a eu lieu
const firstSession = await prisma.packageSession.findFirst({
  where: {
    packageId: packageId,
  },
  orderBy: {
    createdAt: 'asc',
  },
});

if (!firstSession) {
  return NextResponse.json(
    { error: 'Aucune session trouvée pour ce pack' },
    { status: 400 }
  );
}

if (firstSession.status !== 'COMPLETED') {
  return NextResponse.json(
    { 
      error: 'La première session doit avoir eu lieu avant de planifier les suivantes',
      firstSessionDate: firstSession.startDate,
      firstSessionStatus: firstSession.status,
    },
    { status: 400 }
  );
}
```

---

### 3. **Marquer une Session comme Complétée**

#### Option A: Automatique (Cron Job)
**Fichier**: `src/app/api/cron/complete-past-sessions/route.ts` (À CRÉER)

```typescript
// Exécuté quotidiennement
// Marque automatiquement les sessions passées comme COMPLETED
export async function GET() {
  const now = new Date();
  
  const completedSessions = await prisma.packageSession.updateMany({
    where: {
      status: 'SCHEDULED',
      endDate: {
        lt: now, // Sessions dont la date de fin est passée
      },
    },
    data: {
      status: 'COMPLETED',
    },
  });

  return NextResponse.json({
    message: `${completedSessions.count} sessions marquées comme complétées`,
  });
}
```

#### Option B: Manuel (Coach)
**Fichier**: `src/app/api/coach/sessions/[sessionId]/complete/route.ts` (À CRÉER)

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  // Vérifier que le coach est autorisé
  // Marquer la session comme COMPLETED
  
  await prisma.packageSession.update({
    where: { id: sessionId },
    data: { status: 'COMPLETED' },
  });

  // TODO: Envoyer notification au joueur
  // TODO: Si c'était la première session, notifier le coach qu'il peut planifier les suivantes
  
  return NextResponse.json({ message: 'Session marquée comme complétée' });
}
```

---

### 4. **UI: Bloquer la Planification si Première Session Non Complétée**

**Fichier**: `src/components/calendar/SchedulePackSessionModal.tsx`

**Ajouter cette vérification** (ligne ~50, après récupération des packs):

```typescript
const fetchPlayersWithPacks = async () => {
  try {
    setLoading(true);
    const res = await fetch('/api/coach/players-with-packs');
    if (res.ok) {
      const data = await res.json();
      
      // Filtrer les packs dont la première session est complétée
      const validPlayers = data.map((playerData: any) => ({
        ...playerData,
        packages: playerData.packages.filter((pkg: any) => {
          // Vérifier si la première session est complétée
          return pkg.firstSessionCompleted === true;
        }),
      })).filter((p: any) => p.packages.length > 0);
      
      setPlayers(validPlayers);
    }
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    setLoading(false);
  }
};
```

**Modifier l'API** `GET /api/coach/players-with-packs` pour inclure cette info:

```typescript
// Dans la réponse, ajouter:
packages: pkg.packages.map(p => ({
  id: p.id,
  totalHours: p.totalHours,
  remainingHours: p.remainingHours,
  // Vérifier si la première session est complétée
  firstSessionCompleted: p.sessions.length > 0 && 
                         p.sessions[0].status === 'COMPLETED',
  firstSessionDate: p.sessions[0]?.startDate,
}))
```

---

## 📧 Notifications à Implémenter (Plus Tard)

### Notification 1: Première Session Complétée
**Destinataire**: Coach

**Contenu**:
- "La première session avec [Joueur] est terminée"
- "Vous pouvez maintenant planifier les sessions suivantes"
- Bouton "Planifier une session"

### Notification 2: Session Planifiée par le Coach
**Destinataire**: Joueur

**Contenu**:
- "Votre coach a planifié une nouvelle session"
- Date et heure
- Heures restantes dans le pack
- Bouton "Voir mes sessions"

---

## 🎨 UI/UX Améliorations

### Dans le Modal de Planification:
- Afficher un badge "1ère session non effectuée" sur les packs bloqués
- Message explicatif: "La première session doit avoir lieu avant de planifier les suivantes"
- Afficher la date de la première session prévue

### Dans le Dashboard Coach:
- Section "Premières sessions à venir"
- Après la session, notification pour planifier les suivantes

---

## ✅ Checklist d'Implémentation

### Phase 1: Achat et Première Session (PRIORITAIRE)
- [ ] Modifier le flow d'achat pour inclure la sélection de la première session
- [ ] Créer automatiquement la première `PackageSession` lors de l'achat
- [ ] Décrémenter les heures restantes

### Phase 2: Validation Planification
- [ ] Ajouter validation dans `POST /api/coach/schedule-pack-session`
- [ ] Modifier `GET /api/coach/players-with-packs` pour inclure `firstSessionCompleted`
- [ ] Bloquer l'UI si première session non complétée

### Phase 3: Complétion des Sessions
- [ ] Créer cron job pour marquer automatiquement les sessions passées
- [ ] OU créer endpoint manuel pour le coach
- [ ] Décider de la méthode (auto vs manuel)

### Phase 4: Notifications
- [ ] Email au coach après première session complétée
- [ ] Email au joueur quand coach planifie une session
- [ ] Notification in-app (optionnel)

---

## 🚨 Points d'Attention

1. **Race Condition**: S'assurer que deux sessions ne peuvent pas être planifiées en même temps
2. **Timezone**: Toujours vérifier les dates en UTC
3. **Validation**: Ne jamais faire confiance au frontend, toujours valider côté serveur
4. **UX**: Expliquer clairement pourquoi un pack est bloqué
5. **Rollback**: Si la première session est annulée, que faire du pack?

---

**Date de création**: 27 janvier 2025  
**Dernière mise à jour**: 27 janvier 2025  
**Priorité**: HAUTE - À implémenter avant production
