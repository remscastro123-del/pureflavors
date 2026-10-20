"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ShoppingCart, X } from "lucide-react";
import { useBag } from "@/lib/bag";
import { photo } from "@/lib/catalog";
import { delivery, deliveryFor } from "@/lib/delivery";
import { cn, money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Quantity } from "@/components/ui/quantity";
import { PaymentMark, PaymentMarks } from "@/components/payment-mark";

export function BagDrawer() {
  const { open, setOpen, lines, subtotal, count, setQty, hasPriceOnRequest } = useBag();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const fee = deliveryFor(subtotal);
  const free = delivery.freeDeliveryFrom;
  const close = () => setOpen(false);

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      aria-labelledby="bag-title"
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-[440px] bg-white p-0 text-ink shadow-[0_0_60px_rgb(0_0_0/.25)] backdrop-blur-2xl backdrop-saturate-150 backdrop:bg-black/25 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-black/[.08] px-5 py-4">
          <div>
            <h2 id="bag-title" className="font-display text-[28px]">
              Your cart <span className="text-muted">({count})</span>
            </h2>
          </div>
          <Button variant="secondary" size="icon" onClick={close} aria-label="Close cart">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-4 px-5">
            <p className="font-display text-2xl">Your cart is empty.</p>
            <p className="text-muted">Pick a flavor to get started.</p>
            <Button href="/shop/" onClick={close}>
              Shop flavors
            </Button>
          </div>
        ) : (
          <>
            {free != null && (
              <div className="border-b border-black/[.08] px-5 py-3 text-[14px]">
                <p>{subtotal >= free ? "Free delivery unlocked." : `${money(free - subtotal)} away from free delivery`}</p>
                <progress max={free} value={Math.min(subtotal, free)} className="mt-2 h-1.5 w-full accent-amber-600" />
              </div>
            )}
            <ul className="flex-1 divide-y divide-black/[.08] overflow-y-auto px-5">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id} className="flex gap-4 py-4">
                  <img src={photo(p.photos[0])} alt="" width={84} height={84} className="h-[84px] w-[84px] shrink-0 rounded-[14px] bg-[#f4f6f5] object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <Link href={`/shop/${p.id}/`} onClick={close} className="font-display text-[19px] leading-tight hover:text-amber-700">
                      {p.name}
                    </Link>
                    <p className="text-[13px] text-muted">{[p.size, p.type].filter(Boolean).join(" · ")}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <Quantity value={qty} onChange={(n) => setQty(p.id, n)} name={p.name} min={0} size="sm" />
                      <span className="tabular-nums">{p.price == null ? "Price on request" : money(p.price * qty)}</span>
                    </div>
                    <Button variant="link" size="sm" onClick={() => setQty(p.id, 0)} aria-label={`Remove ${p.name} from cart`} className="min-h-9 self-start text-muted">
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-black/[.08] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">
              <dl className="mb-4 grid grid-cols-[1fr_auto] gap-y-1.5 text-[15px]">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">{money(subtotal)}</dd>
                <dt className="text-muted">Delivery</dt>
                <dd className="text-right text-muted">{fee == null ? "Confirmed before dispatch" : fee === 0 ? "Free" : money(fee)}</dd>
                <dt className="text-muted">Payment</dt>
                <dd className="flex justify-end"><PaymentMarks size="sm" /></dd>
              </dl>
              {hasPriceOnRequest && <p className="mb-3 text-[13px] text-muted">Items marked “Price on request” are quoted by PURE before dispatch.</p>}
              <Button href="/checkout/" onClick={close} size="lg" full>
                Check out · {money(subtotal + (fee ?? 0))}
              </Button>
              <Button variant="link" onClick={close} full className="mt-2 text-muted">
                Continue shopping
              </Button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

/**
 * Pinned checkout bar: appears once the cart has something in it and stays until checkout.
 * It also carries the "added" message, so there's one thing at the bottom of the screen, not two.
 * Hidden on checkout, while the cart drawer is open, and on phones on product pages (the buy bar sits there).
 */
export function CartBar() {
  const { count, subtotal, ready, open, setOpen, toast } = useBag();
  const pathname = usePathname();
  if (!ready || count === 0 || open || pathname.startsWith("/checkout")) return null;
  const onProduct = /^\/shop\/[^/]+\/?$/.test(pathname);
  const fee = deliveryFor(subtotal);

  return (
    <>
      <div aria-hidden className={cn("h-16", onProduct && "max-sm:hidden")} />
      <div className={cn("fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[calc(10px+env(safe-area-inset-bottom))]", onProduct && "max-sm:hidden")}>
        <div className="flex w-full max-w-[420px] items-center gap-2 rounded-full border border-line bg-white py-1 pl-3 pr-1 shadow-[0_6px_24px_-10px_rgb(0_0_0/.3)]">
          <button type="button" onClick={() => setOpen(true)} className="flex min-h-10 min-w-0 flex-1 items-center gap-2.5 text-left" aria-label={`View cart, ${count} item${count === 1 ? "" : "s"}`}>
            <span className="relative shrink-0">
              <ShoppingCart className="h-5 w-5 text-amber-700" aria-hidden />
              <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-amber-600 px-1 text-center text-[10px] font-semibold leading-4 text-white tabular-nums">{count}</span>
            </span>
            <span role="status" aria-live="polite" className="min-w-0 truncate text-[14px]">
              {toast ?? (
                <>
                  <b className="font-semibold tabular-nums">{money(subtotal)}</b>
                  <span className="text-muted">{fee == null ? " + delivery" : fee === 0 ? " · free delivery" : ` + ${money(fee)}`}</span>
                </>
              )}
            </span>
          </button>
          <Button href="/checkout/" size="sm" className="shrink-0">
            Check out
          </Button>
        </div>
      </div>
    </>
  );
}
