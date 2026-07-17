import Link from "next/link";
import { SearchBox } from "@/components/search-box";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link className="brand brand-compact" href="/docs/getting-started/welcome-to-kaya" aria-label="Kaya Docs home">
          <img src="/brand/kaya-logo-exact.png" alt="Kaya" />
        </Link>
        <div className="header-tools">
          <SearchBox />
          <nav className="site-nav" aria-label="Main navigation">
            <Link className="nav-link" href="/docs/getting-started/welcome-to-kaya">Docs</Link>
            <Link className="nav-link" href="/docs/user-guide/dashboard">User Guide</Link>
            <Link className="nav-link" href="/docs/developer/architecture">Developer</Link>
            <Link className="nav-link nav-cta" href="/admin">Editor</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
