import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardEyebrow, CardMedia, CardText, CardTitle } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { collectionOf, familyLabel, getProduct, photo, products, recipesFor, related, site } from "@/lib/catalog";
import { delivery } from "@/lib/delivery";
import { abs, pageMeta } from "@/lib/seo";
import { money } from "@/lib/utils";
import { PageSheet } from "@/components/page-hero";

export const dynamicParams = false;
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const p = getProduct((await params).id);
  if (!p) return {};
  const what = p.collection === "Flavor" ? `${p.name} flavor concentrate` : p.name;
  const sized = p.size ? `${what} ${p.size}` : what;
  return pageMeta({
    title: sized.charAt(0).toUpperCase() + sized.slice(1),
    description: `${p.description} PURE ${what}${p.price != null ? `, ${money(p.price)}` : ""}. Cash on delivery in the Philippines.`,
    path: `/shop/${p.id}/`,
    image: `/media/og/products/${p.id}.jpg`,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const p = getProduct((await params).id);
  if (!p) notFound();
  const recs = recipesFor(p.id);
  const more = related(p);
  const crumb = p.collection === "Flavor" ? familyLabel(p.category) : p.collection === "Bakery" ? "Bakery powders" : p.collection;

  const col = collectionOf(p);
  const fee = delivery.flatFee;
  const url = abs(`/shop/${p.id}/`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: `PURE ${p.name}`,
    description: p.description,
    url,
    image: p.photos.map((x) => abs(photo(x, "lg"))),
    brand: { "@type": "Brand", name: "PURE" },
    manufacturer: { "@type": "Organization", name: site.company },
    category: p.collection === "Flavor" ? "Food flavor concentrate" : p.type,
    ...(p.size ? { size: p.size } : {}),
    ...(p.price != null
      ? {
          offers: {
            "@type": "Offer",
            url,
            price: (p.price / 100).toFixed(2),
            priceCurrency: "PHP",
            availability: p.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: "PURE" },
            // Ships within the Philippines. The rate is added automatically once delivery.flatFee is set.
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingDestination: { "@type": "DefinedRegion", addressCountry: "PH" },
              ...(fee != null ? { shippingRate: { "@type": "MonetaryAmount", value: (fee / 100).toFixed(2), currency: "PHP" } } : {}),
            },
            // From /returns/: damaged, incorrect, missing or defective items are reported on WhatsApp. No fixed window is published.
            hasMerchantReturnPolicy: {
              "@type": "MerchantReturnPolicy",
              applicableCountry: "PH",
              returnPolicyCategory: "https://schema.org/MerchantReturnUnspecified",
              merchantReturnLink: abs("/returns/"),
            },
          },
        }
      : {}),
  };

  return (
    <>
    <PageSheet>
      <Breadcrumbs
        items={[
          { name: "Shop", path: "/shop/" },
          ...(col ? [{ name: col.title, path: `/collections/${col.slug}/` }] : []),
          { name: p.name, path: `/shop/${p.id}/` },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        <ProductGallery photos={p.photos} name={p.name} />

        <div className="flex flex-col">
          <h1 className="font-display mt-3 text-[48px] leading-none sm:text-[64px]">{p.name}</h1>
          <p className="mt-3 text-[16px] text-muted">{[p.type, p.size].filter(Boolean).join(" · ")}</p>
          <p className="mt-5 text-[30px] tabular-nums">{p.price == null ? "" : `₱${(p.price / 100).toFixed(2)}`}</p>
          <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-ink/85">{p.description}</p>

          <div className="mt-7">
            <BuyBox p={p} />
          </div>

          <div className="mt-8 divide-y divide-black/[.08] border-y border-black/[.08]">
            {[
              p.dosage ? ["How much to use", p.dosage] : null,
              ["Suggested use", p.usage],
              ["Ingredients & allergens", p.ingredients],
              ["Storage", p.storage],
            ]
              .filter((x): x is string[] => x !== null)
              .map(([h, body], i) => (
                <details key={h} open={i === 0} className="group py-1">
                  <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between text-[17px] font-semibold">
                    {h}
                    <span aria-hidden className="text-xl text-muted transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="pb-5 text-[16px] leading-relaxed text-ink/80">{body}</p>
                </details>
              ))}
          </div>
          {p.shopeeUrl && (
            <Button href={p.shopeeUrl} variant="link" target="_blank" rel="sponsored noopener noreferrer" className="mt-5 self-start">
              Also available on Shopee <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </PageSheet>
    <div className="mx-auto max-w-[1320px] px-4 pb-28 sm:px-6 sm:pb-10 lg:px-8">
      {recs.length > 0 && (
        <section aria-labelledby="recipes-with" className="mt-20">
          <h2 id="recipes-with" className="font-display mt-2 text-[34px] sm:text-[44px]">Recipes with {p.name}</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2">
            {recs.map((r) => (
              <li key={r.id}>
                <Card padding="sm" className="grid grid-cols-[120px_1fr] items-center gap-5 sm:grid-cols-[160px_1fr]">
                  <CardMedia src={r.image} alt="" ratio="1/1" href={`/recipes/${r.id}/`} label={r.title} />
                  <CardBody>
                    <CardEyebrow>{r.category} · {r.time}</CardEyebrow>
                    <CardTitle href={`/recipes/${r.id}/`}>{r.title}</CardTitle>
                    <CardText>{r.summary}</CardText>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {more.length > 0 && (
        <section aria-labelledby="more" className="mt-20">
          <h2 id="more" className="font-display text-[34px] sm:text-[44px]">{p.collection === "Flavor" ? `More ${crumb.toLowerCase()} flavors` : `More ${crumb.toLowerCase()}`}</h2>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-4">
            {more.map((x) => (
              <ProductCard key={x.id} p={x} />
            ))}
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
    </>
  );
}
