"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { delivery } from "@/lib/delivery";
import { money } from "@/lib/utils";
import { products, site } from "@/lib/catalog";

/* Popular flavors as shortcuts, so nobody has to pick from 37 at once (Hick's Law). */
const starters = ["ube-powder", "mango", "lychee", "matcha", "strawberry"];

/**
 * One-screen intro: price floor, one primary action, flavor shortcuts and the facts people would otherwise
 * message about. The film is a short muted loop (no scroll scrubbing), off for reduced motion.
 */
export function HeroFilm() {
  const reduce = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const [wide, setWide] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = matchMedia("(min-width: 900px)");
    const set = () => setWide(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const v = video.current;
    if (!v || reduce || wide == null) return;
    v.src = wide ? "/media/flavor-film-hd.mp4" : "/media/flavor-film-mobile.mp4";
    v.play().catch(() => {});
  }, [wide, reduce]);

  const prices = products.map((p) => p.price).filter((n): n is number => n != null);
  const from = Math.min(...prices);
  const chips = starters.map((id) => products.find((p) => p.id === id)).filter((p) => p != null);
  const fee = delivery.flatFee;
  const free = delivery.freeDeliveryFrom;

  const facts: [string, string][] = [
    [`From ${money(from)}`, "per bottle or pack"],
    ["Cash on delivery", "pay when it arrives"],
    fee == null
      ? ["Delivery nationwide", "fee confirmed before dispatch"]
      : [`Delivery ${money(fee)}`, free == null ? "shown in your cart" : `free from ${money(free)}`],
    ["Made in Bulacan", "ships across the Philippines"],
  ];

  return (
    <section aria-labelledby="hero-title" className="border-b border-line">
      <div className="mx-auto grid max-w-[1320px] items-center gap-8 px-4 py-8 sm:px-6 md:py-14 lg:grid-cols-[1.1fr_1fr] lg:px-8">
        <div className="order-2 lg:order-1">
          <p className="eyebrow text-amber-700">Food flavor concentrates</p>
          <h1 id="hero-title" className="font-display mt-3 text-[38px] leading-[1.05] tracking-tight sm:text-[56px] lg:text-[64px]">
            The secret to <span className="text-amber-700">great taste.</span>
          </h1>
          <p className="mt-4 max-w-[44ch] text-[17px] leading-relaxed text-muted">
            From signature drinks to bakery favorites, discover quality flavor concentrates and ingredients to help bring your next food idea to life.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href="/shop/" size="lg">
              Shop flavors
            </Button>
            {site.shopeeUrl && (
              <a href={site.shopeeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[15px] text-muted underline underline-offset-4 hover:text-amber-700">
                Prefer Shopee? Visit our store <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            )}
          </div>
          <div className="mt-6">
            <p className="text-[13px] text-muted">Start with a favorite</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {chips.map((p) => (
                <li key={p.id}>
                  <Link href={`/shop/${p.id}/`} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-[14px] hover:border-amber-600 hover:text-amber-700">
                    {p.name.replace(/ (Flavor|Powder)$/i, "")}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop/" className="inline-flex min-h-10 items-center rounded-full px-3 text-[14px] text-amber-700 underline underline-offset-4">
                  All {products.length} <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="order-1 overflow-hidden rounded-2xl bg-sand lg:order-2">
          <video
            ref={video}
            muted
            loop
            playsInline
            preload="none"
            poster="/media/flavor-poster.jpg"
            aria-label="PURE flavor drops falling into a bowl"
            className="aspect-video w-full object-cover lg:aspect-[4/3]"
          />
        </div>
      </div>

      <dl className="mx-auto grid max-w-[1320px] grid-cols-2 border-t border-line px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {facts.map(([t, s], i) => (
          <div key={t} className={`py-4 pr-4 ${i % 2 ? "pl-4" : "border-r border-line"} ${i > 0 ? "md:pl-4" : ""} ${i < 3 ? "md:border-r md:border-line" : ""}`}>
            <dt className="text-[15px] font-semibold">{t}</dt>
            <dd className="text-[13px] text-muted">{s}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
