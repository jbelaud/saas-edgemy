# TODO: Notifications Email pour les Sessions

## 📧 À Implémenter Plus Tard

### Service de Notifications Email (Brevo)

#### 1. **Email: Session Planifiée**
**Déclencheur**: Quand un coach planifie une session de pack

**Destinataire**: Joueur

**Contenu**:
- Nom du coach
- Date et heure de la session
- Durée de la session
- Heures restantes dans le pack
- Lien pour voir ses sessions
- Bouton "Ajouter au calendrier" (iCal)

**Template Brevo**: `session-scheduled`

**API à modifier**: 
- `POST /api/coach/schedule-pack-session` (ligne ~140)
- Ajouter après la création de la session:
```typescript
// Envoyer email au joueur
await sendEmail({
  to: coachingPackage.player.email,
  templateId: BREVO_TEMPLATE_IDS.SESSION_SCHEDULED,
  params: {
    playerName: coachingPackage.player.name,
    coachName: coach.user.name,
    sessionDate: format(start, "EEEE d MMMM yyyy", { locale: fr }),
    sessionTime: `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`,
    duration: durationMinutes,
    remainingHours: coachingPackage.remainingHours - durationHours,
    sessionsLink: `${process.env.NEXT_PUBLIC_APP_URL}/player/sessions`,
  },
});
```

---

#### 2. **Email: Session Modifiée**
**Déclencheur**: Quand un coach modifie une session existante

**Destinataire**: Joueur

**Contenu**:
- Notification de modification
- Ancienne date/heure
- Nouvelle date/heure
- Nom du coach
- Lien pour voir ses sessions

**Template Brevo**: `session-modified`

**API à modifier**: 
- `PUT /api/coach/sessions/[sessionId]` (ligne ~130)

---

#### 3. **Email: Session Annulée**
**Déclencheur**: Quand un coach annule une session

**Destinataire**: Joueur

**Contenu**:
- Notification d'annulation
- Date/heure de la session annulée
- Heures recréditées
- Nom du coach
- Encouragement à replanifier
- Lien pour contacter le coach

**Template Brevo**: `session-cancelled`

**API à modifier**: 
- `DELETE /api/coach/sessions/[sessionId]` (ligne ~180)

---

#### 4. **Email: Rappel de Session (24h avant)**
**Déclencheur**: Cron job quotidien qui vérifie les sessions dans 24h

**Destinataires**: Coach ET Joueur

**Contenu**:
- Rappel de la session demain
- Date et heure exacte
- Durée
- Nom du coach/joueur
- Lien pour rejoindre (si visio)

**Template Brevo**: `session-reminder`

**Implémentation**: 
- Créer un cron job Vercel ou utiliser un service externe
- Route API: `POST /api/cron/send-session-reminders`

---

### 🛠️ Service Email à Créer

**Fichier**: `src/lib/email/brevo.ts`

```typescript
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SendEmailParams {
  to: string;
  templateId: number;
  params: Record<string, any>;
}

export async function sendEmail({ to, templateId, params }: SendEmailParams) {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        to: [{ email: to }],
        templateId,
        params,
      }),
    });

    if (!response.ok) {
      throw new Error(`Brevo API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erreur envoi email:', error);
    // Ne pas bloquer l'opération si l'email échoue
    return null;
  }
}

export const BREVO_TEMPLATE_IDS = {
  SESSION_SCHEDULED: 1, // À créer dans Brevo
  SESSION_MODIFIED: 2,  // À créer dans Brevo
  SESSION_CANCELLED: 3, // À créer dans Brevo
  SESSION_REMINDER: 4,  // À créer dans Brevo
};
```

---

### 📋 Templates Brevo à Créer

1. **session-scheduled**
   - Variables: `{{playerName}}`, `{{coachName}}`, `{{sessionDate}}`, `{{sessionTime}}`, `{{duration}}`, `{{remainingHours}}`, `{{sessionsLink}}`

2. **session-modified**
   - Variables: `{{playerName}}`, `{{coachName}}`, `{{oldDate}}`, `{{oldTime}}`, `{{newDate}}`, `{{newTime}}`, `{{sessionsLink}}`

3. **session-cancelled**
   - Variables: `{{playerName}}`, `{{coachName}}`, `{{sessionDate}}`, `{{sessionTime}}`, `{{creditedHours}}`, `{{coachProfileLink}}`

4. **session-reminder**
   - Variables: `{{recipientName}}`, `{{otherPersonName}}`, `{{sessionDate}}`, `{{sessionTime}}`, `{{duration}}`, `{{joinLink}}`

---

### 🔧 Variables d'Environnement à Ajouter

```env
BREVO_API_KEY=your_brevo_api_key_here
NEXT_PUBLIC_APP_URL=https://app.edgemy.fr
```

---

### ✅ Checklist d'Implémentation

- [ ] Créer le service email `src/lib/email/brevo.ts`
- [ ] Créer les 4 templates dans Brevo
- [ ] Ajouter les variables d'environnement
- [ ] Modifier `POST /api/coach/schedule-pack-session`
- [ ] Modifier `PUT /api/coach/sessions/[sessionId]`
- [ ] Modifier `DELETE /api/coach/sessions/[sessionId]`
- [ ] Créer le cron job pour les rappels
- [ ] Tester tous les emails en staging
- [ ] Documenter les templates Brevo

---

### 📝 Notes

- Les emails ne doivent **jamais bloquer** l'opération principale
- Utiliser des try/catch pour gérer les erreurs d'envoi
- Logger les erreurs mais ne pas les remonter à l'utilisateur
- Prévoir un système de retry pour les emails critiques
- Respecter les préférences de notification des utilisateurs (à implémenter)

---

**Date de création**: 27 janvier 2025  
**Priorité**: Moyenne  
**Estimation**: 4-6 heures de développement
