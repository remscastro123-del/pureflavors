"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { AnimateIcon } from "@animate-ui/react/icons";
import { Search01 } from "@/components/animate-ui/icons/hugeicons/search-01";
import { ShoppingCart } from "@/components/animate-ui/icons/hugeicons/shopping-cart";
import { User } from "@/components/animate-ui/icons/hugeicons/user";
import { useBag } from "@/lib/bag";
import { collections } from "@/lib/catalog";
import { filterIcons } from "@/lib/filter-icons";
import { familyColor } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SearchSuggest } from "@/components/search-suggest";

/**
 * Header in the Calendly format: a thin announcement bar that scrolls away, then a floating white rounded bar
 * (logo, nav with a Shop dropdown, search, cart, one dark primary pill) that stays pinned with a soft shadow.
 * The bar ends at 66px; pinned elements below it use top-[72px].
 */
const nav = [
  { href: "/recipes/", label: "Recipes" },
  { href: "/business/", label: "For business" },
  { href: "/help/", label: "Help" },
];

function ShopMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="grid gap-1 sm:grid-cols-2">
      {collections.map((c) => {
        const Icon = filterIcons[c.label];
        const t = familyColor(c.label);
        return (
          <Link key={c.slug} href={`/collections/${c.slug}/`} onClick={onNavigate} className="flex min-h-12 items-center gap-3 rounded-xl px-2.5 py-2 hover:bg-sand">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: t.pale, color: t.deep }}>
              {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />}
            </span>
            <span className="text-[15px] font-medium">{c.label}</span>
          </Link>
        );
      })}
      <Link href="/shop/" onClick={onNavigate} className="flex min-h-12 items-center gap-1.5 rounded-xl px-2.5 text-[15px] font-semibold text-amber-700 hover:bg-sand sm:col-span-2">
        All products
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </div>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready, setOpen } = useBag();
  const [menu, setMenu] = useState(false);
  const [shop, setShop] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenu(false);
    setShop(false);
    setSearch(false);
  }, [pathname]);
  useEffect(() => {
    const on = () => setScrolled(scrollY > 40);
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenu(false);
      setShop(false);
      setSearch(false);
    };
    const onDown = (e: PointerEvent) => shopRef.current && !shopRef.current.contains(e.target as Node) && setShop(false);
    addEventListener("keydown", onKey);
    addEventListener("pointerdown", onDown);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("pointerdown", onDown);
    };
  }, [menu]);

  const on = (href: string) => pathname.startsWith(href);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-[#0f2a1e] px-4 py-2 text-center text-[13px] text-white">
        <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          We deliver nationwide.
          <Link href="/help/" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-0.5 font-medium text-ink hover:bg-white/90">
            How ordering works
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </span>
      </div>

      <header className="sticky top-1.5 z-40 px-2 pt-1.5 sm:px-3">
        <div
          className={cn(
            "mx-auto flex h-[60px] max-w-[1400px] items-center gap-2 rounded-2xl bg-white pl-4 pr-2 transition-shadow sm:gap-3 sm:pl-5",
            scrolled ? "shadow-[0_8px_30px_-12px_rgb(0_0_0/.25)] ring-1 ring-black/[.04]" : "ring-1 ring-transparent",
          )}
        >
          <Link href="/" aria-label="PURE home" className="shrink-0">
            <img src="/media/pure-logo.svg" alt="PURE" width={96} height={36} className="h-8 w-auto" />
          </Link>

          <nav aria-label="Main navigation" className="ml-4 hidden items-center gap-0.5 lg:flex">
            <div ref={shopRef} className="relative">
              <button
                type="button"
                onClick={() => setShop((v) => !v)}
                aria-expanded={shop}
                aria-controls="shop-menu"
                className={cn("inline-flex min-h-10 items-center gap-1 rounded-lg px-3 text-[15px] hover:bg-sand", on("/shop") || on("/collections") ? "font-semibold text-amber-700" : "")}
              >
                Shop
                <ChevronDown className={cn("h-4 w-4 transition-transform", shop && "rotate-180")} aria-hidden />
              </button>
              {shop && (
                <div id="shop-menu" className="animate-pop absolute left-0 top-[calc(100%+10px)] w-[460px] rounded-2xl bg-white p-2 shadow-[0_20px_50px_-15px_rgb(0_0_0/.3)] ring-1 ring-black/[.05]">
                  <ShopMenu onNavigate={() => setShop(false)} />
                </div>
              )}
            </div>
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on(n.href) ? "page" : undefined}
                className={cn("inline-flex min-h-10 items-center rounded-lg px-3 text-[15px] hover:bg-sand", on(n.href) && "font-semibold text-amber-700")}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            {search ? (
              <SearchSuggest placeholder="Search, e.g. mangga or milk tea" className="w-[min(320px,52vw)]" onNavigate={() => setSearch(false)} />
            ) : (
              <AnimateIcon animateOnHover asChild>
                <button type="button" onClick={() => setSearch(true)} aria-label="Search" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand">
                  <Search01 className="h-5 w-5" aria-hidden />
                </button>
              </AnimateIcon>
            )}
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-controls="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand lg:hidden"
            >
              {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <AnimateIcon animateOnHover asChild>
              <Link href="/account/login/" aria-label="Log in to your account" className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand">
                <User className="h-5 w-5" aria-hidden />
              </Link>
            </AnimateIcon>
            {/* cart sits rightmost, in brand green */}
            <AnimateIcon animateOnHover asChild>
            <button
              type="button"
              onClick={() => setOpen(true)}
              data-cart-target
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-amber-700 px-3 text-[14px] font-semibold text-white hover:bg-amber-800"
            >
              <ShoppingCart className="h-[18px] w-[18px]" aria-hidden />
              <span className="hidden sm:inline">Cart</span>
              <span className="min-w-5 rounded-full bg-white px-1.5 text-center text-[12px] font-semibold leading-5 text-amber-800 tabular-nums">{ready ? count : 0}</span>
            </button>
            </AnimateIcon>
          </div>
        </div>
      </header>

      {menu && (
        <div id="mobile-menu" className="animate-sheet fixed inset-x-2 bottom-2 top-[76px] z-40 overflow-y-auto rounded-2xl bg-white p-4 shadow-[0_20px_50px_-15px_rgb(0_0_0/.35)] ring-1 ring-black/[.05] lg:hidden">
          <SearchSuggest placeholder="Search flavors, e.g. mangga or milk tea" className="mb-4" onNavigate={() => setMenu(false)} />
          <p className="eyebrow mb-1 px-2.5 text-muted">Shop</p>
          <ShopMenu onNavigate={() => setMenu(false)} />
          <nav aria-label="Mobile navigation" className="mt-4 flex flex-col border-t border-line pt-2">
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="flex min-h-12 items-center justify-between rounded-xl px-2.5 text-[17px] font-medium hover:bg-sand">
                {n.label}
                <ArrowRight className="h-5 w-5 text-muted" aria-hidden />
              </Link>
            ))}
          </nav>
          <Button href="/shop/" variant="dark" full className="mt-4">
            Shop now
          </Button>
        </div>
      )}
    </>
  );
}
