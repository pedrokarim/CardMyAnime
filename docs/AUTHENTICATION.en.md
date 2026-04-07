# Authentication

> 🇫🇷 [Version francaise](AUTHENTICATION.md)

Authentication uses **NextAuth v5** (Auth.js) with the **Discord OAuth** provider and a **JWT** strategy (no database sessions).

## How It Works

1. The user signs in via Discord OAuth at `/auth/signin`
2. The `signIn` callback verifies the Discord ID is in the `AUTHORIZED_USERS` list
3. If authorized: a JWT token is created with the Discord ID and avatar
4. If unauthorized: sign-in is rejected (`return false`)

Only users whose Discord ID is listed in `AUTHORIZED_USERS` can access the admin panel.

## Configuration

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. **New Application** → name it (e.g., "CardMyAnime Admin")
3. **OAuth2** section → copy **Client ID** and **Client Secret**
4. **OAuth2 → Redirects** → add:
   - Dev: `http://localhost:3000/api/auth/callback/discord`
   - Prod: `https://cma.ascencia.re/api/auth/callback/discord`

### 2. Environment Variables

```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="a-secure-random-key"
DISCORD_CLIENT_ID="your-client-id"
DISCORD_CLIENT_SECRET="your-client-secret"
AUTHORIZED_USERS="123456789012345678,987654321098765432"
```

- `NEXTAUTH_SECRET`: random string to sign JWTs. Generate with `openssl rand -base64 32`.
- `AUTHORIZED_USERS`: comma-separated Discord IDs, no spaces.

### 3. Get a Discord ID

1. Discord → Settings → Advanced → **Developer Mode** (enable)
2. Right-click a user → **Copy ID**

## Source Code

Configuration is in `src/lib/auth.ts`:

```typescript
// Authorized IDs list from .env
const AUTHORIZED_USERS = process.env.AUTHORIZED_USERS?.split(",")
  .map((id) => id.trim())
  .filter(Boolean) || [];

// signIn callback: Discord ID verification
async signIn({ account, profile }) {
  if (account?.provider === "discord" && profile?.id) {
    return AUTHORIZED_USERS.includes(profile.id as string);
  }
  return false;
}
```

Auth routes are exposed via `src/app/api/auth/[...nextauth]/route.ts`.

## Pages

| URL | Description |
|-----|-------------|
| `/auth/signin` | Sign-in page (Discord button) |
| `/auth/error` | Authentication error page |
| `/admin` | Admin panel (protected) |

## Security

- The **Client Secret** must never be committed to the repo
- **NEXTAUTH_SECRET** must be unique per environment
- The **AUTHORIZED_USERS** list must not be publicly exposed
- JWT strategy avoids storing sessions in the database

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Unauthorized access" | Verify the Discord ID is in `AUTHORIZED_USERS` (no spaces) |
| Redirect error | Verify the callback URL is configured in Discord portal |
| Invalid token | Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` |
