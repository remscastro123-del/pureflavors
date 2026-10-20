import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { collections, getCollection, productsIn, recipes } from "@/lib/catalog";
import { abs, pageMeta } from "@/lib/seo";
import { money } from "@/lib/utils";
import { RecipeCard } from "@/components/recipe-list";
import { PageHero, PageSheet } from "@/components/page-hero";
import { FinalCta } from "@/components/home-sections";

export const dynamicParams = false;
export function generateStaticParams() {
  return collections.map((c) => ({ slug: c.slug }));
}

/** "mango, lychee, strawberry and 10 more" from the actual products in the collection. */
function nameList(names: string[], show = 3) {
  const lower = names.map((n) => n.toLowerCase());
  if (lower.length <= show) return lower.length > 1 ? `${lower.slice(0, -1).join(", ")} and ${lower.at(-1)}` : lower[0];
  return `${lower.slice(0, show).join(", ")} and ${lower.length - show} more`;
}

function summary(slug: string) {
  const c = getCollection(slug)!;
  const items = productsIn(c);
  const prices = [...new Set(items.map((p) => p.price).filter((x): x is number => x != null))];
  const price = prices.length === 1 ? `${money(prices[0])} each` : null;
  return { c, items, line: `${items.length} products: ${nameList(items.map((p) => p.name))}.${price ? ` ${price}, cash on delivery.` : ""}` };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (!getCollection(slug)) return {};
  const { c, line } = summary(slug);
  return pageMeta({
    title: `${c.title} in the Philippines`,
    description: `${c.intro} ${line}`.slice(0, 300),
    path: `/collections/${c.slug}/`,
    image: `/media/og/collections/${c.slug}.jpg`,
  });
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getCollection(slug)) notFound();
  const { c, items, line } = summary(slug);
  const related = recipes.filter((r) => items.some((p) => p.id === r.productId));

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: c.title,
    description: c.intro,
    url: abs(`/collections/${c.slug}/`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/shop/${p.id}/`), name: `PURE ${p.name}` })),
    },
  };

  return (
    <>
      <PageHero breadcrumbs={<Breadcrumbs items={[{ name: "Shop", path: "/shop/" }, { name: c.title, path: `/collections/${c.slug}/` }]} />} eyebrow="PURE collection" title={c.title} intro={<>{c.intro}<span className="mt-2 block text-[15px]">{line}</span></>} />
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">

      <Tabs
        label="Collections"
        value={c.slug}
        items={collections.map((x) => ({ value: x.slug, label: x.label, href: `/collections/${x.slug}/` }))}
        className="mt-8"
      />

      <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {items.map((p, i) => (
          <ProductCard key={p.id} p={p} priority={i < 4} />
        ))}
      </div>

      {related.length > 0 && (
        <section aria-labelledby="col-recipes" className="mt-20">
          <h2 id="col-recipes" className="font-display mt-2 text-[34px] sm:text-[44px]">
            Recipes from this collection
          </h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <li key={r.id}>
                <RecipeCard r={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16 flex flex-wrap gap-3">
        <Button href="/shop/" variant="secondary">
          See every product
        </Button>
        <Button href="/business/" variant="link">
          Buying for a business? Ask for pricing <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
    </div>
      <FinalCta />
    </>
  );
}
