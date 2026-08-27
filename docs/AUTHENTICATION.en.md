# Authentication

> 🇫🇷 [Version française](AUTHENTICATION.md)

The administration area uses the **Ascencia ID widget** directly. The former
Discord/Auth.js flow is no longer executed. The public website remains
available without an account; only `/admin` pages and administration APIs
require a session.

## How it works

1. The widget opens Ascencia ID in a popup and falls back to a full-page
   redirect when the popup is blocked.
2. Ascencia ID evaluates the CardMyAnime application access policy.
3. The widget sends the code and PKCE verifier to `/api/auth/exchange`.
4. The CardMyAnime server exchanges the code with its client secret, verifies
   the token signature, then loads the OIDC profile.
5. Tokens are encrypted with AES-256-GCM in `AscenciaSession`. The browser only
   receives a random session identifier in an `HttpOnly`, `SameSite=Lax`
   cookie that is also `Secure` in production.

The client secret and OAuth tokens are therefore never exposed to interface
JavaScript.

## Access policy

The `AUTHORIZED_USERS` allowlist is gone. The application lives in Ascencia
ID's `platform` realm with a `role_gated` policy:

- the CardMyAnime member role admits approved users;
- `platform:superadmin` admits platform superadmins;
- an approved request grants the default member role;
- a denial or ban always takes precedence.

Access can therefore be managed in Ascencia ID without redeploying
CardMyAnime.

## Configuration

The Ascencia ID client is a confidential `web` client. Its redirect URIs are:

- development: `http://localhost:3000/auth/callback`;
- production: `https://cma.ascencia.re/auth/callback`.

Popup mode internally uses `https://id.ascencia.re/embed/callback`. The
`https://cma.ascencia.re` origin must also be allowed.

```env
ASCENCIA_ISSUER="https://id.ascencia.re"
ASCENCIA_CLIENT_ID="asc_cid_..."
ASCENCIA_CLIENT_SECRET="asc_cs_..."
ASCENCIA_SESSION_SECRET="a-secure-random-key"
NEXT_PUBLIC_ASCENCIA_ISSUER="https://id.ascencia.re"
NEXT_PUBLIC_ASCENCIA_CLIENT_ID="asc_cid_..."
NEXT_PUBLIC_ASCENCIA_REDIRECT_URI="http://localhost:3000/auth/callback"
```

Generate `ASCENCIA_SESSION_SECRET` with `openssl rand -base64 32`. Never commit
either secret.

## Routes

| URL                  | Description                                                 |
| -------------------- | ----------------------------------------------------------- |
| `/auth/signin`       | Loads the widget and starts sign-in                         |
| `/auth/callback`     | Completes the redirect fallback                             |
| `/api/auth/exchange` | Exchanges the code server-side and creates the cookie       |
| `/api/auth/session`  | Returns the current minimal session state                   |
| `/api/auth/signout`  | Deletes the local session and optionally signs out from SSO |
| `/admin`             | Protected administration area                               |

## Troubleshooting

| Issue                            | Check                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------- |
| Access denied by Ascencia ID     | Check the CardMyAnime role or `platform:superadmin`                             |
| `redirect_uri_mismatch`          | Check the exact `/auth/callback` URI and allowed origin                         |
| Widget remains in loading state  | Check all three `NEXT_PUBLIC_ASCENCIA_*` variables at build time                |
| Exchange returns 401             | Check `ASCENCIA_CLIENT_SECRET` and Ascencia ID logs                             |
| Session disappears after restart | Check the `AscenciaSession` migration and keep `ASCENCIA_SESSION_SECRET` stable |
