# 🔐 Guide de Sécurité Edgemy

Ce document décrit les mesures de sécurité implémentées dans l'application Edgemy et les bonnes pratiques à suivre.

## Table des Matières

1. [Architecture de Sécurité](#architecture-de-sécurité)
2. [Authentification](#authentification)
3. [Autorisation](#autorisation)
4. [Protection des Données](#protection-des-données)
5. [Sécurité des APIs](#sécurité-des-apis)
6. [Sécurité des Paiements](#sécurité-des-paiements)
7. [Monitoring et Audit](#monitoring-et-audit)
8. [Checklist de Déploiement](#checklist-de-déploiement)

---

## Architecture de Sécurité

### Headers HTTP

Tous les headers de sécurité sont configurés dans `next.config.ts` :

| Header | Valeur | Protection |
|--------|--------|------------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Frame-Options` | `DENY` | Anti-clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Fuite d'URL |
| `Content-Security-Policy` | Voir config | XSS, injection |
| `Permissions-Policy` | Désactive caméra, micro, géoloc | Privacy |

### Content Security Policy (CSP)

La CSP est configurée pour autoriser uniquement :
- Scripts : `self`, Stripe, Cloudflare
- Styles : `self`, Google Fonts
- Images : `self`, data:, blob:, https:
- Connexions : `self`, Stripe, Supabase, Upstash, Brevo, Discord
- Frames : Stripe uniquement

---

## Authentification

### Better Auth

L'authentification est gérée par Better Auth avec :
- Cookies HTTP-only sécurisés
- Session expiration : 7 jours
- Cross-subdomain cookies pour `.edgemy.fr`
- OAuth Google

### Bonnes Pratiques

```typescript
// ✅ Toujours vérifier la session côté serveur
const session = await auth.api.getSession({
  headers: await headers(),
});

if (!session?.user?.id) {
  return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
}

// ✅ Utiliser l'ID de session, jamais les données client
const userId = session.user.id; // Sécurisé
// ❌ const userId = body.userId; // DANGEREUX
```

---

## Autorisation

### Contrôle d'Accès par Rôle

```typescript
// Vérifier le rôle utilisateur
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
}

// Vérifier la propriété d'une ressource
if (reservation.playerId !== session.user.id) {
  return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
}
```

### Routes Protégées

| Route | Rôles Autorisés |
|-------|-----------------|
| `/api/admin/*` | ADMIN |
| `/api/coach/*` | COACH, ADMIN |
| `/api/player/*` | PLAYER, ADMIN |
| `/api/reservations` | Authentifié |

---

## Protection des Données

### Validation des Entrées (Zod)

```typescript
import { updateCoachProfileSchema } from '@/lib/validation/schemas';

const validationResult = updateCoachProfileSchema.safeParse(body);
if (!validationResult.success) {
  return NextResponse.json(
    { error: 'Données invalides', details: validationResult.error.issues },
    { status: 400 }
  );
}
```

### Sanitization

```typescript
import { sanitizeString, sanitizeObject } from '@/lib/security';

// Nettoyer une chaîne
const cleanInput = sanitizeString(userInput);

// Nettoyer un objet complet
const cleanBody = sanitizeObject(requestBody);
```

### Protection PII

```typescript
import { redactSensitiveData, maskEmail } from '@/lib/security';

// Pour les logs
logger.info('User action', redactSensitiveData(userData));

// Masquer un email
const safeEmail = maskEmail('john@example.com'); // j***@e***.com
```

---

## Sécurité des APIs

### Rate Limiting

```typescript
import { applyRateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // 10 req/min pour les APIs publiques
  const rateLimitResponse = await applyRateLimit(request, 'public');
  if (rateLimitResponse) return rateLimitResponse;
  
  // ... logique
}
```

| Type | Limite | Usage |
|------|--------|-------|
| `auth` | 5/min | Login, signup |
| `public` | 10/min | Subscribe, contact |
| `sensitive` | 20/min | Paiements, profil |
| `general` | 100/min | APIs générales |

### Protection CSRF

```typescript
import { validateCsrfToken } from '@/lib/security/csrf';

export async function POST(request: NextRequest) {
  const csrfError = await validateCsrfToken(request);
  if (csrfError) return csrfError;
  
  // ... logique
}
```

Côté client :
```typescript
import { fetchWithCsrf } from '@/lib/security/csrf-client';

const response = await fetchWithCsrf('/api/sensitive', {
  method: 'POST',
  body: JSON.stringify(data),
});
```

---

## Sécurité des Paiements

### Stripe

- ✅ Vérification signature webhook (`stripe.webhooks.constructEvent`)
- ✅ Montants calculés côté serveur (jamais côté client)
- ✅ Vérification propriétaire réservation avant checkout
- ✅ Argent gelé jusqu'à fin de session

### Bonnes Pratiques

```typescript
// ✅ Toujours vérifier la signature webhook
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);

// ✅ Calculer les montants côté serveur
const pricing = calculateForSession(reservation.priceCents);

// ❌ Ne jamais faire confiance aux montants client
// const amount = body.amount; // DANGEREUX
```

---

## Monitoring et Audit

### Audit Trail

```typescript
import { auditLog, AuditAction, paymentAudit } from '@/lib/security';

// Log manuel
await auditLog({
  action: AuditAction.PROFILE_UPDATED,
  userId: session.user.id,
  resourceType: 'coach',
  resourceId: coachId,
  request,
});

// Helpers spécialisés
await paymentAudit.completed(userId, reservationId, amount, request);
```

### Logger Conditionnel

```typescript
import { logger } from '@/lib/logger';

// En production : uniquement warn et error
logger.debug('Info debug'); // Ignoré en prod
logger.info('Information');  // Ignoré en prod
logger.warn('Attention');    // Loggé
logger.error('Erreur');      // Loggé
```

---

## Checklist de Déploiement

### Variables d'Environnement Requises

```env
# Authentification
BETTER_AUTH_SECRET=xxx (min 32 caractères)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Base de données
DATABASE_URL=xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Rate Limiting (optionnel mais recommandé)
UPSTASH_REDIS_REST_URL=xxx
UPSTASH_REDIS_REST_TOKEN=xxx

# Cron Jobs
CRON_SECRET=xxx (min 32 caractères)
```

### Vérifications Avant Déploiement

- [ ] `pnpm audit` → 0 vulnérabilités
- [ ] `pnpm tsc --noEmit` → 0 erreurs
- [ ] Toutes les variables d'environnement configurées
- [ ] CRON_SECRET défini et unique
- [ ] Webhook Stripe configuré avec le bon secret
- [ ] Rate limiting configuré (Upstash)
- [ ] Logs de production vérifiés (pas de données sensibles)

### Tests de Sécurité

```bash
# Vérifier les headers de sécurité
curl -I https://app.edgemy.fr

# Vérifier la CSP
# Ouvrir DevTools > Console > Vérifier les violations CSP

# Tester le rate limiting
for i in {1..20}; do curl -X POST https://app.edgemy.fr/api/subscribe-simple; done
```

---

## Contacts Sécurité

En cas de découverte d'une vulnérabilité :
1. Ne pas la divulguer publiquement
2. Contacter l'équipe technique immédiatement
3. Documenter les étapes de reproduction

---

*Dernière mise à jour : Décembre 2025*
