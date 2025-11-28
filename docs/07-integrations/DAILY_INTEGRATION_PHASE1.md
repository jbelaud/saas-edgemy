# Daily.co Integration - Phase 1 MVP ✅

## 📋 Vue d'ensemble

Cette Phase 1 implémente l'intégration de base de Daily.co pour les sessions de coaching vidéo sur Edgemy.

### ✨ Fonctionnalités implémentées

- ✅ Création automatique d'une room Daily.co lors de chaque réservation
- ✅ Génération de tokens uniques pour le coach et le joueur
- ✅ Composant React de visioconférence intégré
- ✅ Bouton "Rejoindre la session" dans le dashboard joueur
- ✅ Stockage des URLs et tokens dans la base de données
- ✅ Configuration des rooms (enregistrement cloud nécessite plan Scale - voir [DAILY_RECORDING_INFO.md](DAILY_RECORDING_INFO.md))

---

## 🗂️ Fichiers créés/modifiés

### Backend

#### Nouveau service Daily.co
- **`src/lib/daily.ts`** : Service d'intégration Daily.co
  - `createDailyRoom()` : Créer une room vidéo
  - `generateDailyToken()` : Générer un token d'accès
  - `createCoachingSessionRoom()` : Créer une room complète avec tokens coach/joueur
  - `getDailyRecordings()` : Récupérer les enregistrements (pour Phase 2)

#### Migration Prisma
- **`prisma/schema.prisma`** : Ajout de colonnes au modèle `Reservation`
  ```prisma
  dailyRoomUrl     String?  // URL de la room Daily.co
  dailyRoomName    String?  // Nom unique de la room
  dailyRecordingUrl String? // URL de l'enregistrement (post-session)
  dailyTokenCoach  String?  // Token Daily pour le coach
  dailyTokenPlayer String?  // Token Daily pour le joueur
  ```

#### Routes API modifiées
- **`src/app/api/reservations/route.ts`** :
  - Création automatique de room Daily lors d'une nouvelle réservation
  - Génération des tokens coach/joueur
  - Stockage en DB

- **`src/app/api/player/sessions/route.ts`** :
  - Ajout du champ `dailyRoomUrl` dans la réponse

#### Nouvelle route API
- **`src/app/api/reservations/[id]/daily-token/route.ts`** :
  - GET : Récupère le token Daily pour l'utilisateur connecté
  - Vérifie l'autorisation (coach ou joueur)
  - Retourne le token approprié selon le rôle

### Frontend

#### Composants Daily
- **`src/components/daily/DailyVideoCall.tsx`** :
  - Composant principal de visioconférence
  - Initialisation du SDK Daily.js
  - Gestion des événements (joined, left, error)
  - Interface utilisateur avec bouton "Quitter"

- **`src/components/daily/DailySessionDialog.tsx`** :
  - Dialog modal pour afficher la visioconférence
  - Wrapper autour de `DailyVideoCall`

- **`src/components/sessions/SessionActionsButtons.tsx`** :
  - Composant unifié affichant les boutons Discord + Daily
  - Gestion des alertes si Discord non connecté
  - Ouverture du dialog Daily

#### Pages modifiées
- **`src/app/[locale]/(app)/player/sessions/page.tsx`** :
  - Remplacement de `DiscordSessionButton` par `SessionActionsButtons`
  - Affichage des boutons Discord + "Rejoindre la session"
  - Support du champ `dailyRoomUrl`

---

## 🔧 Configuration

### 1. Variables d'environnement

Ajoutez dans votre `.env` :

```bash
# Daily.co Video Conferencing
DAILY_API_KEY="your-daily-api-key"
```

**Comment obtenir votre API Key :**
1. Créez un compte sur https://dashboard.daily.co
2. Allez dans **Developers** > **API Keys**
3. Copiez votre API key

### 2. Migration de la base de données

```bash
npx prisma db push
```

### 3. Installation des dépendances

```bash
pnpm install
```

(Le package `@daily-co/daily-js` est déjà installé)

---

## 🎯 Flux utilisateur

### Réservation d'une session

1. **Joueur réserve** une session via le calendrier du coach
2. **Backend** :
   - Créer la `Reservation` en DB
   - Appeler Daily.co API pour créer une room unique
   - Générer 2 tokens :
     - Token coach (owner, droits d'enregistrement)
     - Token joueur (participant)
   - Stocker `dailyRoomUrl`, `dailyRoomName`, `dailyTokenCoach`, `dailyTokenPlayer` en DB
   - Créer le salon Discord (si les deux utilisateurs sont liés)
3. **Confirmation** envoyée au joueur et au coach

### Jour de la session

1. **Joueur** se connecte à son dashboard
2. Va dans **"Mes Sessions"**
3. Voit la session à venir avec deux boutons :
   - 🗨️ **Discord** : Ouvre le salon texte privé
   - 🎥 **Rejoindre la session** : Ouvre la visioconférence Daily
4. **Clic sur "Rejoindre la session"** :
   - Appel à `/api/reservations/[id]/daily-token`
   - Récupère le token joueur
   - Ouvre le dialog modal avec `DailyVideoCall`
   - Connexion automatique à la room Daily

### Interface Daily.co

- **Vidéo 1:1** avec le coach
- **Partage d'écran** activé
- **Chat texte** intégré
- **Enregistrement cloud** disponible (le coach décide manuellement de lancer l'enregistrement)
- **Expiration automatique** : Room active pendant la durée de la session + 30min

---

## 📊 Architecture technique

### Sécurité

- **Tokens uniques** par utilisateur et par session
- **Expiration automatique** des tokens (durée session + 30min)
- **Rooms privées** : Accessible uniquement avec un token valide
- **Max 2 participants** : Coach + Joueur

### Configuration des rooms

```typescript
{
  privacy: 'private',
  properties: {
    // enable_recording: 'cloud',   // ⚠️ Nécessite plan Scale (99$/mois)
    enable_screenshare: true,        // Partage d'écran activé ✅
    enable_chat: true,               // Chat texte activé ✅
    enable_prejoin_ui: true,         // Interface de pré-connexion ✅
    max_participants: 2,             // Uniquement coach + joueur ✅
    exp: timestamp + 30min,          // Expiration ✅
    eject_at_room_exp: true,         // Éjecter à l'expiration ✅
  }
}
```

### Tokens

**Coach (owner) :**
- `is_owner: true` ✅
- ~~`enable_recording: true`~~ ⚠️ Nécessite plan Scale

**Joueur (participant) :**
- `is_owner: false` ✅

---

## 🧪 Tests manuels

### Test 1 : Création de réservation

```bash
# 1. Démarrer le serveur
pnpm dev

# 2. Créer une réservation via l'interface ou via l'API
POST /api/reservations
{
  "announcementId": "...",
  "coachId": "...",
  "startDate": "2025-11-20T14:00:00Z",
  "endDate": "2025-11-20T15:00:00Z"
}

# 3. Vérifier dans la console :
# ✅ Room Daily créée: https://yourdomain.daily.co/edgemy-{reservationId}
```

### Test 2 : Rejoindre la session

1. Se connecter en tant que **joueur**
2. Aller sur `/player/sessions`
3. Voir la session avec le bouton **"Rejoindre la session"**
4. Cliquer sur le bouton
5. ✅ Le dialog s'ouvre avec la visioconférence Daily
6. ✅ La vidéo/audio se lance automatiquement

### Test 3 : Vérifier les tokens

```bash
# Appeler l'API en tant que joueur ou coach
GET /api/reservations/{reservationId}/daily-token

# Réponse attendue :
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5...",
  "roomUrl": "https://yourdomain.daily.co/edgemy-xxx",
  "roomName": "edgemy-xxx",
  "userRole": "player" | "coach",
  "startDate": "...",
  "endDate": "..."
}
```

---

## 🚀 Prochaines étapes (Phase 2)

- [ ] **Webhooks Daily.co** pour récupérer automatiquement les enregistrements
- [ ] **Affichage des replays** dans le dashboard joueur (accès post-session)
- [ ] **Emails Brevo** avec lien de session + rappel 15min avant
- [ ] **Gestion des packs** : Créer une room Daily pour chaque session du pack
- [ ] **Page coach** : Afficher les sessions à venir avec bouton "Rejoindre"

---

## 📦 Dépendances ajoutées

```json
{
  "@daily-co/daily-js": "^0.85.0"
}
```

---

## 🐛 Troubleshooting

### Erreur : "DAILY_API_KEY non configurée"

**Solution :** Ajoutez la variable dans `.env` :
```bash
DAILY_API_KEY="your-daily-api-key"
```

### Erreur : "Token Daily non disponible"

**Causes possibles :**
1. La room Daily n'a pas été créée lors de la réservation
2. Vérifier les logs backend : `❌ Erreur création room Daily`
3. Vérifier que l'API Key Daily est valide

**Solution :**
- Relancer la création de réservation
- Vérifier les logs de l'API `/api/reservations`

### Le composant Daily ne se charge pas

**Causes possibles :**
1. Problème réseau (firewall bloquant Daily.co)
2. Token expiré
3. Erreur JavaScript dans la console

**Solution :**
- Ouvrir la console navigateur (F12)
- Vérifier les erreurs
- Tester la connexion à https://daily.co

---

## 💰 Coût estimatif

**Daily.co Pricing (Pay-as-you-go) :**
- **Sessions 1:1 avec enregistrement** : ~1,3€ par session
- **Gratuit jusqu'à 1000 minutes/mois** (environ 16h de coaching)
- **Stockage des enregistrements** : Inclus pendant 7 jours, puis archivage AWS S3/Cloudflare R2

**Calcul pour 100 sessions/mois :**
- 100 sessions × 1h = 100h
- 100h × 60min = 6000 minutes
- (6000 - 1000) × 0.02€/min = 100€/mois

---

## 📝 Notes importantes

1. **Les tokens sont stockés en DB** : Ne pas les exposer publiquement
2. **Les rooms expirent automatiquement** : Pas besoin de cleanup manuel
3. **L'enregistrement est manuel** : Le coach doit cliquer sur "Record" dans l'interface Daily
4. **Les replays ne sont pas encore implémentés** : Phase 2

---

## ✅ Checklist Phase 1

- [x] Service Daily.co créé (`src/lib/daily.ts`)
- [x] Migration Prisma (colonnes Daily ajoutées)
- [x] API création réservation modifiée (création room Daily)
- [x] API récupération token créée (`/api/reservations/[id]/daily-token`)
- [x] Composant `DailyVideoCall` créé
- [x] Composant `DailySessionDialog` créé
- [x] Composant `SessionActionsButtons` créé
- [x] Page joueur `/player/sessions` mise à jour
- [x] Documentation créée

---

**Phase 1 MVP terminée ! 🎉**

La fonctionnalité de base de visioconférence est maintenant opérationnelle. Les coachs et joueurs peuvent rejoindre leurs sessions vidéo directement depuis le dashboard Edgemy.
