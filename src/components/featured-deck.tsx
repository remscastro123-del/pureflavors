"use client";

import CardSpread from "@/components/react-bits/card-spread";
import { photo, type Product } from "@/lib/catalog";
import { Card, CardEyebrow, CardMedia, CardTitle } from "@/components/ui/card";

/** The original five-flavor deck: a React Bits card fan on desktop, a swipe row of Cards on phones. */
export function FeaturedDeck({ items }: { items: Product[] }) {
  const cards = items.map((p) => ({
    id: p.id,
    src: photo(p.photos[0]),
    alt: `PURE ${p.name} flavor concentrate`,
    href: `/shop/${p.id}/`,
    title: p.name,
    kicker: p.category,
    color: p.cardColor ?? "#efe7da",
  }));

  return (
    <>
      <div className="hidden h-[520px] md:block">
        <CardSpread cards={cards} cardWidth={250} cardHeight={330} cardRadius={24} radius={900} arc={58} lift={34} shadow={0.22} push={3} />
      </div>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:hidden" aria-label="Featured flavors">
        {items.map((p) => (
          <li key={p.id} className="w-[72%] shrink-0 snap-start">
            <Card variant="plain" style={{ background: p.cardColor ?? "#efe7da" }}>
              <div className="px-4 pt-4">
                <CardEyebrow className="text-ink/70">{p.category}</CardEyebrow>
                <CardTitle size="lg" href={`/shop/${p.id}/`}>
                  {p.name}
                </CardTitle>
              </div>
              <CardMedia src={photo(p.photos[0])} alt={`PURE ${p.name} flavor concentrate`} href={`/shop/${p.id}/`} rounded={false} label={`Explore ${p.name} flavor`} />
              <p className="py-3 text-center text-[14px]">Explore flavor</p>
            </Card>
          </li>
        ))}
      </ul>
    </>
  );
}
