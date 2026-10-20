import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { HomeHero } from "@/components/home-hero";
import { UseCases } from "@/components/use-cases";
import { IntroSteps } from "@/components/intro-steps";
import { FinalCta, GoesInto, MadeWithPure } from "@/components/home-sections";
import { CategoryTiles } from "@/components/category-tiles";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";
import { products } from "@/lib/catalog";

export const metadata: Metadata = pageMeta({
  title: "PURE — Food flavor concentrates and baking powders | Philippines",
  absoluteTitle: true,
  description:
    "The secret to great taste. 37 food flavor concentrates and 5 bakery powders for cakes, drinks and desserts, from Bulacan. Cash on delivery across the Philippines.",
  path: "/",
});

export default function Home() {
  const featured = ["lychee", "matcha", "mango", "strawberry", "vanilla"].map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  const bakery = products.filter((p) => p.collection === "Bakery");

  return (
    <>
      {/* Rounded off-white sheet holding the hero and the pinned intro (Calendly container shape) */}
      <div className="mx-2 rounded-b-[40px] rounded-t-[28px] bg-[#f6f4ef] pb-3 sm:mx-3 md:pb-0">
        <HomeHero />
        <IntroSteps />
      </div>

      <div className="mx-auto max-w-[1320px] px-4 pt-12 sm:px-6 sm:pt-16 lg:px-8">
        <CategoryTiles />
      </div>

      <section aria-labelledby="featured-title" className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="featured-title" className="font-display text-[40px] leading-tight sm:text-[56px]">
              Find your next favorite.
            </h2>
          </div>
          <Button href="/shop/" variant="secondary" size="lg">
            Shop all products
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </Reveal>
        <div className="mt-8 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {featured.map((p, i) => (
            <ProductCard key={p.id} p={p} priority={i < 2} className={i === 4 ? "max-md:hidden" : undefined} />
          ))}
        </div>
      </section>

      <section aria-labelledby="bakery-title" className="bg-white/45">
        <div className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <Reveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 id="bakery-title" className="font-display text-[40px] leading-tight sm:text-[56px]">
                Your next creation starts here.
              </h2>
              <p className="mt-3 text-[17px] text-ink/80">Discover ube, cocoa, cheese, moringa and baking powder.</p>
            </div>
            <Button href="/shop/?group=Bakery" variant="secondary" size="lg">
              Shop bakery products
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </Reveal>
          <div className="mt-10 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
            {bakery.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>


      <UseCases />

      <section aria-labelledby="biz-title" className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <Reveal>
          <Card variant="brand" radius="xl" className="grid items-center gap-8 p-8 sm:p-12 md:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 id="biz-title" className="font-display text-[34px] leading-tight sm:text-[46px]">
              Run a bakery, café or milk-tea shop?
            </h2>
            <p className="mt-4 max-w-[52ch] text-[17px] text-white/85">
              Order PURE in volume. Tell us what you make and how much you use, and we’ll reply with pack sizes and pricing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button href="/business/" variant="accent" size="lg">
              Ask for business pricing
            </Button>
          </div>
          </Card>
        </Reveal>
      </section>

      <div className="mt-16 sm:mt-24">
        <MadeWithPure />
      </div>
      <GoesInto />
      <FinalCta />
    </>
  );
}
