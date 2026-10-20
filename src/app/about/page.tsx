import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import BlurHighlight from "@/components/react-bits/blur-highlight";
import { Reveal } from "@/components/reveal";
import { photo, products } from "@/lib/catalog";
import { PageHero, PageSheet } from "@/components/page-hero";
import { FinalCta } from "@/components/home-sections";

export const metadata: Metadata = pageMeta({
  title: "About PURE",
  description: "PURE brings together a collection of 37 food flavor concentrates, from fruit favorites to creamy, sweet and savory flavors. Rooted in the Philippines.",
  path: "/about/",
});

const story = [
  ["A small beginning.", "A lasting passion."],
  ["Rooted in the Philippines.", ""],
  ["Three decades of", "growing together."],
  ["More possibilities", "in every creation."],
];

export default function AboutPage() {
  const strip = ["mango", "strawberry", "lychee", "chocolate", "vanilla", "matcha"].map((id) => products.find((p) => p.id === id)!).filter(Boolean);
  return (
    <>
      <PageHero eyebrow="About PURE" title={<>A world <span className="text-amber-700">of flavor.</span></>} intro="Food flavor concentrates and baking powders, made in Bulacan for home bakers, cafés and food makers across the Philippines." />
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-2">

      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {story.map(([a, b], i) => (
          <li key={a}>
            <Reveal delay={0.06 * i} className="h-full border-t-2 border-ink pt-5">
              <p className="font-display text-[30px] leading-tight">
                {a}
                {b && (
                  <>
                    <br />
                    <em className="text-amber-700 not-italic">{b}</em>
                  </>
                )}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>

      <div className="mt-20 grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <div className="grid grid-cols-3 gap-3">
          {strip.map((p) => (
            <img key={p.id} src={photo(p.photos[0])} alt={`PURE ${p.name}`} loading="lazy" className="aspect-square w-full rounded-2xl object-cover" />
          ))}
        </div>
        <div className="flex flex-col gap-5 text-[19px] leading-relaxed">
          <BlurHighlight highlightedBits={["37 food flavor concentrates"]} highlightColor="#f4bf6a" className="text-[22px] leading-relaxed sm:text-[26px]" viewportOptions={{ once: true, amount: 0.6 }}>
            PURE brings together a collection of 37 food flavor concentrates, from fruit favorites to creamy, sweet and savory flavors.
          </BlurHighlight>
          <p className="text-ink/80">
            Explore mango, strawberry and lychee alongside chocolate, vanilla, matcha and more. Each flavor has its own place in the collection.
          </p>
          <Button href="/shop/" size="lg" className="self-start">
            Explore the collection
          </Button>
        </div>
      </div>
    </div>
      <FinalCta />
    </>
  );
}
