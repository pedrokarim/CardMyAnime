# Authentification

> 🇬🇧 [English version](AUTHENTICATION.en.md)

L’administration utilise directement le **widget Ascencia ID**. L’ancien flux
Discord/Auth.js n’est plus exécuté. Le site public reste accessible sans
compte ; seules les pages `/admin` et les API d’administration exigent une
session.

## Fonctionnement

1. Le widget ouvre Ascencia ID en popup, avec un repli en redirection plein
   écran si la popup est bloquée.
2. Ascencia ID vérifie la politique d’accès de l’application CardMyAnime.
3. Le widget transmet le code et la preuve PKCE à `/api/auth/exchange`.
4. Le serveur CardMyAnime échange le code avec son secret client, vérifie la
   signature du jeton puis charge le profil OIDC.
5. Les jetons sont chiffrés en AES-256-GCM dans `AscenciaSession`. Le navigateur
   ne reçoit qu’un identifiant de session aléatoire dans un cookie `HttpOnly`,
   `SameSite=Lax` et `Secure` en production.

Le secret client et les jetons OAuth ne sont donc jamais exposés au JavaScript
de l’interface.

## Politique d’accès

La liste `AUTHORIZED_USERS` n’existe plus. L’application est configurée dans
la zone `platform` d’Ascencia ID avec la politique `role_gated` :

- le rôle membre de CardMyAnime autorise les personnes approuvées ;
- `platform:superadmin` autorise les super-admins de la plateforme ;
- une demande approuvée attribue le rôle membre par défaut ;
- un refus ou un bannissement reste prioritaire.

Les autorisations se pilotent donc dans Ascencia ID, sans redéployer
CardMyAnime.

## Configuration

Le client Ascencia ID est confidentiel, de type `web`. Ses URI de retour sont :

- développement : `http://localhost:3000/auth/callback` ;
- production : `https://cma.ascencia.re/auth/callback`.

Le mode popup utilise en interne
`https://id.ascencia.re/embed/callback`. L’origine
`https://cma.ascencia.re` doit également être autorisée.

```env
ASCENCIA_ISSUER="https://id.ascencia.re"
ASCENCIA_CLIENT_ID="asc_cid_..."
ASCENCIA_CLIENT_SECRET="asc_cs_..."
ASCENCIA_SESSION_SECRET="une-cle-aleatoire-securisee"
NEXT_PUBLIC_ASCENCIA_ISSUER="https://id.ascencia.re"
NEXT_PUBLIC_ASCENCIA_CLIENT_ID="asc_cid_..."
NEXT_PUBLIC_ASCENCIA_REDIRECT_URI="http://localhost:3000/auth/callback"
```

`ASCENCIA_SESSION_SECRET` peut être générée avec `openssl rand -base64 32`.
Les deux secrets ne doivent jamais être commités.

## Routes

| URL                  | Description                                       |
| -------------------- | ------------------------------------------------- |
| `/auth/signin`       | Charge le widget et démarre la connexion          |
| `/auth/callback`     | Termine le repli par redirection                  |
| `/api/auth/exchange` | Échange serveur du code et création du cookie     |
| `/api/auth/session`  | État minimal de la session courante               |
| `/api/auth/signout`  | Suppression locale et déconnexion SSO optionnelle |
| `/admin`             | Administration protégée                           |

## Dépannage

| Problème                            | Contrôle                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| Accès refusé chez Ascencia ID       | Vérifier le rôle CardMyAnime ou `platform:superadmin`                                |
| `redirect_uri_mismatch`             | Vérifier exactement `/auth/callback` et l’origine déclarée                           |
| Le widget reste en chargement       | Vérifier les trois variables `NEXT_PUBLIC_ASCENCIA_*` au moment du build             |
| L’échange répond 401                | Vérifier `ASCENCIA_CLIENT_SECRET` et les journaux Ascencia ID                        |
| La session disparaît au redémarrage | Vérifier la migration `AscenciaSession` et la stabilité de `ASCENCIA_SESSION_SECRET` |
