import { NextRequest, NextResponse } from "next/server";
import {
  ASCENCIA_SESSION_COOKIE,
  deleteAscenciaSession,
} from "@/lib/ascencia/session";

export async function GET(request: NextRequest) {
  await deleteAscenciaSession(
    request.cookies.get(ASCENCIA_SESSION_COOKIE)?.value,
  );

  const global = request.nextUrl.searchParams.get("global") === "1";
  const issuer = process.env.ASCENCIA_ISSUER;
  const destination =
    global && issuer
      ? new URL(
          `/oauth/logout?post_logout_redirect_uri=${encodeURIComponent(request.nextUrl.origin)}`,
          issuer,
        )
      : new URL("/", request.nextUrl.origin);
  const response = NextResponse.redirect(destination);
  response.cookies.delete(ASCENCIA_SESSION_COOKIE);
  return response;
}
