import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Kaya Docs",
    template: "%s | Kaya Docs"
  },
  description: "Documentation for Kaya, the self-hosted infrastructure management platform.",
  icons: {
    icon: "/brand/kaya-logo-exact.png",
    apple: "/brand/kaya-logo-exact.png"
  }
};

export const viewport: Viewport = {
  themeColor: "#0b0e13"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <div className="site-canvas" aria-hidden="true" />
        <div className="page-shell">
          <SiteHeader />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
