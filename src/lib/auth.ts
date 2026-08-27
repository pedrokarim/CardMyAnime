import "server-only";

import { cookies } from "next/headers";
import {
  ASCENCIA_SESSION_COOKIE,
  readAscenciaSession,
} from "@/lib/ascencia/session";

/** Session serveur minimale, compatible avec les gardes admin existantes. */
export async function auth() {
  const cookieStore = await cookies();
  const current = await readAscenciaSession(
    cookieStore.get(ASCENCIA_SESSION_COOKIE)?.value,
  );
  if (!current) return null;

  return {
    user: {
      id: current.user.id,
      name: current.user.display_name,
      email: current.user.email,
      image: current.user.avatar_url,
      roles: current.claims.roles ?? [],
      platformRoles: current.claims.prole ?? [],
    },
  };
}
