import { NextResponse } from "next/server";
import { authCookie } from "@/lib/auth";

export function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(authCookie.name);
  return response;
}
