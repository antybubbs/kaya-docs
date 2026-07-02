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
  themeColor: "#0d0f13"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="page-shell">
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
