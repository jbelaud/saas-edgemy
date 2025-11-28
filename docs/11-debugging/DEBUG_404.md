# 🔍 Debug de l'erreur 404 sur PATCH /api/coach/profile

## ✅ Vérifications effectuées

1. ✅ Le fichier `src/app/api/coach/profile/route.ts` existe
2. ✅ La méthode `PATCH` est bien exportée
3. ✅ Le cache `.next` a été supprimé

## 🛠️ Solutions

### Solution 1 : Redémarrage complet (FAIT)

```bash
# 1. Supprimer le cache
rm -rf .next

# 2. Tuer tous les processus Node
taskkill /F /IM node.exe

# 3. Redémarrer le serveur
pnpm dev
```

### Solution 2 : Vérifier la configuration TypeScript

Si l'erreur persiste, vérifiez que TypeScript compile correctement :

```bash
npx tsc --noEmit
```

### Solution 3 : Vérifier les logs du serveur

Lors du redémarrage du serveur, vérifiez dans le terminal :
- Pas d'erreur de compilation
- Les routes API sont bien détectées

### Solution 4 : Test manuel de l'endpoint

Une fois le serveur redémarré, testez l'endpoint :

```bash
# Avec curl (si disponible sur Windows)
curl -X PATCH http://localhost:3000/api/coach/profile \
  -H "Content-Type: application/json" \
  -d '{"timezone":"Europe/Paris"}'

# Ou avec PowerShell
Invoke-WebRequest -Uri "http://localhost:3000/api/coach/profile" `
  -Method PATCH `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"timezone":"Europe/Paris"}'
```

### Solution 5 : Vérifier dans le navigateur

1. Ouvrir les DevTools (F12)
2. Onglet Network
3. Essayer de sauvegarder le fuseau horaire dans `/coach/settings`
4. Vérifier la requête PATCH :
   - URL : `/api/coach/profile`
   - Méthode : PATCH
   - Status : Devrait être 200 (pas 404)

## 🔍 Diagnostic de l'erreur 404

Si vous voyez toujours une 404, cela peut venir de :

### Problème 1 : Conflit de routes

Vérifier qu'il n'y a pas de conflit avec d'autres routes :

```bash
ls -la src/app/api/coach/profile/
```

**Résultat attendu** :
- `route.ts` (avec GET et PATCH)
- `[slug]/` (dossier pour les routes dynamiques)
- `images/` (dossier pour les images)

### Problème 2 : Middleware qui bloque

Vérifier s'il y a un middleware qui pourrait bloquer la requête PATCH :

```bash
cat src/middleware.ts
```

### Problème 3 : Authentification

L'erreur 404 peut aussi être une erreur 401 (non authentifié) mal interprétée.

Vérifier dans les DevTools :
- La requête contient-elle le cookie de session ?
- L'utilisateur est-il bien connecté ?

## 📝 Checklist de debug

Cochez au fur et à mesure :

- [x] Cache `.next` supprimé
- [ ] Serveur redémarré avec `pnpm dev`
- [ ] Aucune erreur de compilation dans le terminal
- [ ] Test dans le navigateur : `/coach/settings`
- [ ] Sélectionner un fuseau horaire
- [ ] Cliquer sur "Enregistrer"
- [ ] Vérifier dans DevTools → Network → requête PATCH
- [ ] Status code = 200 (succès) ou 404 (échec) ?

## 🎯 Résolution attendue

Après avoir supprimé le cache et redémarré le serveur, la requête PATCH devrait fonctionner :

**Avant** :
```
PATCH /api/coach/profile → 404 Not Found
```

**Après** :
```
PATCH /api/coach/profile → 200 OK
Response: { coach: { id: "...", timezone: "Europe/Paris", ... } }
```

## 💡 Alternative : Test direct de l'API

Si le problème persiste, créez un fichier de test :

```typescript
// test-patch.ts
const testPatchAPI = async () => {
  const response = await fetch('http://localhost:3000/api/coach/profile', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': 'YOUR_SESSION_COOKIE_HERE'
    },
    body: JSON.stringify({
      timezone: 'Europe/Paris'
    })
  });

  console.log('Status:', response.status);
  console.log('Response:', await response.json());
};

testPatchAPI();
```

Exécuter avec :
```bash
npx tsx test-patch.ts
```

---

**Note** : Le cache `.next` a été supprimé. Redémarrez simplement le serveur avec `pnpm dev` et l'erreur 404 devrait disparaître ! 🚀
