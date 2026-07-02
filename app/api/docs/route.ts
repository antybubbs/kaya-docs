import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { NextResponse } from "next/server";
import { can, getSession } from "@/lib/auth";
import { contentRoot, getAllDocs, safeContentPath } from "@/lib/docs";

export const dynamic = "force-dynamic";

export function GET() {
  const session = getSession();
  if (!can(session?.role, "editor")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  return NextResponse.json({
    user: session,
    contentRoot,
    pages: getAllDocs().map((doc) => ({
      slug: doc.slug,
      title: doc.frontmatter.title,
      description: doc.frontmatter.description,
      order: doc.frontmatter.order,
      version: doc.frontmatter.version,
      body: doc.body,
      raw: fs.readFileSync(doc.filePath, "utf8")
    }))
  });
}

export async function POST(request: Request) {
  const session = getSession();
  if (!can(session?.role, "editor")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const payload = await request.json();
  const filePath = safeContentPath(payload.slug);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const frontmatter = {
    title: payload.title || "Untitled",
    description: payload.description || "",
    order: Number(payload.order ?? 999),
    version: payload.version || "current"
  };
  const raw = `---\n${yaml.dump(frontmatter, { lineWidth: 100 })}---\n\n${payload.body ?? ""}\n`;
  fs.writeFileSync(filePath, raw, "utf8");
  return NextResponse.json({ ok: true, slug: payload.slug });
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  const session = getSession();
  if (!can(session?.role, "admin")) {
    return NextResponse.json({ error: "Admin role required." }, { status: 403 });
  }
  const { slug } = await request.json();
  const filePath = safeContentPath(slug);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return NextResponse.json({ ok: true });
}
