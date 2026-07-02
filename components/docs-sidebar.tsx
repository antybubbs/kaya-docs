"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { NavItem } from "@/lib/docs";

export function DocsSidebar({ tree, currentSlug }: { tree: NavItem[]; currentSlug: string }) {
  return (
    <aside className="docs-sidebar" aria-label="Documentation navigation">
      <h2>Docs</h2>
      <ul className="docs-tree">
        {tree.map((node) => (
          <DocsNode key={node.href} node={node} currentSlug={currentSlug} />
        ))}
      </ul>
    </aside>
  );
}

function DocsNode({ node, currentSlug }: { node: NavItem; currentSlug: string }) {
  const isActive = currentSlug === node.slug;
  const isOpen = isActive || currentSlug.startsWith(`${node.slug}/`);
  const hasChildren = node.children.length > 0;

  return (
    <li className={`docs-node ${isActive ? "active" : ""}`}>
      {hasChildren ? (
        <details className="docs-details" open={isOpen}>
          <summary>
            <ChevronDown aria-hidden="true" size={15} />
            <Link href={node.href}>{node.title}</Link>
          </summary>
          <ul>
            {node.children.map((child) => (
              <DocsNode key={child.href} node={child} currentSlug={currentSlug} />
            ))}
          </ul>
        </details>
      ) : (
        <Link href={node.href}>{node.title}</Link>
      )}
    </li>
  );
}
