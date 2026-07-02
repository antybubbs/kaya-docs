import { NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { deleteUser, listUsers, upsertUser } from "@/lib/user-store";

export const dynamic = "force-dynamic";

export function GET() {
  const session = getSession();
  if (!can(session?.role, "admin")) {
    return NextResponse.json({ error: "Admin role required." }, { status: 403 });
  }
  return NextResponse.json({ users: listUsers() });
}

export async function POST(request: Request) {
  const session = getSession();
  if (!can(session?.role, "admin")) {
    return NextResponse.json({ error: "Admin role required." }, { status: 403 });
  }
  const payload = await request.json();
  try {
    upsertUser({ username: payload.username, password: payload.password || undefined, role: payload.role });
    return NextResponse.json({ ok: true, users: listUsers() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save user." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = getSession();
  if (!can(session?.role, "admin")) {
    return NextResponse.json({ error: "Admin role required." }, { status: 403 });
  }
  const { username } = await request.json();
  if (username === session?.username) {
    return NextResponse.json({ error: "You cannot delete your own signed-in account." }, { status: 400 });
  }
  try {
    deleteUser(username);
    return NextResponse.json({ ok: true, users: listUsers() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete user." }, { status: 400 });
  }
}
