import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { DocsSidebar } from "@/components/docs-sidebar";
import { mdxComponents } from "@/components/mdx-components";
import { getAllDocs, getDocBySlug, getNavTree } from "@/lib/docs";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug.split("/") }));
}

export function generateMetadata({ params }: { params: { slug?: string[] } }) {
  const doc = getDocBySlug(params.slug);
  if (!doc) return {};
  return {
    title: doc.frontmatter.title,
    description: doc.frontmatter.description
  };
}

export default function DocsPage({ params }: { params: { slug?: string[] } }) {
  const doc = getDocBySlug(params.slug);
  if (!doc) notFound();

  return (
    <section className="content container docs-layout">
      <DocsSidebar tree={getNavTree()} currentSlug={doc.slug} />
      <article className="page-content docs-content">
        <header className="page-header">
          <p className="eyebrow">{doc.section}</p>
          <h1>{doc.frontmatter.title}</h1>
          {doc.frontmatter.description && <p className="lede">{doc.frontmatter.description}</p>}
        </header>
        <div className="markdown-body">
          <MDXRemote
            source={doc.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: "wrap" }]]
              }
            }}
          />
        </div>
      </article>
    </section>
  );
}
