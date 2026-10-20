import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Card, CardBody, CardEyebrow, CardMedia, CardText, CardTitle } from "@/components/ui/card";
import { collections, photo, productsIn } from "@/lib/catalog";
import { pageMeta } from "@/lib/seo";
import { PageHero, PageSheet } from "@/components/page-hero";
import { FinalCta } from "@/components/home-sections";

export const metadata: Metadata = pageMeta({
  title: "Flavor collections",
  description: "Browse PURE by collection: fruit, creamy, sweet and drink flavor concentrates, plus bakery powders.",
  path: "/collections/",
});

export default function CollectionsIndex() {
  return (
    <>
      <PageHero breadcrumbs={<Breadcrumbs items={[{ name: "Shop", path: "/shop/" }, { name: "Collections", path: "/collections/" }]} />} eyebrow="Browse by collection" title="Flavor collections" intro="Every PURE flavor and powder, grouped by what it tastes like." />
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => {
          const items = productsIn(c);
          return (
            <li key={c.slug}>
              <Card className="h-full">
                <CardMedia src={photo(items[0]?.photos[0])} alt={`PURE ${c.title.toLowerCase()}`} href={`/collections/${c.slug}/`} rounded={false} label={c.title} />
                <CardBody className="p-6">
                  <CardEyebrow>{items.length} products</CardEyebrow>
                  <CardTitle href={`/collections/${c.slug}/`}>{c.title}</CardTitle>
                  <CardText className="mt-1">{c.intro}</CardText>
                </CardBody>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
      <FinalCta />
    </>
  );
}
