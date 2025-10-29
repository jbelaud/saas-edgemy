# Variables d'environnement Discord

Ajouter ces variables dans votre fichier `.env` :

```env
# Discord Bot (pour créer les salons)
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_server_id_here
DISCORD_CATEGORY_ID=your_category_id_here

# Discord OAuth2 (pour lier les comptes)
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=https://app.edgemy.fr/api/discord/oauth/callback

# URL de l'application (pour les appels internes)
NEXT_PUBLIC_APP_URL=https://app.edgemy.fr

# Variables publiques (accessibles côté client)
NEXT_PUBLIC_DISCORD_GUILD_ID=your_server_id_here
```

## Où trouver ces valeurs ?

Voir la documentation complète dans `DISCORD_INTEGRATION.md`
