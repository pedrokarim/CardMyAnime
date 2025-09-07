# Configuration de l'Authentification Discord

## Variables d'Environnement Requises

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Base de données
DATABASE_URL="file:./dev.db"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-ici"

# Discord OAuth
DISCORD_CLIENT_ID="votre-client-id-discord"
DISCORD_CLIENT_SECRET="votre-client-secret-discord"

# Utilisateurs autorisés (IDs Discord séparés par des virgules)
AUTHORIZED_USERS="123456789012345678,987654321098765432"
```

## Configuration Discord

### 1. Créer une Application Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Cliquez sur "New Application"
3. Donnez un nom à votre application (ex: "CardMyAnime Admin")

### 2. Configurer OAuth2

1. Dans votre application, allez dans "OAuth2" → "General"
2. Copiez le "Client ID" et "Client Secret"
3. Ajoutez ces valeurs dans votre `.env`

### 3. Configurer les Redirects

1. Dans "OAuth2" → "Redirects"
2. Ajoutez : `http://localhost:3000/api/auth/callback/discord`

## Gestion des Utilisateurs Autorisés

### Format de la Variable AUTHORIZED_USERS

La variable `AUTHORIZED_USERS` accepte une liste d'IDs Discord séparés par des virgules :

```env
# Un seul utilisateur
AUTHORIZED_USERS="123456789012345678"

# Plusieurs utilisateurs
AUTHORIZED_USERS="123456789012345678,987654321098765432,555666777888999000"
```

### Comment Obtenir un ID Discord

1. **Mode développeur Discord** : Activez le mode développeur dans Discord (Paramètres → Avancés → Mode développeur)
2. **Clic droit** sur un utilisateur → "Copier l'ID"
3. **Ajoutez l'ID** à votre variable `AUTHORIZED_USERS`

### Exemple de Configuration

```env
# .env
AUTHORIZED_USERS="123456789012345678,987654321098765432"

# Cela autorisera les utilisateurs avec ces IDs Discord
```

## Sécurité

- **NEXTAUTH_SECRET** : Utilisez une chaîne aléatoire sécurisée
- **AUTHORIZED_USERS** : Ne partagez jamais cette liste publiquement
- **Client Secret** : Gardez-le secret et ne le committez jamais

## Test de la Configuration

1. Démarrez l'application : `bun dev`
2. Allez sur : `http://localhost:3000/auth/signin`
3. Cliquez sur "Se connecter avec Discord"
4. Si votre ID est dans `AUTHORIZED_USERS`, vous devriez être redirigé vers `/admin`

## Dépannage

### Erreur "Accès non autorisé"
- Vérifiez que votre ID Discord est bien dans `AUTHORIZED_USERS`
- Vérifiez le format (pas d'espaces, virgules correctes)

### Erreur de configuration Discord
- Vérifiez que `DISCORD_CLIENT_ID` et `DISCORD_CLIENT_SECRET` sont corrects
- Vérifiez que le redirect URL est configuré dans Discord

### Erreur de base de données
- Vérifiez que `DATABASE_URL` pointe vers un fichier SQLite valide
- Exécutez `bunx prisma db push` pour créer les tables
