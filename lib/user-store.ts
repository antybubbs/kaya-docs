import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Role } from "@/lib/auth";

export type StoredUser = {
  username: string;
  passwordHash: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
};

type UserStore = {
  users: StoredUser[];
};

export const dataRoot = path.resolve(process.env.DOCS_DATA_DIR ?? path.join(process.cwd(), "data"));
const usersPath = path.join(dataRoot, "users.json");
const secretPath = path.join(dataRoot, "auth-secret");

function ensureDataRoot() {
  fs.mkdirSync(dataRoot, { recursive: true });
}

function readStore(): UserStore {
  ensureDataRoot();
  if (!fs.existsSync(usersPath)) return { users: [] };
  try {
    return JSON.parse(fs.readFileSync(usersPath, "utf8")) as UserStore;
  } catch {
    return { users: [] };
  }
}

function writeStore(store: UserStore) {
  ensureDataRoot();
  fs.writeFileSync(usersPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export function getAuthSecret() {
  ensureDataRoot();
  if (process.env.DOCS_AUTH_SECRET) return process.env.DOCS_AUTH_SECRET;
  if (fs.existsSync(secretPath)) return fs.readFileSync(secretPath, "utf8").trim();
  const secret = crypto.randomBytes(48).toString("base64url");
  fs.writeFileSync(secretPath, `${secret}\n`, { encoding: "utf8", mode: 0o600 });
  return secret;
}

export function hasUsers() {
  return readStore().users.length > 0;
}

export function listUsers() {
  return readStore().users
    .map(({ username, role, createdAt, updatedAt }) => ({ username, role, createdAt, updatedAt }))
    .sort((a, b) => a.username.localeCompare(b.username));
}

export function findUser(username: string) {
  return readStore().users.find((user) => user.username.toLowerCase() === username.toLowerCase()) ?? null;
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("base64url")) {
  const hash = crypto.pbkdf2Sync(password, salt, 210000, 32, "sha256").toString("base64url");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export function upsertUser(input: { username: string; password?: string; role: Role }) {
  const username = input.username.trim();
  if (!/^[a-zA-Z0-9._-]{3,64}$/.test(username)) {
    throw new Error("Usernames must be 3-64 characters and may contain letters, numbers, dots, dashes and underscores.");
  }
  if (!["viewer", "editor", "admin"].includes(input.role)) {
    throw new Error("Invalid role.");
  }

  const store = readStore();
  const now = new Date().toISOString();
  const existing = store.users.find((user) => user.username.toLowerCase() === username.toLowerCase());

  if (existing) {
    existing.role = input.role;
    existing.updatedAt = now;
    if (input.password) existing.passwordHash = hashPassword(input.password);
  } else {
    if (!input.password || input.password.length < 10) {
      throw new Error("New users need a password of at least 10 characters.");
    }
    store.users.push({
      username,
      role: input.role,
      passwordHash: hashPassword(input.password),
      createdAt: now,
      updatedAt: now
    });
  }

  writeStore(store);
}

export function deleteUser(username: string) {
  const store = readStore();
  const target = store.users.find((user) => user.username.toLowerCase() === username.toLowerCase());
  if (!target) return;
  if (target.role === "admin" && store.users.filter((user) => user.role === "admin").length <= 1) {
    throw new Error("At least one admin user is required.");
  }
  writeStore({ users: store.users.filter((user) => user.username.toLowerCase() !== username.toLowerCase()) });
}
