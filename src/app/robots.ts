import type { MetadataRoute } from "next";
import { site } from "@/lib/catalog";

export const dynamic = "force-static";

/**
 * Everything is crawlable. Pages that shouldn't appear in search (checkout, style guide) carry
 * <meta name="robots" content="noindex"> instead. Blocking them here would stop Google from ever
 * seeing that noindex, and a linked URL could still be indexed without content.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
