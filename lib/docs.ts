import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Frontmatter = {
  title: string;
  description?: string;
  order?: number;
  version?: string;
};

export type DocPage = {
  slug: string;
  href: string;
  filePath: string;
  frontmatter: Frontmatter;
  body: string;
  section: string;
};

export type NavItem = {
  title: string;
  slug: string;
  href: string;
  order: number;
  children: NavItem[];
};

export const contentRoot = path.resolve(process.env.DOCS_CONTENT_DIR ?? path.join(process.cwd(), "content"));

const sectionTitles: Record<string, string> = {
  home: "Home",
  "getting-started": "Getting Started",
  "user-guide": "User Guide",
  administration: "Administration",
  developer: "Developer Documentation",
  troubleshooting: "Troubleshooting"
};

export function slugToTitle(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function walkMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMdx(fullPath);
    return entry.isFile() && entry.name.endsWith(".mdx") ? [fullPath] : [];
  });
}

export function getAllDocs(): DocPage[] {
  return walkMdx(contentRoot).map((filePath) => {
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const relative = path.relative(contentRoot, filePath).replace(/\\/g, "/");
    const slug = relative.replace(/\.mdx$/, "");
    const [sectionSlug] = slug.split("/");
    const frontmatter = parsed.data as Frontmatter;

    return {
      slug,
      href: `/docs/${slug}`,
      filePath,
      section: sectionTitles[sectionSlug] ?? slugToTitle(sectionSlug),
      frontmatter: {
        title: frontmatter.title ?? slugToTitle(path.basename(slug)),
        description: frontmatter.description ?? "",
        order: Number(frontmatter.order ?? 999),
        version: frontmatter.version ?? "current"
      },
      body: parsed.content.trim()
    };
  }).sort((a, b) => {
    if (a.slug.split("/")[0] !== b.slug.split("/")[0]) {
      return sectionOrder(a.slug.split("/")[0]) - sectionOrder(b.slug.split("/")[0]);
    }
    return (a.frontmatter.order ?? 999) - (b.frontmatter.order ?? 999) || a.frontmatter.title.localeCompare(b.frontmatter.title);
  });
}

function sectionOrder(section: string) {
  const order = ["home", "getting-started", "user-guide", "administration", "developer", "troubleshooting"].indexOf(section);
  return order === -1 ? Number.MAX_SAFE_INTEGER : order;
}

export function getDocBySlug(slugParts: string[] = []) {
  const slug = slugParts.join("/") || "getting-started/installation";
  return getAllDocs().find((doc) => doc.slug === slug);
}

export function getNavTree(): NavItem[] {
  const groups = new Map<string, NavItem>();
  for (const page of getAllDocs()) {
    const [sectionSlug] = page.slug.split("/");
    if (!groups.has(sectionSlug)) {
      groups.set(sectionSlug, {
        title: sectionTitles[sectionSlug] ?? slugToTitle(sectionSlug),
        slug: sectionSlug,
        href: `/docs/${page.slug}`,
        order: sectionOrder(sectionSlug),
        children: []
      });
    }
    groups.get(sectionSlug)!.children.push({
      title: page.frontmatter.title,
      slug: page.slug,
      href: page.href,
      order: page.frontmatter.order ?? 999,
      children: []
    });
  }

  return Array.from(groups.values())
    .map((group) => ({ ...group, children: group.children.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title)) }))
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

export function stripForSearch(source: string) {
  return source
    .replace(/^---[\s\S]*?---/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[`*_#[\](){}>|~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function safeContentPath(slug: string) {
  const normalized = slug.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.mdx$/, "");
  if (!/^[a-z0-9][a-z0-9/-]*$/.test(normalized) || normalized.includes("..")) {
    throw new Error("Invalid documentation slug.");
  }
  const filePath = path.resolve(contentRoot, `${normalized}.mdx`);
  if (!filePath.startsWith(contentRoot)) {
    throw new Error("Documentation path escapes content root.");
  }
  return filePath;
}
