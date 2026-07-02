import { NextResponse } from "next/server";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { mdxComponents } from "@/components/mdx-components";
import { can, getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = getSession();
  if (!can(session?.role, "editor")) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const { source } = await request.json();
  await compileMDX({
    source: source ?? "",
    components: mdxComponents,
    options: {
      parseFrontmatter: false,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug]
      }
    }
  });
  return NextResponse.json({ ok: true });
}
