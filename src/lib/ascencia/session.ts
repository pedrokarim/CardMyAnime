import "server-only";

import {
  createRemoteJWKSet,
  jwtVerify,
  type JWTPayload,
  type JWTVerifyGetKey,
} from "jose";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";
import { canAccessAdmin } from "@/lib/ascencia/access";
import { prisma } from "@/lib/prisma";

export const ASCENCIA_SESSION_COOKIE = "cma_ascencia_session";

export interface AscenciaUser {
  id: string;
  email: string | null;
  email_verified: boolean;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  locale: string | null;
}

export interface AscenciaClaims extends JWTPayload {
  app?: string;
  roles?: string[];
  prole?: string[];
}

export interface AscenciaSession {
  id: string;
  user: AscenciaUser;
  claims: AscenciaClaims;
}

interface StoredSession {
  id: string;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: Date;
  claims: string;
  profile: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number;
}

interface TokenResponse {
  access_token?: unknown;
  expires_in?: unknown;
  refresh_token?: unknown;
}

let cachedKeys: { issuer: string; keys: JWTVerifyGetKey } | null = null;
const refreshes = new Map<string, Promise<StoredSession | null>>();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} est obligatoire.`);
  return value;
}

function clientConfig() {
  return {
    issuer: requiredEnv("ASCENCIA_ISSUER").replace(/\/$/, ""),
    clientId: requiredEnv("ASCENCIA_CLIENT_ID"),
    clientSecret: requiredEnv("ASCENCIA_CLIENT_SECRET"),
  };
}

function encryptionKey(): Buffer {
  return createHash("sha256")
    .update(requiredEnv("ASCENCIA_SESSION_SECRET"))
    .digest();
}

/** Les jetons restent chiffrés au repos dans la base CardMyAnime. */
function encrypt(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(".");
}

function decrypt(value: string): string {
  const [version, encodedIv, encodedTag, encodedCiphertext] = value.split(".");
  if (version !== "v1" || !encodedIv || !encodedTag || !encodedCiphertext) {
    throw new Error("Session Ascencia illisible.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function signingKeys(issuer: string): JWTVerifyGetKey {
  if (cachedKeys?.issuer === issuer) return cachedKeys.keys;
  const keys = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
  cachedKeys = { issuer, keys };
  return keys;
}

async function verifyAccessToken(token: string): Promise<AscenciaClaims> {
  const config = clientConfig();
  const { payload } = await jwtVerify(token, signingKeys(config.issuer), {
    issuer: config.issuer,
    audience: config.clientId,
    algorithms: ["ES256"],
    requiredClaims: ["iss", "aud", "sub", "exp"],
    clockTolerance: 5,
  });
  return payload as AscenciaClaims;
}

async function requestTokens(fields: Record<string, string>): Promise<Tokens> {
  const config = clientConfig();
  const body = new URLSearchParams({
    ...fields,
    client_id: config.clientId,
    client_secret: config.clientSecret,
  });
  const response = await fetch(`${config.issuer}/oauth/token`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => ({}))) as TokenResponse;
  if (!response.ok || typeof payload.access_token !== "string") {
    throw new Error(`Échange Ascencia ID refusé (${response.status}).`);
  }

  return {
    accessToken: payload.access_token,
    refreshToken:
      typeof payload.refresh_token === "string" ? payload.refresh_token : null,
    expiresAt:
      Date.now() +
      (typeof payload.expires_in === "number" ? payload.expires_in : 600) *
        1_000,
  };
}

async function loadUser(accessToken: string): Promise<AscenciaUser> {
  const response = await fetch(`${clientConfig().issuer}/oauth/userinfo`, {
    headers: { authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Profil Ascencia ID indisponible (${response.status}).`);
  }

  const claims = (await response.json()) as Record<string, unknown>;
  if (typeof claims.sub !== "string" || claims.sub.length === 0) {
    throw new Error("Ascencia ID n’a pas renvoyé de profil.");
  }

  const optionalString = (value: unknown) =>
    typeof value === "string" && value.length > 0 ? value : null;
  return {
    id: claims.sub,
    email: optionalString(claims.email),
    email_verified: claims.email_verified === true,
    display_name: optionalString(claims.name),
    username: optionalString(claims.preferred_username),
    avatar_url: optionalString(claims.picture),
    locale: optionalString(claims.locale),
  };
}

/** Échange le code du widget côté serveur et crée la session applicative. */
export async function createAscenciaSession(input: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<string> {
  const tokens = await requestTokens({
    grant_type: "authorization_code",
    code: input.code,
    code_verifier: input.codeVerifier,
    redirect_uri: input.redirectUri,
  });
  const claims = await verifyAccessToken(tokens.accessToken);
  if (!canAccessAdmin(claims)) {
    throw new Error("Ce compte n’est pas autorisé pour CardMyAnime.");
  }
  const user = await loadUser(tokens.accessToken);

  const id = randomBytes(32).toString("base64url");
  await prisma.ascenciaSession.create({
    data: {
      id,
      accessToken: encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? encrypt(tokens.refreshToken) : null,
      expiresAt: new Date(tokens.expiresAt),
      claims: JSON.stringify(claims),
      profile: JSON.stringify(user),
    },
  });

  return id;
}

export async function readAscenciaSession(
  id: string | null | undefined,
): Promise<AscenciaSession | null> {
  if (!id) return null;

  const stored = await prisma.ascenciaSession.findUnique({ where: { id } });
  if (!stored) return null;

  try {
    const fresh =
      stored.expiresAt.getTime() > Date.now() + 30_000
        ? stored
        : await refreshSessionOnce(stored);
    if (!fresh) return null;
    const claims = JSON.parse(fresh.claims) as AscenciaClaims;
    if (!canAccessAdmin(claims)) {
      await prisma.ascenciaSession.deleteMany({ where: { id } });
      return null;
    }

    return {
      id: fresh.id,
      claims,
      user: JSON.parse(fresh.profile) as AscenciaUser,
    };
  } catch {
    await prisma.ascenciaSession.deleteMany({ where: { id } });
    return null;
  }
}

export async function deleteAscenciaSession(
  id: string | null | undefined,
): Promise<void> {
  if (!id) return;
  await prisma.ascenciaSession.deleteMany({ where: { id } });
}

function refreshSessionOnce(stored: StoredSession): Promise<StoredSession | null> {
  const current = refreshes.get(stored.id);
  if (current) return current;

  const pending = refreshSession(stored);
  const release = () => {
    if (refreshes.get(stored.id) === pending) refreshes.delete(stored.id);
  };
  refreshes.set(stored.id, pending);
  pending.then(release, release);
  return pending;
}

async function refreshSession(
  stored: StoredSession,
): Promise<StoredSession | null> {
  if (!stored.refreshToken) {
    await prisma.ascenciaSession.deleteMany({ where: { id: stored.id } });
    return null;
  }

  const currentRefreshToken = decrypt(stored.refreshToken);
  const tokens = await requestTokens({
    grant_type: "refresh_token",
    refresh_token: currentRefreshToken,
  });
  const claims = await verifyAccessToken(tokens.accessToken);
  if (!canAccessAdmin(claims)) {
    await prisma.ascenciaSession.deleteMany({ where: { id: stored.id } });
    return null;
  }

  const refreshToken = tokens.refreshToken ?? currentRefreshToken;
  return prisma.ascenciaSession.update({
    where: { id: stored.id },
    data: {
      accessToken: encrypt(tokens.accessToken),
      refreshToken: encrypt(refreshToken),
      expiresAt: new Date(tokens.expiresAt),
      claims: JSON.stringify(claims),
    },
  });
}
