import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  return NextResponse.json(
    session ? { authenticated: true, session } : { authenticated: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
