import type { MetadataRoute } from "next";
import { collections, photo, products, productsIn, recipes } from "@/lib/catalog";
import { policySlugs } from "@/lib/policies";
import { abs } from "@/lib/seo";

export const dynamic = "force-static";

/** Most recent catalog change, used for pages built from the whole catalog. */
const catalogUpdated = products.reduce((max, p) => (p.updatedAt && p.updatedAt > max ? p.updatedAt : max), "") || "2026-09-16";
// Date of the current site build content (pages, policies, recipes). Update when their copy changes.
const contentUpdated = "2026-10-19";

export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, lastModified: string, images: string[] = []): MetadataRoute.Sitemap[number] => ({
    url: abs(path),
    lastModified,
    ...(images.length ? { images: images.map(abs) } : {}),
  });

  return [
    page("/", contentUpdated, ["/media/og/pure.jpg"]),
    page("/shop/", catalogUpdated),
    page("/collections/", catalogUpdated),
    ...collections.map((c) => {
      const items = productsIn(c);
      const latest = items.reduce((m, p) => (p.updatedAt && p.updatedAt > m ? p.updatedAt : m), "");
      return page(`/collections/${c.slug}/`, latest || catalogUpdated, items.slice(0, 4).map((p) => photo(p.photos[0], "lg")));
    }),
    ...products.map((p) => page(`/shop/${p.id}/`, p.updatedAt ?? catalogUpdated, p.photos.map((x) => photo(x, "lg")))),
    page("/recipes/", contentUpdated),
    ...recipes.map((r) => page(`/recipes/${r.id}/`, contentUpdated, [r.image])),
    page("/about/", contentUpdated),
    page("/contact/", contentUpdated),
    page("/help/", contentUpdated),
    page("/business/", contentUpdated),
    page("/policies/", "2026-09-16"),
    // Policies state "Effective September 16, 2026"
    ...policySlugs.map((s) => page(`/${s}/`, "2026-09-16")),
  ];
}
