import { NextResponse } from "next/server";
import { authCookie, makeSession, verifyCredentials } from "@/lib/auth";
import { hasUsers } from "@/lib/user-store";

export async function POST(request: Request) {
  if (!hasUsers()) {
    return NextResponse.json({ error: "Setup required.", setupRequired: true }, { status: 409 });
  }
  const { username, password } = await request.json();
  const user = verifyCredentials(username, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true, role: user.role });
  response.cookies.set(authCookie.name, makeSession(user.username, user.role), authCookie.options);
  return response;
}
