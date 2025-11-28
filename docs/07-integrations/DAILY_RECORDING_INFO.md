# Daily.co - Enregistrement des sessions

## 📋 Plans et fonctionnalités

### Plan gratuit / Starter (actuel)
- ✅ Visioconférence 1:1 illimitée
- ✅ Partage d'écran
- ✅ Chat texte
- ✅ Jusqu'à 1000 minutes/mois gratuites
- ❌ **Enregistrement cloud automatique NON disponible**

### Plan Scale (99$/mois)
- ✅ Tout du plan Starter
- ✅ **Enregistrement cloud (`enable_recording: 'cloud'`)**
- ✅ 10 000 minutes incluses/mois
- ✅ Stockage des enregistrements pendant 7 jours
- ✅ API pour récupérer les enregistrements

### Plan Enterprise (sur devis)
- ✅ Tout du plan Scale
- ✅ Enregistrement avec contrôles avancés
- ✅ Stockage illimité
- ✅ Webhooks pour notifications d'enregistrements
- ✅ Support prioritaire

---

## 🎥 Solutions d'enregistrement avec le plan gratuit

### Option 1 : Enregistrement local par le coach (recommandé pour MVP)

Le coach peut enregistrer la session localement en utilisant :

**Sur Windows :**
- **OBS Studio** (gratuit, open source)
  - Télécharger : https://obsproject.com/
  - Configuration : Capturer la fenêtre du navigateur
  - Format : MP4, qualité HD

- **Windows Game Bar** (intégré)
  - Raccourci : `Win + G`
  - Cliquer sur "Capturer"

**Sur Mac :**
- **QuickTime Player** (intégré)
  - Fichier > Nouvel enregistrement d'écran
  - Sélectionner la fenêtre du navigateur

**Sur Linux :**
- **SimpleScreenRecorder** (gratuit)
- **Kazam** (gratuit)

#### Workflow recommandé :
1. Coach lance l'enregistrement local avant de rejoindre la session
2. Coach partage son écran si nécessaire
3. Après la session, le coach upload le fichier sur :
   - **Cloudflare R2** (stockage pas cher : 0,015$/GB/mois)
   - **AWS S3**
   - **Google Drive** (si volume faible)
4. Le lien de l'enregistrement est sauvegardé dans `Reservation.dailyRecordingUrl`

### Option 2 : Enregistrement côté navigateur avec MediaRecorder API

Implémenter un enregistrement JavaScript côté client :

```typescript
// Dans DailyVideoCall.tsx
const [isRecording, setIsRecording] = useState(false);
const mediaRecorderRef = useRef<MediaRecorder | null>(null);

const startRecording = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: true
  });

  const mediaRecorder = new MediaRecorder(stream);
  mediaRecorderRef.current = mediaRecorder;

  const chunks: BlobPart[] = [];
  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'video/webm' });
    // Upload vers Cloudflare R2 / S3
    await uploadRecording(blob);
  };

  mediaRecorder.start();
  setIsRecording(true);
};
```

**Avantages :**
- Gratuit
- Contrôle total sur l'enregistrement
- Pas de limite de durée

**Inconvénients :**
- Nécessite que le coach clique sur "Enregistrer"
- Upload manuel après la session
- Consomme des ressources locales

### Option 3 : Passer au plan Scale Daily.co (99$/mois)

**Coûts estimés :**
- Plan Scale : 99$/mois (10 000 minutes incluses)
- Minutes supplémentaires : 0,02$/minute
- Pour 100 sessions/mois de 1h chacune = 6000 minutes
- **Total : 99$/mois** (dans les limites incluses)

**Avantages :**
- Enregistrement automatique
- Stockage cloud inclus
- API pour récupérer les enregistrements
- Webhooks pour notifications
- Pas de travail côté coach

---

## 🚀 Recommandation pour le MVP

### Phase 1 (Actuel - Plan gratuit)
- ✅ Visioconférence fonctionnelle
- ⚠️ Pas d'enregistrement automatique
- 💡 Coach peut enregistrer localement avec OBS
- 💡 Upload manuel sur Cloudflare R2 après la session

### Phase 2 (Croissance - Plan Scale)
- Upgrade vers Daily.co Scale (99$/mois)
- Activer l'enregistrement cloud automatique
- Implémenter les webhooks pour récupérer les enregistrements
- Affichage automatique des replays dans le dashboard

---

## 📝 Modifications nécessaires pour activer l'enregistrement (avec plan Scale)

Dans `src/lib/daily.ts` :

```typescript
// Décommenter ces lignes une fois passé au plan Scale :

// Ligne 189
enable_recording: 'cloud', // ✅ Activer

// Ligne 208
enable_recording: true, // ✅ Activer pour le coach
start_cloud_recording: false, // Le coach démarre manuellement

// Ligne 218 (joueur)
// Laisser commenté, seul le coach contrôle l'enregistrement
```

---

## 💰 Tableau comparatif des coûts

| Solution | Coût mensuel | Enregistrement auto | Qualité | Stockage |
|----------|--------------|---------------------|---------|----------|
| Plan gratuit + OBS local | 0€ | ❌ Manuel | ✅ HD | Coach local |
| Plan gratuit + MediaRecorder API | 0€ | ⚠️ Semi-auto | ✅ HD | Cloudflare R2 (~1€/mois) |
| Daily.co Scale | 99€ | ✅ Automatique | ✅ HD | Daily cloud (7j inclus) |
| Daily.co Scale + R2 archive | 100€ | ✅ Automatique | ✅ HD | Permanent (~1€/mois) |

---

## 🔄 Workflow actuel (Phase 1 MVP)

```
┌─────────────────────────────────────────────────────────────┐
│  AVANT LA SESSION                                            │
└─────────────────────────────────────────────────────────────┘
1. Réservation créée
2. Room Daily créée (sans enregistrement auto)
3. Tokens générés pour coach + joueur

┌─────────────────────────────────────────────────────────────┐
│  PENDANT LA SESSION                                          │
└─────────────────────────────────────────────────────────────┘
1. Coach et joueur rejoignent la room Daily
2. Coach peut :
   - Partager son écran ✅
   - Utiliser le chat ✅
   - (Option) Lancer OBS pour enregistrer localement
3. Session de coaching

┌─────────────────────────────────────────────────────────────┐
│  APRÈS LA SESSION                                            │
└─────────────────────────────────────────────────────────────┘
1. Si le coach a enregistré localement :
   - Upload du fichier vidéo sur Cloudflare R2
   - Sauvegarder l'URL dans Reservation.dailyRecordingUrl
   - Le joueur peut accéder au replay dans son dashboard
2. Sinon :
   - Pas de replay disponible

```

---

## ✅ Conclusion

Pour le **MVP Phase 1**, nous avons retiré l'enregistrement automatique pour éviter les erreurs avec le plan gratuit Daily.co.

**Prochaines étapes :**
1. Tester la visioconférence sans enregistrement ✅
2. (Option) Implémenter l'upload manuel de vidéos par le coach
3. (Croissance) Passer au plan Scale pour l'enregistrement automatique

La visioconférence fonctionne parfaitement sans enregistrement. L'upgrade vers le plan Scale sera simple quand vous serez prêt.
