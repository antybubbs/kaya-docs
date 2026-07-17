"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SearchBox } from "@/components/search-box";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={`site-header ${isOpen ? "nav-open" : ""}`}>
      <div className="container header-inner">
        <Link className="brand brand-compact" href="/docs/getting-started/welcome-to-kaya" aria-label="Kaya Docs home">
          <img src="/brand/kaya-logo-exact.png" alt="Kaya" />
        </Link>
        <button
          className="nav-toggle"
          type="button"
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        </button>
        <div className="header-tools" id="site-navigation">
          <SearchBox />
          <nav className="site-nav" aria-label="Main navigation">
            <Link className="nav-link" href="/docs/home/welcome" aria-current={pathname.startsWith("/docs/home/welcome") ? "page" : undefined}>Docs</Link>
            <Link className="nav-link" href="/docs/user-guide/dashboard" aria-current={pathname.startsWith("/docs/user-guide") ? "page" : undefined}>User Guide</Link>
            <Link className="nav-link" href="/docs/developer/architecture" aria-current={pathname.startsWith("/docs/developer") ? "page" : undefined}>Developer</Link>
            <Link className="button button-primary nav-cta" href="/admin">Editor</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
