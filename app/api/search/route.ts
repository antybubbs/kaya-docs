import { NextResponse } from "next/server";
import { getAllDocs, stripForSearch } from "@/lib/docs";

export const dynamic = "force-dynamic";

export function GET() {
  const results = getAllDocs().map((doc) => ({
    title: doc.frontmatter.title,
    description: doc.frontmatter.description ?? "",
    href: doc.href,
    section: doc.section,
    content: stripForSearch(doc.body)
  }));
  return NextResponse.json({ results });
}
