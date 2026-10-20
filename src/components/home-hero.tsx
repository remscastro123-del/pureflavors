import Link from "next/link";
import { ArrowUpRight, Banknote, MapPin, Truck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { photo, products, site } from "@/lib/catalog";
import { delivery } from "@/lib/delivery";
import { colorFor, familyColor } from "@/lib/tones";
import { money } from "@/lib/utils";
import { PaymentMark, PaymentMarks } from "@/components/payment-mark";

/* Popular flavors as shortcuts, so nobody has to pick from 37 at once (Hick's Law). */
const starters = ["mango", "ube-powder", "matcha", "strawberry", "lychee"];

/**
 * Homepage hero, Calendly-style: centred headline, one primary action and flavor shortcuts, sitting at the top of
 * a rounded off-white sheet. The pinned three-step intro (IntroSteps) follows inside the same sheet.
 */
export function HomeHero() {
  const chips = starters.map((id) => products.find((p) => p.id === id)).filter((p) => p != null);

  return (
    <section aria-labelledby="hero-title" className="mx-auto max-w-[920px] px-4 pb-10 pt-12 text-center sm:px-6 md:pt-20">
      <h1 id="hero-title" className="font-display text-[44px] leading-[1.02] tracking-tight sm:text-[64px] lg:text-[76px]">
        The secret to <span className="text-amber-700">great taste.</span>
      </h1>
      <p className="mx-auto mt-5 max-w-[52ch] text-[17px] leading-relaxed text-muted sm:text-[18px]">
        From signature drinks to bakery favorites, discover quality flavor concentrates and ingredients to help bring your next food idea to life.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <Button href="/shop/" size="lg">
          Shop flavors
        </Button>
        {site.shopeeUrl && (
          <a href={site.shopeeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-[15px] text-muted underline underline-offset-4 hover:text-amber-700">
            Prefer Shopee? Visit our store
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        )}
      </div>
      <ul className="mx-auto mt-8 grid max-w-[760px] grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5" aria-label="Start with a favorite">
        {chips.map((p, i) => {
          const c = colorFor(p);
          return (
            <li key={p.id} className={i === 4 ? "max-sm:hidden" : undefined}>
              <Link
                href={`/shop/${p.id}/`}
                className="flex items-center gap-2.5 rounded-2xl bg-white p-1.5 pr-3 text-left shadow-[0_6px_18px_-12px_rgb(0_0_0/.35)] ring-1 ring-black/[.05] transition-transform hover:-translate-y-0.5"
              >
                <span className="shrink-0 overflow-hidden rounded-xl" style={{ background: c.pale }}>
                  <img src={photo(p.photos[0])} alt="" width={44} height={44} className="h-11 w-11 object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold leading-tight">{p.name.replace(/ (Flavor|Powder)$/i, "")}</span>
                  <span className="mt-0.5 block text-[12px] font-medium tabular-nums text-amber-700">{money(p.price)}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Four facts shoppers check before buying, each with an icon on a pale family ground. */
export function TrustStrip() {
  const fee = delivery.flatFee;
  const items = [
    { Icon: Banknote, title: "Cash on delivery", text: "Pay the courier when it arrives", tone: "Drinks" },
    { Icon: Wallet, title: "GCash and Maya", text: <PaymentMarks methods={["gcash", "maya"]} size="sm" className="mt-1" />, tone: "Bakery powder" },
    { Icon: Truck, title: fee == null ? "Delivery nationwide" : `Delivery ${money(fee)}`, text: fee == null ? "Fee confirmed before dispatch" : "Shown in your cart", tone: "Fruit" },
    { Icon: MapPin, title: "Made in Bulacan", text: "Ships across the Philippines", tone: "Creamy" },
  ];
  return (
    <section aria-label="Why order from PURE" className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <ul className="grid grid-cols-2 gap-2 rounded-2xl border border-line p-2 sm:gap-3 lg:grid-cols-4">
        {items.map(({ Icon, title, text, tone }) => {
          const c = familyColor(tone);
          return (
            <li key={title} className="flex items-center gap-3 rounded-xl p-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full" style={{ background: c.pale, color: c.deep }}>
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0">
                <b className="block text-[15px] font-semibold leading-tight">{title}</b>
                <span className="block text-[13px] text-muted">{text}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
