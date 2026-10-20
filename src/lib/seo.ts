import type { Metadata } from "next";
import { site } from "@/lib/catalog";

/**
 * One place that builds page metadata, so every page gets the same set:
 * title, description, canonical, Open Graph (title, description, url, image) and Twitter card.
 */
export function pageMeta({
  title,
  description,
  path,
  image = "/media/og/pure.jpg",
  absoluteTitle = false,
  type = "website",
  noindex = false,
}: {
  title: string;
  description: string;
  /** Path with trailing slash, e.g. "/shop/mango/" */
  path: string;
  /** Path to a 1200×630 share image */
  image?: string;
  /** Use the title as-is instead of "Title — PURE" */
  absoluteTitle?: boolean;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} — PURE`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: "PURE",
      locale: "en_PH",
      type,
      images: [{ url: image, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export const abs = (path: string) => `${site.url}${path}`;

/** JSON-LD BreadcrumbList from visible breadcrumb items. */
export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.path) })),
  };
}

/** "5 minutes" → PT5M, "Chill 4+ hours" → PT4H. Returns undefined when no duration is found. */
export function isoDuration(text: string) {
  const m = text.match(/(\d+(?:\.\d+)?)\s*\+?\s*(minute|min|hour|hr)/i);
  if (!m) return undefined;
  return /^h/i.test(m[2]) ? `PT${m[1]}H` : `PT${m[1]}M`;
}
