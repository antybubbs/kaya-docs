import type { MDXComponents } from "mdx/types";

type CalloutType = "info" | "warning" | "danger" | "tip";

export function Callout({ type = "info", title, children }: { type?: CalloutType; title?: string; children: React.ReactNode }) {
  return (
    <aside className={`callout callout-${type}`}>
      {title && <strong>{title}</strong>}
      <div>{children}</div>
    </aside>
  );
}

export function Steps({ children }: { children: React.ReactNode }) {
  return <div className="steps">{children}</div>;
}

export function Screenshot({ src, alt, caption }: { src: string; alt: string; caption?: string }) {
  return (
    <figure className="screenshot-block">
      <img src={src} alt={alt} />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

export function FeatureCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="feature-card mdx-feature-card">
      <span className="feature-index">Kaya</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}

export function RelatedPages({ pages }: { pages: Array<{ href: string; title: string; description?: string }> }) {
  return (
    <div className="related-pages">
      {pages.map((page) => (
        <a key={page.href} href={page.href}>
          <strong>{page.title}</strong>
          {page.description && <span>{page.description}</span>}
        </a>
      ))}
    </div>
  );
}

export const mdxComponents: MDXComponents = {
  Callout,
  Steps,
  Screenshot,
  FeatureCard,
  RelatedPages
};
