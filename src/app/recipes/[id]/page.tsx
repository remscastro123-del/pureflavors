import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getProduct, recipes, site } from "@/lib/catalog";
import { abs, isoDuration, pageMeta } from "@/lib/seo";
import { PageSheet } from "@/components/page-hero";
import { FinalCta } from "@/components/home-sections";

export const dynamicParams = false;
export function generateStaticParams() {
  return recipes.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const recipe = recipes.find((x) => x.id === id);
  if (!recipe) return {};
  return pageMeta({
    title: `${recipe.title.replace(/^PURE\s+/, "")} recipe`,
    description: `${recipe.summary} ${recipe.time}, makes ${recipe.servings.toLowerCase()}. Made with PURE flavor concentrate.`,
    path: `/recipes/${recipe.id}/`,
    image: `/media/og/recipes/${recipe.id}.jpg`,
    type: "article",
  });
}

export default async function RecipePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = recipes.find((x) => x.id === id);
  if (!r) notFound();
  const product = r.productId ? getProduct(r.productId) : undefined;
  const ingredients = r.ingredients.split("\n").filter(Boolean);
  const steps = r.method.split("\n").filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.title,
    description: r.summary,
    image: abs(r.image),
    url: abs(`/recipes/${r.id}/`),
    recipeCategory: r.category,
    ...(isoDuration(r.time) ? { totalTime: isoDuration(r.time) } : {}),
    keywords: [r.category, product ? `${product.name} flavor` : null, "PURE flavor concentrate"].filter(Boolean).join(", "),
    recipeYield: r.servings,
    recipeIngredient: ingredients,
    recipeInstructions: steps.map((text) => ({ "@type": "HowToStep", text })),
    author: { "@type": "Organization", name: "PURE", url: site.url },
    publisher: { "@type": "Organization", name: "PURE", url: site.url },
    ...(product
      ? { mentions: { "@type": "Product", name: `PURE ${product.name}`, url: abs(`/shop/${product.id}/`) } }
      : {}),
  };

  return (
    <>
    <PageSheet>
    <article>
      <Breadcrumbs items={[{ name: "Recipes", path: "/recipes/" }, { name: r.title, path: `/recipes/${r.id}/` }]} />
      <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <img src={r.image} alt={r.title} className="aspect-[4/5] w-full rounded-3xl object-cover lg:sticky lg:top-24" />
        <div>
          <h1 className="font-display mt-3 text-[44px] leading-[1.02] sm:text-[60px]">{r.title}</h1>
          <p className="mt-4 text-[18px] leading-relaxed text-ink/85">{r.summary}</p>
          <dl className="mt-6 flex gap-8 border-y border-black/[.08] py-4 text-[15px]">
            <div>
              <dt className="text-muted">Time</dt>
              <dd className="font-semibold">{r.time}</dd>
            </div>
            <div>
              <dt className="text-muted">Makes</dt>
              <dd className="font-semibold">{r.servings}</dd>
            </div>
          </dl>

          {product && (
            <Card padding="md" className="mt-8">
              <CardEyebrow className="mb-4 text-amber-700">Shop the flavor in this recipe</CardEyebrow>
              <div className="max-w-[280px]">
                <ProductCard p={product} />
              </div>
            </Card>
          )}

          <h2 className="font-display mt-10 text-[30px]">Ingredients</h2>
          <ul className="mt-4 divide-y divide-black/[.08] border-y border-black/[.08]">
            {ingredients.map((line) => {
              const isPure = /PURE/.test(line);
              return (
                <li key={line} className="py-3 text-[16px]">
                  {isPure && product ? (
                    <Button href={`/shop/${product.id}/`} variant="link" className="min-h-0 whitespace-normal font-semibold text-amber-700">
                      {line}
                    </Button>
                  ) : (
                    line
                  )}
                </li>
              );
            })}
          </ul>

          <h2 className="font-display mt-10 text-[30px]">Method</h2>
          <ol className="mt-4 flex flex-col gap-4">
            {steps.map((s, i) => (
              <li key={s} className="grid grid-cols-[36px_1fr] gap-3 text-[16px] leading-relaxed">
                <span className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-[#9a5214] text-white">{i + 1}</span>
                <span className="pt-1.5">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </article>
    </PageSheet>
      <FinalCta />
    </>
  );
}
