# Guide complet des fuseaux horaires - Edgemy

## 📋 Vue d'ensemble

Le système de fuseaux horaires d'Edgemy permet aux coachs et joueurs du monde entier de collaborer sans confusion d'horaires. Chaque utilisateur configure son fuseau horaire une fois, et le système gère automatiquement toutes les conversions.

---

## 🌍 Principe de fonctionnement

### Stockage en base de données
- **Toutes les dates sont stockées en UTC** dans la base de données PostgreSQL
- Cela garantit une référence temporelle universelle et cohérente

### Affichage pour les utilisateurs
- **Coachs** : Voient toujours les horaires dans **leur fuseau horaire configuré**
- **Joueurs** : Voient toujours les horaires dans **leur fuseau horaire configuré**
- **Visiteurs non connectés** : Voient les horaires dans le **fuseau horaire de leur navigateur**

### Détection automatique
- Au premier chargement, le système détecte automatiquement le fuseau horaire du navigateur
- L'utilisateur peut ensuite le modifier dans ses paramètres s'il le souhaite
- Cette configuration est ensuite utilisée pour tous les affichages

---

## 👨‍🏫 Guide pour les Coachs

### Configuration initiale

1. **Accédez à vos paramètres**
   - Dashboard Coach → Paramètres → Section "Fuseau horaire"

2. **Sélectionnez votre fuseau horaire**
   - Exemple : Si vous êtes à Bangkok, sélectionnez `Asia/Bangkok (UTC+7)`
   - Exemple : Si vous êtes à Paris, sélectionnez `Europe/Paris (UTC+1)`
   - Le système détecte automatiquement votre fuseau horaire, mais vérifiez qu'il est correct

3. **Enregistrez vos modifications**

### Ajout de disponibilités

Lorsque vous ajoutez des créneaux de disponibilité :

1. **Les horaires que vous entrez sont TOUJOURS dans votre fuseau horaire**
   - Si vous êtes à Bangkok et ajoutez "09:00 - 12:00"
   - Le système enregistre automatiquement l'équivalent UTC (02:00 - 05:00 UTC)

2. **Visualisation de vos disponibilités**
   - Dans votre dashboard "Mes disponibilités" : vous voyez **09:00 - 12:00** (votre heure locale)
   - Pas de conversion nécessaire, vous voyez exactement ce que vous avez saisi

### Ce que voient les joueurs

Quand un joueur consulte votre profil :

- **Joueur à Paris (UTC+1)** verra : `03:00 - 06:00 UTC+1`
- **Joueur à New York (UTC-5)** verra : `21:00 - 00:00 UTC-5` (la veille)
- **Joueur à Tokyo (UTC+9)** verra : `11:00 - 14:00 UTC+9`

Le système affiche automatiquement un badge indiquant le fuseau horaire du joueur (ex: `UTC+1`).

### Points importants

✅ **À faire :**
- Configurez correctement votre fuseau horaire dans les paramètres
- Entrez vos disponibilités dans votre heure locale habituelle
- Si vous voyagez, mettez à jour votre fuseau horaire dans les paramètres

❌ **À ne pas faire :**
- Ne pas essayer de "convertir" mentalement les horaires
- Ne pas ajouter des disponibilités en pensant au fuseau horaire du joueur
- Ne pas oublier de mettre à jour votre fuseau horaire si vous déménagez

### 🧳 Cas spécial : Coach qui voyage

**Scénario :** Vous résidez à Bangkok (UTC+7) mais vous partez à Las Vegas (UTC-8) pour 2 mois.

#### Option 1 : Changer temporairement votre fuseau horaire (RECOMMANDÉ)

**Avant le départ :**
1. Allez dans Paramètres → Fuseau horaire
2. Changez de `Asia/Bangkok` vers `America/Los_Angeles` (UTC-8)
3. Enregistrez

**Pendant votre séjour à Vegas :**
- Ajoutez vos disponibilités normalement dans votre heure locale Vegas
- Exemple : Vous ajoutez "10:00 - 13:00" → c'est bien 10h du matin à Vegas
- Vos anciens créneaux (créés à Bangkok) s'afficheront automatiquement en heure de Vegas

**Au retour :**
1. Retournez dans Paramètres → Fuseau horaire
2. Remettez `Asia/Bangkok` (UTC+7)
3. Tous les horaires (anciens et nouveaux) s'afficheront en heure de Bangkok

**✅ Avantages :**
- Simple et intuitif
- Vous voyez toujours l'heure locale où vous êtes
- Pas de risque d'erreur de conversion

**❌ Inconvénients :**
- Vos anciens créneaux de Bangkok s'affichent en heure de Vegas pendant votre voyage
- Si vous avez des sessions déjà réservées, vérifiez les horaires après le changement

#### Option 2 : Garder Bangkok et calculer mentalement (NON RECOMMANDÉ)

**Si vous gardez `Asia/Bangkok` configuré :**
- Votre dashboard affichera toujours l'heure de Bangkok
- Pour ajouter des disponibilités à Vegas, vous devez calculer :
  - Vous voulez être disponible à 10h Vegas (UTC-8)
  - Bangkok est UTC+7, donc 15h de décalage
  - Vous devez ajouter "01:00" dans le dashboard (le lendemain)
  - **COMPLEXE ET RISQUÉ !**

**❌ Pourquoi ne pas faire ça :**
- Risque élevé d'erreur de calcul
- Vos sessions s'afficheront avec des horaires confus
- Difficulté pour gérer le calendrier au quotidien

#### Recommandation officielle

**Pour un voyage de plus de 2 semaines :**
→ Changez votre fuseau horaire dans les paramètres

**Pour un voyage court (< 2 semaines) :**
→ Vous pouvez garder votre fuseau horaire habituel et ne pas ajouter de nouvelles disponibilités pendant le voyage

**Pour des voyages fréquents :**
→ Changez votre fuseau horaire à chaque fois. C'est rapide (2 clics) et évite toute confusion.

#### Exemple concret

```
📍 Coach habituel : Bangkok (UTC+7)
✈️  Voyage : Las Vegas (UTC-8) pendant 2 mois

AVANT LE DÉPART (vous êtes encore à Bangkok) :
- Fuseau horaire paramétré : Asia/Bangkok
- Vous ajoutez des disponibilités : 14:00-17:00 Bangkok
- Stockage DB : 07:00-10:00 UTC

CHANGEMENT AVANT LE VOYAGE :
- Vous changez : Asia/Bangkok → America/Los_Angeles
- Vos anciennes disponibilités s'affichent maintenant : 23:00-02:00 Vegas (la veille)
- C'est normal ! C'est bien le même moment

À VEGAS (pendant 2 mois) :
- Fuseau horaire paramétré : America/Los_Angeles
- Vous ajoutez des nouvelles disponibilités : 09:00-12:00 Vegas
- Stockage DB : 17:00-20:00 UTC
- Vous voyez tout en heure locale de Vegas

AU RETOUR À BANGKOK :
- Vous changez : America/Los_Angeles → Asia/Bangkok
- Toutes vos disponibilités (Vegas et Bangkok) s'affichent en heure de Bangkok
- Les créneaux Vegas créés à 09:00-12:00 Vegas s'affichent : 00:00-03:00 Bangkok (le jour suivant)
```

**Important :** Les joueurs verront toujours la bonne heure dans leur fuseau horaire, quelle que soit votre configuration !

---

## 🎮 Guide pour les Joueurs

### Configuration initiale

1. **Accédez à vos paramètres**
   - Menu utilisateur → Paramètres → Section "Fuseau horaire"

2. **Vérifiez votre fuseau horaire**
   - Le système détecte automatiquement votre fuseau horaire
   - Modifiez-le si nécessaire (exemple : si vous utilisez un VPN)

3. **Enregistrez**

### Consultation des disponibilités

Quand vous consultez le profil d'un coach :

1. **Badge de fuseau horaire**
   - En haut à droite des disponibilités, vous voyez votre fuseau horaire actuel
   - Exemple : `UTC+1` si vous êtes à Paris
   - Passez la souris dessus pour voir l'info-bulle explicative

2. **Horaires affichés**
   - Tous les horaires sont automatiquement convertis dans **votre fuseau horaire**
   - Vous n'avez **aucune conversion mentale à faire**

3. **Exemple concret**
   - Coach à Bangkok (UTC+7) propose : 09:00 - 12:00 (son heure locale)
   - Vous à Paris (UTC+1) voyez : 03:00 - 06:00 (votre heure locale)
   - C'est bien le même moment dans le temps !

### Réservation d'une session

1. **Sélectionnez un créneau**
   - Les créneaux affichés sont dans votre fuseau horaire
   - Choisissez l'heure qui vous convient **dans votre heure locale**

2. **Page de paiement**
   - Vérifiez l'heure de la session (toujours dans votre fuseau horaire)
   - Un badge `UTC+X` vous rappelle votre fuseau horaire

3. **Confirmation**
   - L'email de confirmation affichera l'heure dans votre fuseau horaire
   - Le coach recevra l'heure dans son fuseau horaire

### Points importants

✅ **À faire :**
- Vérifiez que votre fuseau horaire est correct dans les paramètres
- Fiez-vous aux horaires affichés, ils sont déjà convertis pour vous
- Si vous voyagez, mettez à jour votre fuseau horaire

❌ **À ne pas faire :**
- Ne pas essayer de convertir les horaires mentalement
- Ne pas vous inquiéter du fuseau horaire du coach
- Ne pas réserver si vous n'êtes pas sûr de votre fuseau horaire

---

## 🔧 Fonctionnement technique

### Architecture du système

```
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DONNÉES                          │
│                   (Stockage UTC)                            │
│                                                             │
│  Exemple: 2025-11-30T02:00:00.000Z → 2025-11-30T05:00:00.000Z │
└─────────────────────────────────────────────────────────────┘
                           ↓
                    Conversion automatique
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    AFFICHAGE UTILISATEUR                    │
├─────────────────────────────────────────────────────────────┤
│  Coach (Bangkok UTC+7):  09:00 - 12:00                     │
│  Joueur (Paris UTC+1):   03:00 - 06:00                     │
│  Joueur (Tokyo UTC+9):   11:00 - 14:00                     │
└─────────────────────────────────────────────────────────────┘
```

### Flux de données

#### 1. Coach ajoute une disponibilité
```
Input: 09:00 - 12:00 (Bangkok, UTC+7)
  ↓
Conversion: fromZonedTime(localDate, 'Asia/Bangkok')
  ↓
Stockage DB: 02:00 - 05:00 UTC
```

#### 2. Joueur consulte les disponibilités
```
Lecture DB: 02:00 - 05:00 UTC
  ↓
Conversion: formatInTimezone(utcDate, 'Europe/Paris', 'HH:mm')
  ↓
Affichage: 03:00 - 06:00 (Paris, UTC+1)
```

### Pages concernées

| Page | Fuseau horaire utilisé | Description |
|------|----------------------|-------------|
| **Dashboard Coach** | Coach configuré | Le coach voit ses disponibilités dans son fuseau horaire |
| **Mes disponibilités** | Coach configuré | Liste des créneaux créés dans le fuseau horaire du coach |
| **Page publique Coach** | Visiteur/Joueur | Les visiteurs voient les horaires dans leur fuseau horaire |
| **Page de réservation** | Joueur connecté | Les horaires de réservation dans le fuseau horaire du joueur |
| **Email de confirmation** | Destinataire | Chaque email affiche l'heure dans le fuseau horaire du destinataire |

---

## 🔍 Détection du fuseau horaire

### Pour les utilisateurs non connectés (visiteurs)
```javascript
// Le navigateur détecte automatiquement via l'API Intl
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
// Exemple: "Europe/Paris", "Asia/Bangkok", "America/New_York"
```

### Pour les utilisateurs connectés
1. **Première connexion** : Le système détecte le fuseau horaire du navigateur
2. **Stockage** : Le fuseau horaire est sauvegardé dans le profil utilisateur
3. **Utilisation** : Ce fuseau horaire configuré est utilisé pour tous les affichages
4. **Modification** : L'utilisateur peut le modifier à tout moment dans ses paramètres

### Priorité de détection
```
1. Fuseau horaire configuré dans le profil (priorité haute)
2. Fuseau horaire détecté par le navigateur (fallback)
3. UTC (fallback ultime en cas d'erreur)
```

---

## 📚 Formats de fuseau horaire (IANA)

Le système utilise les identifiants de fuseau horaire IANA standard :

### Exemples courants

| Région | Fuseau horaire IANA | Offset UTC |
|--------|-------------------|-----------|
| **Europe** |
| Paris, France | `Europe/Paris` | UTC+1 (UTC+2 en été) |
| London, UK | `Europe/London` | UTC+0 (UTC+1 en été) |
| Berlin, Germany | `Europe/Berlin` | UTC+1 (UTC+2 en été) |
| **Asie** |
| Bangkok, Thailand | `Asia/Bangkok` | UTC+7 |
| Tokyo, Japan | `Asia/Tokyo` | UTC+9 |
| Shanghai, China | `Asia/Shanghai` | UTC+8 |
| Dubai, UAE | `Asia/Dubai` | UTC+4 |
| **Amériques** |
| New York, USA | `America/New_York` | UTC-5 (UTC-4 en été) |
| Los Angeles, USA | `America/Los_Angeles` | UTC-8 (UTC-7 en été) |
| Toronto, Canada | `America/Toronto` | UTC-5 (UTC-4 en été) |
| Sao Paulo, Brazil | `America/Sao_Paulo` | UTC-3 |
| **Océanie** |
| Sydney, Australia | `Australia/Sydney` | UTC+10 (UTC+11 en été) |
| Auckland, New Zealand | `Pacific/Auckland` | UTC+12 (UTC+13 en été) |

### Heure d'été (DST - Daylight Saving Time)

Le système gère automatiquement les changements d'heure d'été :
- Les conversions utilisent la bibliothèque `date-fns-tz` qui connaît toutes les règles DST
- Pas d'action manuelle nécessaire de la part des utilisateurs
- Les offsets UTC affichés s'ajustent automatiquement selon la période de l'année

---

## ❓ FAQ

### Pour les Coachs

**Q: Je voyage souvent, dois-je changer mon fuseau horaire ?**
> Oui, mettez à jour votre fuseau horaire dans les paramètres lorsque vous changez de lieu pour plus de 2 semaines. Pour des voyages courts, vous pouvez garder votre fuseau horaire habituel.

**Q: Que se passe-t-il si j'ajoute des disponibilités avec le mauvais fuseau horaire ?**
> Les créneaux seront enregistrés avec un décalage. Corrigez votre fuseau horaire dans les paramètres, puis supprimez et recréez les disponibilités.

**Q: Les joueurs verront-ils la bonne heure même s'ils sont dans un autre pays ?**
> Oui, le système convertit automatiquement les horaires dans le fuseau horaire de chaque joueur.

**Q: Comment savoir si mon fuseau horaire est correct ?**
> Dans votre dashboard, vérifiez que les horaires affichés dans "Mes disponibilités" correspondent à votre heure locale actuelle.

**Q: Je pars en voyage de Bangkok à Las Vegas pour 2 mois, comment gérer mes disponibilités ?**
> **Recommandation :** Changez votre fuseau horaire dans les paramètres avant le voyage (Asia/Bangkok → America/Los_Angeles). Pendant votre séjour, ajoutez vos disponibilités normalement en heure locale de Vegas. À votre retour, remettez Asia/Bangkok. Tous vos créneaux (anciens et nouveaux) s'afficheront toujours correctement dans le fuseau horaire configuré. Les joueurs verront toujours la bonne heure quelle que soit votre configuration. Voir la section "🧳 Cas spécial : Coach qui voyage" pour plus de détails.

**Q: Que se passe-t-il avec mes créneaux déjà créés si je change de fuseau horaire ?**
> Tous vos créneaux restent valides et représentent les mêmes moments dans le temps. Ils s'afficheront simplement dans votre nouveau fuseau horaire. Par exemple, un créneau créé à "14:00 Bangkok" s'affichera "23:00 Vegas (veille)" après le changement - c'est normal, c'est le même instant !

### Pour les Joueurs

**Q: J'utilise un VPN, cela affecte-t-il les horaires affichés ?**
> Non, le système utilise le fuseau horaire configuré dans votre profil, pas celui détecté par votre IP. Vérifiez simplement que votre fuseau horaire est correct dans les paramètres.

**Q: Comment être sûr que je réserve à la bonne heure ?**
> Les horaires affichés sont toujours dans votre fuseau horaire local. Un badge (ex: `UTC+1`) vous le rappelle. Si l'horaire affiché est "15:00", cela signifie 15:00 dans votre heure locale.

**Q: Que se passe-t-il si je change de fuseau horaire après avoir réservé ?**
> Vos sessions déjà réservées restent aux mêmes moments (instants UTC), mais s'afficheront dans votre nouveau fuseau horaire. Vérifiez vos réservations après un changement de fuseau horaire.

**Q: Le coach voit-il la même heure que moi ?**
> Non, le coach voit l'heure dans son fuseau horaire. Mais c'est le même moment dans le temps ! Par exemple, vous voyez "15:00" à Paris, il voit "21:00" à Bangkok - c'est la même session.

### Technique

**Q: Que se passe-t-il en cas d'erreur de conversion ?**
> Le système a des fallbacks : il affichera l'heure UTC en cas de problème, et enregistrera l'erreur dans les logs pour investigation.

**Q: Le système gère-t-il l'heure d'été ?**
> Oui, automatiquement. La bibliothèque `date-fns-tz` connaît toutes les règles de changement d'heure pour tous les fuseaux horaires.

**Q: Puis-je désactiver la détection automatique ?**
> Non, mais vous pouvez toujours modifier manuellement votre fuseau horaire dans les paramètres pour forcer une valeur spécifique.

---

## 🐛 Dépannage

### Les horaires semblent incorrects

1. **Vérifiez votre fuseau horaire configuré**
   - Allez dans Paramètres → Fuseau horaire
   - Assurez-vous qu'il correspond à votre localisation actuelle

2. **Videz le cache du navigateur**
   - Le fuseau horaire détecté peut être mis en cache
   - Rechargez la page avec Ctrl+F5 (ou Cmd+Shift+R sur Mac)

3. **Vérifiez la date système de votre ordinateur**
   - Une date/heure système incorrecte peut causer des problèmes
   - Synchronisez avec un serveur NTP si nécessaire

### Le badge UTC n'apparaît pas

- Attendez quelques secondes, le fuseau horaire est détecté côté client
- Vérifiez que JavaScript est activé dans votre navigateur
- Rechargez la page

### Les disponibilités n'apparaissent pas

- Vérifiez que le coach a bien créé des disponibilités futures
- Assurez-vous que vous regardez les bons jours
- Les créneaux déjà réservés n'apparaissent plus comme disponibles

---

## 📝 Notes pour les développeurs

### Bibliothèques utilisées
- `date-fns`: Manipulation et formatage des dates
- `date-fns-tz`: Gestion des fuseaux horaires et conversions
- Format de stockage: ISO 8601 en UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`)

### Fonctions principales
- `convertLocalToUTC(localDate, timezone)`: Convertit une date locale → UTC
- `convertUTCToLocal(utcDate, timezone)`: Convertit une date UTC → locale
- `formatInTimezone(utcDate, timezone, format)`: Formate une date UTC dans un fuseau horaire spécifique
- `fromZonedTime(date, timezone)`: date-fns-tz - traite une date comme étant dans un fuseau et retourne l'UTC
- `toZonedTime(date, timezone)`: date-fns-tz - convertit une date UTC vers un fuseau horaire

### Fichiers clés
- `/src/lib/timezone.ts`: Toutes les fonctions de conversion
- `/src/hooks/useTimezone.ts`: Hook React pour gérer le fuseau horaire côté client
- `/src/components/calendar/QuickAddAvailability.tsx`: Ajout de disponibilités (coach)
- `/src/components/calendar/AvailabilityList.tsx`: Liste des disponibilités (coach)
- `/src/components/coach/public/CoachAvailabilityPreview.tsx`: Aperçu public des disponibilités
- `/src/components/booking/SessionSelector.tsx`: Sélection de créneau (joueur)

### Convention de nommage
- Variables contenant des dates UTC: suffixe `UTC` (ex: `startUTC`)
- Variables contenant des dates locales: suffixe `Local` (ex: `startLocal`)
- Toujours préciser dans les commentaires si une date est en UTC ou locale

---

## ✅ Checklist de vérification

### Pour tester le système

- [ ] Coach ajoute une disponibilité de 09:00-12:00 dans son fuseau horaire (ex: Bangkok UTC+7)
- [ ] Dans le dashboard coach, vérifier que "Mes disponibilités" affiche 09:00-12:00
- [ ] Sur la page publique du coach (en tant que visiteur à Paris UTC+1), vérifier que les horaires affichent 03:00-06:00
- [ ] Sur la page de réservation (en tant que joueur à Paris UTC+1), vérifier que les horaires affichent 03:00-06:00
- [ ] Vérifier que le badge UTC+1 s'affiche correctement sur les pages publiques
- [ ] Vérifier que le tooltip s'affiche au survol du badge UTC
- [ ] Vérifier qu'après réservation, le coach et le joueur voient la bonne heure dans leur fuseau horaire respectif

---

## 📧 Support

Pour toute question ou problème lié aux fuseaux horaires :
- Créez une issue sur le repository GitHub
- Contactez l'équipe technique à support@edgemy.gg

---

**Dernière mise à jour** : 27 novembre 2025
**Version** : 1.0
**Auteur** : Équipe Edgemy avec assistance Claude Code
