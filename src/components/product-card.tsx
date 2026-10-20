"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, ShoppingCartPlus, Sparkles } from "lucide-react";
import { useBag } from "@/lib/bag";
import { photo, type Product } from "@/lib/catalog";
import { filterIcons } from "@/lib/filter-icons";
import { colorFor, familyOf } from "@/lib/tones";
import { cn, money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import hoverPhotoIds from "@/data/hover-photos.json";
import { flyToCart } from "@/lib/fly-to-cart";

/** Products with a pre-aligned hover photo (public/media/products/*-hover-sm.webp). */
const hoverIds = new Set<string>(hoverPhotoIds);

/**
 * Product card scale. One component, four sizes, same parts in the same order:
 * tag(s) above, name on the left, price on the right, then the action.
 *
 *   lg   – feature: photo left, description and uses, full actions. Hero picks, "start here".
 *   md   – grid (default): shop, collections, home, related products.
 *   row  – list row: search results, recipes ("made with"), narrow sidebars. Icon-only cart button.
 *   mini – thumbnail line: cart drawer, order summary, suggestions. No action.
 *
 * Cards are white, like Shopee and Lazada: square photo, the name as the main text, price in green. The family
 * color (src/lib/tones.ts) appears only on the tag.
 */
export type ProductCardSize = "lg" | "md" | "row" | "mini";

export function ProductTag({ p, fill, color, className }: { p: Product; fill?: string; color?: string; className?: string }) {
  const label = familyOf(p);
  const Icon = filterIcons[label] ?? filterIcons[p.collection];
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-current", className)}
      style={{ background: fill, color }}
    >
      {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />}
      {label}
    </span>
  );
}

function Badge({ p }: { p: Product }) {
  const badge = p.badge;
  if (!badge) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-600 px-2.5 py-1 text-[12px] font-semibold text-white">
      <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
      {badge}
    </span>
  );
}

/** Shopee as a small badge with the tags, not a text line. Links straight to the listing. */
function ShopeeBadge({ p }: { p: Product }) {
  if (!p.shopeeUrl) return null;
  return (
    <a
      href={p.shopeeUrl}
      target="_blank"
      rel="sponsored noopener noreferrer"
      aria-label={`${p.name} on Shopee (opens in a new tab)`}
      className="inline-flex items-center gap-1 rounded-full bg-[#ee4d2d] px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-[#d73211]"
    >
      <ShoppingBag className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
      Shopee
    </a>
  );
}

function Price({ p, className }: { p: Product; className?: string }) {
  return <span className={cn("shrink-0 text-right font-semibold tabular-nums", className)}>{p.price == null ? "Ask" : money(p.price)}</span>;
}

function CartAction({ p, size, dark = false }: { p: Product; size: "sm" | "md" | "icon"; dark?: boolean }) {
  const { add } = useBag();
  const router = useRouter();
  const href = `/shop/${p.id}/`;
  const out = p.stock === 0;
  if (p.price == null) {
    return size === "icon" ? (
      <Button href={href} variant={dark ? "inverse" : "secondary"} size="icon" aria-label={`Ask about ${p.name}`} className="shrink-0">
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    ) : (
      <Button href={href} variant={dark ? "inverse" : "secondary"} size={size} full>
        Ask about this item
      </Button>
    );
  }
  const addButton = (
    <Button
      onClick={(e) => {
        add(p.id);
        flyToCart(e.currentTarget.closest("article") ?? e.currentTarget);
      }}
      disabled={out}
      variant={size === "icon" ? (dark ? "inverse" : "primary") : dark ? "inverse-outline" : "secondary"}
      size={size === "md" ? "icon-lg" : "icon"}
      aria-label={out ? `${p.name} is out of stock` : `Add ${p.name} to cart`}
      className="shrink-0"
    >
      <ShoppingCartPlus className={size === "md" ? "h-5 w-5" : "h-[18px] w-[18px]"} aria-hidden />
    </Button>
  );
  if (size === "icon") return addButton;
  // Split CTA, the Shopee pattern: add (outlined icon) next to Buy now (filled), which adds and goes to checkout.
  return (
    <div className="flex gap-2">
      {addButton}
      <Button
        onClick={() => {
          add(p.id);
          router.push("/checkout/");
        }}
        disabled={out}
        variant={dark ? "inverse" : "primary"}
        size={size}
        full
        className={cn("min-w-0", dark && "font-semibold")}
      >
        {out ? "Out of stock" : "Buy now"}
      </Button>
    </div>
  );
}

export function ProductCard({
  p,
  size = "md",
  priority = false,
  className,
}: {
  p: Product;
  size?: ProductCardSize;
  priority?: boolean;
  className?: string;
}) {
  const href = `/shop/${p.id}/`;
  const c = colorFor(p);
  const img = (cls: string, w: number) => (
    <img
      src={photo(p.photos[0])}
      alt={`PURE ${p.name}`}
      width={w}
      height={w}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={cn("object-cover", cls)}
    />
  );

  if (size === "mini") {
    return (
      <Link href={href} className={cn("flex min-w-0 items-center gap-3 rounded-xl p-1.5 hover:bg-sand", className)}>
        <span className="shrink-0 overflow-hidden rounded-lg bg-sand">
          {img("h-12 w-12", 96)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-medium">{p.name}</span>
          <span className="block text-[12px] text-muted">{familyOf(p)}</span>
        </span>
        <Price p={p} className="text-[14px]" />
      </Link>
    );
  }

  if (size === "row") {
    return (
      <article className={cn("flex min-w-0 items-center gap-3 rounded-2xl border border-line bg-white p-2 pr-3", className)}>
        <Link href={href} className="shrink-0 overflow-hidden rounded-xl bg-sand" tabIndex={-1} aria-hidden>
          {img("h-20 w-20", 160)}
        </Link>
        <div className="min-w-0 flex-1">
          <span className="flex flex-wrap gap-1">
            <ProductTag p={p} fill={c.pale} color={c.deep} className="px-2 py-0.5 text-[11px]" />
            <ShopeeBadge p={p} />
          </span>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <h3 className="min-w-0 truncate text-[16px] font-semibold">
              <Link href={href} className="underline-offset-4 hover:underline">
                {p.name}
              </Link>
            </h3>
            <Price p={p} className="text-[15px] text-amber-700" />
          </div>
        </div>
        <CartAction p={p} size="icon" />
      </article>
    );
  }

  if (size === "lg") {
    return (
      <article className={cn("grid min-w-0 overflow-hidden rounded-3xl border border-line bg-white sm:grid-cols-[1fr_1.1fr]", className)}>
        <Link href={href} className="relative m-2 block overflow-hidden rounded-2xl bg-sand sm:mr-0">
          {img("aspect-square h-full w-full", 720)}
        </Link>
        <div className="flex flex-col p-5 sm:p-7">
          <div className="flex flex-wrap gap-1.5">
            <ProductTag p={p} fill={c.pale} color={c.deep} />
            <Badge p={p} />
            <ShopeeBadge p={p} />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <h3 className="font-display text-[26px] leading-tight sm:text-[30px]">
              <Link href={href} className="underline-offset-4 hover:underline">
                {p.name}
              </Link>
            </h3>
            <Price p={p} className="text-[22px] text-amber-700" />
          </div>
          {p.size && <p className="mt-1 text-[14px] text-muted">{p.size}</p>}
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{p.description}</p>
          {p.uses.length > 0 && (
            <>
              <p className="mt-4 text-[12px] font-semibold uppercase tracking-wide text-muted">Great for</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {p.uses.slice(0, 5).map((u) => (
                  <li key={u} className="rounded-full bg-sand px-2.5 py-0.5 text-[13px]">
                    {u}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="mt-auto pt-6">
            <CartAction p={p} size="md" />
          </div>
        </div>
      </article>
    );
  }

  // md: the Shopee/Lazada card. White, square photo, badges on the photo, the name as the main text,
  // price under it in green, then add-to-cart (icon) and Buy now. Tapping the card opens the product page.
  {
    const hover = hoverIds.has(p.id) ? photo(p.photos[0].replace(/-1$/, "-hover")) : null;
    return (
      <article className={cn("group flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-white transition-[box-shadow,transform] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_-14px_rgb(0_0_0/.3)] motion-reduce:hover:translate-y-0", className)}>
        <div className="relative">
          <Link href={href} aria-label={`${p.name}, ${money(p.price)}`} className="relative block bg-sand">
            {img(cn("aspect-square w-full", !hover && "transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:group-hover:scale-100"), 560)}
            {/* Lifestyle photo on hover. Pre-aligned by scripts (bottle and dropper sit exactly where they do in the
                card photo, same size), so only the scene changes. Mouse only; no fade with reduced motion. */}
            {hover && (
              <img
                src={hover}
                alt=""
                aria-hidden
                width={560}
                height={560}
                loading="lazy"
                className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none [@media(hover:hover)]:block"
              />
            )}
          </Link>
          <span className="absolute left-2 top-2 flex flex-wrap gap-1">
            <ProductTag p={p} fill={c.pale} color={c.deep} className="px-2 py-0.5 text-[11px] font-semibold" />
            <Badge p={p} />
          </span>
          <span className="absolute right-2 top-2">
            <ShopeeBadge p={p} />
          </span>
        </div>
        <div className="flex flex-1 flex-col p-2.5 sm:p-3">
          <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug sm:text-[17px]">
            <Link href={href} className="underline-offset-4 hover:underline">
              {p.name}
            </Link>
          </h3>
          <p className="mt-0.5 flex items-baseline justify-between gap-2 text-[14px]">
            <Price p={p} className="text-left font-medium text-amber-700" />
            {p.size && <span className="shrink-0 text-right text-[12px] text-muted">{p.size}</span>}
          </p>
          <div className="mt-auto pt-2.5">
            <CartAction p={p} size="sm" />
          </div>
        </div>
      </article>
    );
  }

}

export function ProductGridSkeleton({ n = 8 }: { n?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2 rounded-2xl bg-[#f6f7f6] p-2">
          <div className="skeleton aspect-[4/3.4] rounded-xl" />
          <div className="flex justify-between gap-3">
            <div className="skeleton h-5 w-2/3 rounded" />
            <div className="skeleton h-5 w-1/5 rounded" />
          </div>
          <div className="skeleton mt-1 h-10 rounded-full" />
        </div>
      ))}
    </div>
  );
}
