import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BagProvider } from "@/lib/bag";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BagDrawer, CartBar } from "@/components/bag-drawer";
import { site } from "@/lib/catalog";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "PURE — Food flavor concentrates", template: "%s — PURE" },
  description:
    "PURE food flavor concentrates and baking powders from Bulacan, Philippines. 37 flavors for cakes, drinks and desserts. Cash on delivery.",
  openGraph: { siteName: "PURE", type: "website", locale: "en_PH", images: [{ url: "/media/og/pure.jpg", width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%232b241c'/%3E%3Ctext x='9' y='24' fill='%23ffbf39' font-size='24' font-family='serif'%3EP%3C/text%3E%3C/svg%3E",
  },
};

// The brand's Facebook, Instagram, TikTok and Shopee store URLs go here once PURE confirms them (Organization sameAs).
const sameAs: string[] = [];

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1 };

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PURE",
  legalName: site.company,
  url: site.url,
  logo: `${site.url}/media/pure-logo.svg`,
  address: { "@type": "PostalAddress", streetAddress: "B3 L5 Grand Industrial Estate, Parulan", addressLocality: "Plaridel", addressRegion: "Bulacan", addressCountry: "PH" },
  contactPoint: { "@type": "ContactPoint", telephone: "+63 976 005 2926", contactType: "customer service", availableLanguage: ["en", "fil"] },
  ...(sameAs.length ? { sameAs } : {}),
};

const websiteJsonLd = { "@context": "https://schema.org", "@type": "WebSite", name: "PURE", alternateName: "PURE Flavors", url: site.url, inLanguage: "en-PH" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-PH">
      <body className={`${inter.variable} min-h-dvh antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-cream">
          Skip to content
        </a>
        <BagProvider>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <BagDrawer />
          <CartBar />
        </BagProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
      </body>
    </html>
  );
}
