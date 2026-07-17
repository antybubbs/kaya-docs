import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-intro">
          <Link className="brand footer-brand" href="/docs/getting-started/welcome-to-kaya">
            <img src="/brand/kaya-logo-exact.png" alt="Kaya" />
          </Link>
          <p>Self-hosted infrastructure, documentation, assets, remote access and monitoring for practical operators.</p>
        </div>
        <div>
          <h2>Documentation</h2>
          <Link href="/docs/getting-started/welcome-to-kaya">Getting started</Link>
          <Link href="/docs/user-guide/dashboard">User guide</Link>
          <Link href="/docs/troubleshooting/common-issues">Troubleshooting</Link>
        </div>
        <div>
          <h2>Developers</h2>
          <Link href="/docs/developer/architecture">Architecture</Link>
          <Link href="/docs/developer/api-reference">API reference</Link>
          <Link href="/docs/developer/contributing">Contributing</Link>
        </div>
        <div>
          <h2>Project</h2>
          <a href="https://github.com/antybubbs/kaya-docs" target="_blank" rel="noreferrer">GitHub</a>
          <Link href="/admin">Documentation editor</Link>
          <p>&copy; 2026 Kaya. Self-hosted and open-source.</p>
        </div>
      </div>
    </footer>
  );
}
