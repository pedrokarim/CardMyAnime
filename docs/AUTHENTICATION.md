# Authentification

> 🇬🇧 [English version](AUTHENTICATION.en.md)

L'authentification utilise **NextAuth v5** (Auth.js) avec le provider **Discord OAuth** et une strategie **JWT** (pas de session en base).

## Fonctionnement

1. L'utilisateur se connecte via Discord OAuth sur `/auth/signin`
2. Le callback `signIn` verifie que l'ID Discord est dans la liste `AUTHORIZED_USERS`
3. Si autorise : un token JWT est cree avec l'ID et l'avatar Discord
4. Si non autorise : la connexion est refusee (`return false`)

Seuls les utilisateurs dont l'ID Discord figure dans `AUTHORIZED_USERS` peuvent acceder au panel admin.

## Configuration

### 1. Creer une application Discord

1. Aller sur [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → nommer (ex: "CardMyAnime Admin")
3. Section **OAuth2** → copier **Client ID** et **Client Secret**
4. Section **OAuth2 → Redirects** → ajouter :
   - Dev : `http://localhost:3000/api/auth/callback/discord`
   - Prod : `https://cma.ascencia.re/api/auth/callback/discord`

### 2. Variables d'environnement

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="une-cle-aleatoire-securisee"
DISCORD_CLIENT_ID="votre-client-id"
DISCORD_CLIENT_SECRET="votre-client-secret"
AUTHORIZED_USERS="123456789012345678,987654321098765432"
```

- `NEXTAUTH_SECRET` : chaine aleatoire pour signer les JWT. Generer avec `openssl rand -base64 32`.
- `AUTHORIZED_USERS` : IDs Discord separes par des virgules, sans espaces.

### 3. Obtenir un ID Discord

1. Discord → Parametres → Avances → **Mode developpeur** (activer)
2. Clic droit sur un utilisateur → **Copier l'ID**

## Code source

La configuration se trouve dans `src/lib/auth.ts` :

```typescript
// Liste des IDs autorises depuis .env
const AUTHORIZED_USERS = process.env.AUTHORIZED_USERS?.split(",")
  .map((id) => id.trim())
  .filter(Boolean) || [];

// Callback signIn : verification de l'ID Discord
async signIn({ account, profile }) {
  if (account?.provider === "discord" && profile?.id) {
    return AUTHORIZED_USERS.includes(profile.id as string);
  }
  return false;
}
```

Les routes d'authentification sont exposees via `src/app/api/auth/[...nextauth]/route.ts`.

## Pages

| URL | Description |
|-----|-------------|
| `/auth/signin` | Page de connexion (bouton Discord) |
| `/auth/error` | Page d'erreur d'authentification |
| `/admin` | Panel admin (protege) |

## Securite

- Le **Client Secret** ne doit jamais etre commite dans le repo
- Le **NEXTAUTH_SECRET** doit etre unique par environnement
- La liste **AUTHORIZED_USERS** ne doit pas etre exposee publiquement
- La strategie JWT evite de stocker des sessions en base

## Depannage

| Probleme | Solution |
|----------|----------|
| "Acces non autorise" | Verifier que l'ID Discord est dans `AUTHORIZED_USERS` (pas d'espaces) |
| Erreur de redirect | Verifier que l'URL de callback est configuree dans le portail Discord |
| Token invalide | Verifier `NEXTAUTH_SECRET` et `NEXTAUTH_URL` |
