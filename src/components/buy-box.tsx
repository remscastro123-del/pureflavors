"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBag } from "@/lib/bag";
import { site, type Product } from "@/lib/catalog";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Quantity } from "@/components/ui/quantity";
import { TrustBadges } from "@/components/trust-badges";
import { flyToCart } from "@/lib/fly-to-cart";

/**
 * Price, quantity, Add to cart and Buy now kept together (Proximity). Buy now is the Shopee/Lazada habit
 * PH shoppers look for (Jakob's Law). On phones both actions sit in a sticky bar (Fitts's Law).
 */
export function BuyBox({ p }: { p: Product }) {
  const { add } = useBag();
  const router = useRouter();
  const [qty, setQty] = useState(1);

  if (p.price == null) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[22px]">Price on request</p>
        <Button href={site.whatsappUrl} size="lg" full>
          Ask PURE on WhatsApp
        </Button>
      </div>
    );
  }

  const out = p.stock === 0;
  const buyNow = () => {
    add(p.id, qty);
    router.push("/checkout/");
  };
  const quantity = <Quantity value={qty} onChange={(n) => setQty(Math.min(99, Math.max(1, n)))} />;
  const addBtn = (
    <Button
      onClick={(e) => {
        add(p.id, qty);
        flyToCart(document.querySelector("main img") ?? e.currentTarget);
      }}
      disabled={out}
      size="lg"
      className="flex-1"
    >
      {out ? "Out of stock" : "Add to cart"}
    </Button>
  );
  const buyBtn = (
    <Button onClick={buyNow} disabled={out} variant="secondary" size="lg" className="flex-1">
      Buy now
    </Button>
  );

  return (
    <>
      {/* Desktop and tablet */}
      <div className="hidden flex-col gap-3 sm:flex">
        <div className="flex items-center gap-3">
          {quantity}
          {addBtn}
        </div>
        <div className="flex">{buyBtn}</div>
        <p className="text-[14px] text-muted tabular-nums">Total for {qty}: {money(p.price * qty)}</p>
      </div>

      {/* Phones: quantity in the page, both actions in a sticky bar */}
      <div className="flex items-center gap-3 sm:hidden">
        {quantity}
        <span className="text-[14px] text-muted tabular-nums">Total {money(p.price * qty)}</span>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-black/[.06] bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl backdrop-saturate-150 sm:hidden">
        {buyBtn}
        {addBtn}
      </div>

      <TrustBadges className="mt-6" />
    </>
  );
}
