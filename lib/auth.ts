import { cookies } from "next/headers";
import crypto from "node:crypto";
import { findUser, getAuthSecret, verifyPassword } from "@/lib/user-store";

export type Role = "viewer" | "editor" | "admin";

const cookieName = "kaya_docs_session";
const roleRank: Record<Role, number> = { viewer: 1, editor: 2, admin: 3 };

function secret() {
  return getAuthSecret();
}

function sign(payload: string) {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeSession(username: string, role: Role) {
  const payload = Buffer.from(JSON.stringify({ username, role })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyCredentials(username: string, password: string) {
  const user = findUser(username);
  if (!user || !verifyPassword(password, user.passwordHash)) return null;
  return { username: user.username, role: user.role };
}

export function getSession() {
  const value = cookies().get(cookieName)?.value;
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || sign(payload) !== signature) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { username: string; role: Role };
  } catch {
    return null;
  }
}

export function can(current: Role | undefined, required: Role) {
  return roleRank[current ?? "viewer"] >= roleRank[required];
}

export const authCookie = {
  name: cookieName,
  options: {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.DOCS_COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 8
  }
};
