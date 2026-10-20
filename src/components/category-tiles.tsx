import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { collections, photo, productsIn } from "@/lib/catalog";
import { filterIcons } from "@/lib/filter-icons";
import { cn } from "@/lib/utils";
import { familyColor } from "@/lib/tones";
import { Button } from "@/components/ui/button";

/**
 * Shop by category: one tinted tile per collection, label on the left, a product photo on the right
 * fading into the tint. Colors come from src/lib/tones.ts, the same family colors as the product card tags.
 */

export function CategoryTiles({ className }: { className?: string }) {
  return (
    <section aria-labelledby="cat-title" className={cn("rounded-3xl border border-line bg-white p-4 sm:p-6", className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 id="cat-title" className="font-display text-[26px] leading-tight sm:text-[32px]">
          Shop by category
        </h2>
        <Button href="/collections/" variant="secondary" size="md">
          View all
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((c) => {
          const items = productsIn(c);
          const pick = items[0];
          const Icon = filterIcons[c.label];
          const tone = familyColor(c.label);
          return (
            <li key={c.slug}>
              <Link
                href={`/collections/${c.slug}/`}
                className="group relative flex h-[112px] items-center overflow-hidden rounded-2xl pl-5 transition-shadow hover:shadow-[0_0_0_2px_var(--color-amber-600)]"
                style={{ background: tone.pale, color: tone.deep }}
              >
                <span className="relative z-10 max-w-[55%]">
                  <span className="flex items-center gap-1.5 text-[13px] opacity-85">
                    {Icon && <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />}
                    {items.length} products
                  </span>
                  <span className="mt-0.5 block text-[20px] font-semibold leading-tight">{c.label}</span>
                </span>
                {pick && (
                  <img
                    src={photo(pick.photos[0])}
                    alt=""
                    width={240}
                    height={240}
                    loading="lazy"
                    className="absolute inset-y-0 right-0 h-full w-[48%] object-cover transition duration-500 group-hover:scale-105"
                    style={{ maskImage: "linear-gradient(to right, transparent, #000 35%)", WebkitMaskImage: "linear-gradient(to right, transparent, #000 35%)" }}
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
