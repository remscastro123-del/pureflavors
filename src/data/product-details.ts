/**
 * Content PURE still needs to supply. The live catalog has no bottle size for 37 of 43
 * products and the same placeholder usage text on all of them (see audit/pure-site-audit.html).
 *
 * Fill these in and the product pages, cards and bag pick them up automatically:
 *   size    – e.g. "30 ml". Shown on cards, product page and bag.
 *   dosage  – e.g. "3–5 drops per cup of frosting". Shown as "How much to use".
 *   badge   – short curated label, e.g. "Bestseller". Only use labels that are true.
 *
 * Nothing here is invented: entries stay empty until PURE confirms them.
 */
export const details: Record<string, { size?: string; dosage?: string; badge?: string }> = {
  // mango: { size: "30 ml", dosage: "…", badge: "Bestseller" },
};
