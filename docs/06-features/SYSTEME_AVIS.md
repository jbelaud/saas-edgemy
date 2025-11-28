# 📝 Système d'Avis Edgemy - Documentation Coach

## 🎯 Vue d'ensemble

Le système d'avis Edgemy permet de collecter des avis de vos élèves, **même s'ils n'ont jamais réservé sur la plateforme**. C'est un levier SEO puissant pour votre page publique.

---

## 🚀 2 Modes de Collecte d'Avis

### Mode 1 : Avis Post-Session (Automatique)
Après chaque session complétée sur Edgemy :
- Le joueur reçoit automatiquement un email/notification
- Il peut laisser un avis directement depuis son dashboard
- **Avis vérifié** ✅ (lié à une vraie réservation)
- **Public immédiatement** sans validation manuelle

### Mode 2 : Avis Externe (MVP Bootstrap) ⭐
Pour vos anciens élèves ou élèves extérieurs à Edgemy :
- Vous partagez un lien unique : `edgemy.fr/fr/coach/[votre-slug]/review`
- Vos élèves créent un compte rapide (nom + email)
- Ils laissent leur avis
- **Nécessite validation** par vous ou l'équipe Edgemy
- **Public après approbation**

---

## 📋 Comment Collecter des Avis Externes ?

### Étape 1 : Récupérer votre lien d'avis

**Option A : Depuis votre page publique coach**
- Allez sur votre profil public : `edgemy.fr/fr/coach/[votre-slug]`
- Cliquez sur le bouton **"Partager le lien d'avis"**
- Le lien est automatiquement copié dans votre presse-papier

**Option B : Construire manuellement**
```
https://edgemy.fr/fr/coach/[VOTRE-SLUG]/review
```
Remplacez `[VOTRE-SLUG]` par votre slug unique.

### Étape 2 : Partager le lien

**Messages types à envoyer :**

**Discord / Message privé :**
```
Hey [Prénom] ! 👋

J'espère que nos sessions t'ont aidé à progresser 🚀

Si tu as 2 minutes, ça m'aiderait énormément d'avoir ton retour sur ma page Edgemy :
👉 https://edgemy.fr/fr/coach/[votre-slug]/review

Merci d'avance !
```

**Email :**
```
Objet : Ton avis sur nos sessions de coaching

Bonjour [Prénom],

J'espère que tu vas bien et que les stratégies qu'on a travaillées ensemble portent leurs fruits 🎯

Je suis maintenant sur Edgemy, une nouvelle plateforme de coaching poker, et ton retour serait très précieux pour m'aider à me faire connaître.

Si tu as 2 minutes, pourrais-tu laisser un avis sur ma page :
https://edgemy.fr/fr/coach/[votre-slug]/review

Merci beaucoup pour ton soutien !

À bientôt,
[Votre prénom]
```

**Story Instagram / Twitter :**
```
🎓 Ancien élève ? Ton avis compte !

Aide-moi à construire ma réputation sur Edgemy 🚀
👉 [Lien]

#Poker #Coaching #Edgemy
```

### Étape 3 : Valider les avis reçus

Une fois que vos élèves ont soumis leurs avis :

1. **Dashboard Coach** (à venir)
   - Section "Avis en attente"
   - Bouton "Approuver" ou "Refuser"

2. **API manuelle** (temporaire pour MVP)
   - Contactez l'équipe Edgemy
   - Nous validons l'avis pour vous

---

## 🎨 Ce que voient vos élèves

### Page de soumission d'avis

Quand vos élèves cliquent sur le lien, ils arrivent sur une page épurée avec :

1. **Votre photo** et nom en haut
2. **Formulaire simple :**
   - ⭐ Note sur 5 (étoiles interactives)
   - 📝 Nom
   - 📧 Email (non publié)
   - 💬 Commentaire (minimum 10 caractères)

3. **Message de validation :**
   ```
   ✅ Merci pour votre avis !
   Il sera publié sur la page de [Votre nom] après validation.
   ```

4. **Création de compte automatique**
   - Si l'email n'existe pas → compte joueur créé
   - Si l'email existe déjà → avis lié au compte existant

---

## 🔒 Modération & Validation

### Pourquoi une validation manuelle ?

Les avis externes nécessitent validation pour :
- **Éviter le spam** et faux avis
- **Garantir la qualité** du contenu
- **Protéger votre réputation** (vous pouvez refuser un avis inapproprié)

### Critères d'approbation

**À approuver ✅**
- Avis constructifs (positifs ou négatifs)
- Commentaires détaillés et authentiques
- Langage respectueux

**À refuser ❌**
- Spam ou contenu promotionnel
- Injures ou langage inapproprié
- Avis génériques sans contexte (ex: "Très bon")
- Faux avis évidents

---

## 📊 Impact SEO

### Pourquoi les avis sont importants ?

1. **Rich Snippets Google** ⭐
   - Les étoiles s'affichent dans les résultats de recherche
   - +40% de taux de clic (CTR) en moyenne

2. **Contenu UGC (User Generated Content)** 📝
   - Google valorise le contenu authentique
   - Améliore le référencement de votre page

3. **Preuve sociale** 🤝
   - Convertit mieux les visiteurs en clients
   - Augmente la confiance

4. **GEO (Generative Engine Optimization)** 🤖
   - ChatGPT, Perplexity & co utilisent les avis
   - Meilleure visibilité dans les réponses IA

---

## 🎯 Objectifs MVP

### Phase 1 (Actuel) - Bootstrap Avis
- ✅ Lien public de collecte d'avis
- ✅ Création de compte joueur automatique
- ✅ Validation manuelle par coach/admin
- ✅ Affichage sur page publique coach

### Phase 2 (Prochain sprint)
- Dashboard coach pour gérer les avis
- Avis post-session automatique
- Notifications email coach (nouvel avis)
- Système de réponse aux avis

### Phase 3 (Future)
- Filtres d'avis (note, date, vérifié)
- Avis photos/vidéos
- Badges "Avis vérifié" vs "Avis externe"
- Analytics avis (taux de satisfaction, etc.)

---

## 💡 Best Practices

### Pour collecter un maximum d'avis :

1. **Timing optimal :** Demandez l'avis 2-3 jours après la dernière session
2. **Personnalisez :** Utilisez le prénom et mentionnez un point spécifique de vos sessions
3. **Facilitez :** Le lien doit être cliquable (pas juste copié-collé)
4. **Rappelez :** Si pas de réponse après 7 jours, relancez poliment
5. **Remerciez :** Envoyez un message de remerciement après chaque avis

### Messages à éviter :

❌ "Mets-moi 5 étoiles stp"
❌ "Écris un truc positif"
❌ Insister lourdement

✅ "Ton retour honnête serait précieux"
✅ "Partage ton expérience, bonne ou moins bonne"

---

## 🆘 Support

### Questions fréquentes

**Q : Combien d'avis puis-je recevoir ?**
R : Illimité ! Plus vous en avez, mieux c'est pour le SEO.

**Q : Puis-je supprimer un avis après validation ?**
R : Oui, contactez l'équipe Edgemy.

**Q : Un joueur peut-il modifier son avis ?**
R : Pas pour le moment (prévu en Phase 2).

**Q : Les avis sont-ils anonymes ?**
R : Non, le nom du joueur est affiché publiquement. L'email reste privé.

**Q : Puis-je répondre aux avis ?**
R : Pas encore (prévu en Phase 2).

### Contact

- **Email :** support@edgemy.fr
- **Discord :** [Lien serveur] (canal #support-coachs)

---

**Généré par Edgemy** 🚀
_Version 1.0 - Système d'avis MVP_
