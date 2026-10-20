import copy from "@/data/original-copy.json";

// Policy text is copied verbatim from the live site (scraped 2026-10-19) into src/data/original-copy.json.
export const policySlugs = ["privacy", "terms", "shipping", "returns", "affiliate-disclosure"] as const;
export type PolicySlug = (typeof policySlugs)[number];

type Block = { type: "h2" | "p" | "li"; text: string };

export function getPolicy(slug: PolicySlug) {
  const rows = (copy as unknown as Record<string, [string, string][]>)[slug] ?? [];
  const title = rows.find(([t]) => t === "h1")?.[1] ?? slug;
  const h1 = rows.findIndex(([t]) => t === "h1");
  const intro = rows[h1 + 1]?.[1] ?? "";
  const effective = rows[h1 + 2]?.[1] ?? "";
  const body: Block[] = rows
    .slice(h1 + 3)
    .filter(([t, text]) => (t === "h2" || t === "p" || t === "li") && !/^WhatsApp/.test(text))
    .map(([t, text]) => ({ type: t as Block["type"], text }));
  return { title, intro, effective, body };
}

export const policyIndex = [
  { slug: "privacy", title: "Privacy policy", blurb: "How we collect, use, share, and protect customer information." },
  { slug: "terms", title: "Terms of sale", blurb: "The terms that apply to direct purchases from this website." },
  { slug: "shipping", title: "Shipping policy", blurb: "Order processing, delivery fees, timing, and tracking." },
  { slug: "returns", title: "Returns & refunds", blurb: "How to report damaged, incorrect, missing, or defective items." },
  { slug: "affiliate-disclosure", title: "Affiliate disclosure", blurb: "How selected links to third-party marketplaces work." },
];
