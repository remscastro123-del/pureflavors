import Link from "next/link";
import { ArrowRight, CakeSlice, Croissant, CupSoda, IceCreamCone, type LucideIcon } from "lucide-react";
import { products, type Product } from "@/lib/catalog";
import { familyColor } from "@/lib/tones";

/**
 * "What are you making?": shop by the thing you're making, not the flavor family.
 * Each card matches products on their `uses` data and links to the shop search for the full list.
 */
const cases: { title: string; text: string; uses: string[]; q: string; Icon: LucideIcon; tone: string }[] = [
  { title: "Milk tea and drinks", text: "Shakes, juices, frappés and coffee", uses: ["milk tea", "drinks", "shakes", "juice", "coffee", "frappe"], q: "drinks", Icon: CupSoda, tone: "Drinks" },
  { title: "Cakes and frosting", text: "Sponges, fillings and buttercream", uses: ["cake", "frosting"], q: "frosting", Icon: CakeSlice, tone: "Sweet" },
  { title: "Ice cream and desserts", text: "Scoops, candies and cold treats", uses: ["ice cream", "candy"], q: "ice cream", Icon: IceCreamCone, tone: "Creamy" },
  { title: "Breads and pastries", text: "Pandesal, ensaymada and bake-shop bakes", uses: ["bread", "pastry"], q: "bread", Icon: Croissant, tone: "Bakery powder" },
];

const pick = (uses: string[]) => {
  const has = (p: Product) => p.uses.some((u) => uses.includes(u.toLowerCase()));
  const list = products.filter(has).sort((a, b) => Number(b.featured) - Number(a.featured) || a.position - b.position);
  return list.slice(0, 4);
};

export function UseCases() {
  return (
    <section aria-labelledby="uses-title" className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <h2 id="uses-title" className="font-display text-[34px] leading-tight sm:text-[48px]">
        What are you making?
      </h2>
      <p className="mt-2 text-[17px] text-muted">Pick what you make and we’ll show the flavors that suit it.</p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cases.map(({ title, text, uses, q, Icon, tone }) => {
          const c = familyColor(tone);
          const top = pick(uses);
          return (
            <li key={title} className="flex flex-col rounded-2xl p-5" style={{ background: c.pale, color: c.deep }}>
              <span className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: c.mid }}>
                <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-4 text-[20px] font-semibold leading-tight">{title}</h3>
              <p className="mt-1 text-[14px]">{text}</p>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {top.map((p) => (
                  <li key={p.id}>
                    <Link href={`/shop/${p.id}/`} className="inline-flex min-h-9 items-center rounded-full bg-white/80 px-3 text-[13px] font-medium hover:bg-white">
                      {p.name.replace(/ (Flavor|Powder)$/i, "")}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={`/shop/?q=${encodeURIComponent(q)}`} className="mt-auto inline-flex min-h-11 items-center gap-1 pt-4 text-[14px] font-semibold underline-offset-4 hover:underline">
                Shop for {title.toLowerCase()}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
