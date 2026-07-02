import { NextResponse } from "next/server";
import { authCookie, makeSession } from "@/lib/auth";
import { getAuthSecret, hasUsers, upsertUser } from "@/lib/user-store";

export async function POST(request: Request) {
  if (hasUsers()) {
    return NextResponse.json({ error: "Setup has already been completed." }, { status: 409 });
  }

  const { username, password } = await request.json();
  try {
    getAuthSecret();
    upsertUser({ username, password, role: "admin" });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(authCookie.name, makeSession(username, "admin"), authCookie.options);
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Setup failed." }, { status: 400 });
  }
}
