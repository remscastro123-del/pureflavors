"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { collectionOf, familyLabel, familyOrder, groups, products, searchProducts, type Product } from "@/lib/catalog";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/form";
import { Tabs } from "@/components/ui/tabs";
import { familyColor } from "@/lib/tones";

type Sort = "featured" | "az" | "za" | "price";

function sortList(list: Product[], sort: Sort) {
  const l = [...list];
  if (sort === "az") l.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "za") l.sort((a, b) => b.name.localeCompare(a.name));
  if (sort === "price") l.sort((a, b) => (a.price ?? 1e12) - (b.price ?? 1e12));
  if (sort === "featured") l.sort((a, b) => Number(b.featured) - Number(a.featured) || a.position - b.position);
  return l;
}

export function ShopBrowser() {
  const [group, setGroup] = useState("All");
  const [family, setFamily] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("featured");
  const [showFilters, setShowFilters] = useState(false);

  // Read state from the URL after hydration (static export: no server search params).
  useEffect(() => {
    const s = new URLSearchParams(location.search);
    if (s.get("group") && (s.get("group") === "Flavor" || groups.some((g) => g.id === s.get("group")))) setGroup(s.get("group")!);
    if (s.get("family")) setFamily(s.get("family")!);
    if (s.get("q")) setQuery(s.get("q")!);
  }, []);

  useEffect(() => {
    const s = new URLSearchParams();
    if (group !== "All") s.set("group", group);
    if (family !== "All") s.set("family", family);
    if (query) s.set("q", query);
    history.replaceState(null, "", `${location.pathname}${s.size ? `?${s}` : ""}`);
  }, [group, family, query]);

  const families = useMemo(
    () => familyOrder.filter((f) => products.some((p) => p.collection === "Flavor" && p.category === f)),
    [],
  );

  const sections = useMemo(
    () => [
      ...families.map((f) => ({ key: f, title: familyLabel(f), items: products.filter((p) => p.collection === "Flavor" && p.category === f), unit: "flavors" })),
      ...groups.filter((g) => g.id !== "Flavor").map((g) => ({ key: g.id, title: g.label, items: products.filter((p) => p.collection === g.id), unit: "products" })),
    ],
    [families],
  );

  const results = useMemo(() => {
    // Searching: keep relevance order unless the shopper picked a sort.
    if (query.trim()) return sort === "featured" ? searchProducts(query) : sortList(searchProducts(query), sort);
    return sortList(
      products.filter((p) => group === "All" || (p.collection === group && (group !== "Flavor" || family === "All" || p.category === family))),
      sort,
    );
  }, [group, family, query, sort]);

  const searching = query.trim().length > 0;
  const grouped = !searching && group === "All" && sort === "featured";
  const active = Number(sort !== "featured");

  // Categories as one tab row: every flavor family, then the other product groups.
  const categories = [
    { key: "All", label: "All products", icon: "All", count: products.length, group: "All", family: "All" },
    ...families.map((f) => ({ key: f, label: familyLabel(f), icon: familyLabel(f), count: products.filter((p) => p.collection === "Flavor" && p.category === f).length, group: "Flavor", family: f })),
    ...groups.filter((g) => g.id !== "Flavor").map((g) => ({ key: g.id, label: g.label, icon: g.id, count: products.filter((p) => p.collection === g.id).length, group: g.id, family: "All" })),
  ];
  // In the grouped "All products" view the tabs follow the scroll and jump to their section;
  // everywhere else a tab switches what the grid shows.
  const [spy, setSpy] = useState<string | null>(null);
  useEffect(() => {
    if (!grouped) return setSpy(null);
    const on = () => {
      const mid = innerHeight / 2;
      let current: string | null = null;
      for (const sec of sections) {
        const el = document.getElementById(`fam-sec-${sec.key}`);
        if (el && el.getBoundingClientRect().top <= mid) current = sec.key;
      }
      setSpy(current);
    };
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, [grouped, sections]);
  const category = grouped ? spy ?? "All" : group === "Flavor" ? family : group;
  useEffect(() => {
    const chip = document.querySelector<HTMLElement>('[aria-label="Categories"] [aria-pressed="true"]');
    const row = chip?.parentElement;
    if (!chip || !row) return;
    const left = chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2;
    row.scrollTo({ left, behavior: "smooth" });
  }, [category]);
  const pickCategory = (key: string) => {
    const c = categories.find((x) => x.key === key);
    if (!c) return;
    if (grouped) {
      if (key === "All") return scrollTo({ top: 0, behavior: "smooth" });
      const el = document.getElementById(`fam-sec-${key}`);
      const bar = document.querySelector("[data-shop-toolbar]")?.getBoundingClientRect().height ?? 120;
      if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 72 - bar - 8, behavior: "smooth" });
      return;
    }
    setGroup(c.group);
    setFamily(c.family);
    setQuery("");
  };

  return (
    <div>
      <SearchInput
        label="Search all products"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery("")}
        placeholder="Search: mango, ube, milk tea…"
        className="mb-4 max-w-[440px]"
      />

      <div data-shop-toolbar className="sticky top-[72px] z-30 -mx-4 border-b border-line bg-white/95 py-2.5 backdrop-blur sm:-mx-6 lg:-mx-8">
        <div className="flex items-center gap-2 pr-4 sm:pr-6 lg:pr-8">
          {/* chips scroll sideways; on phones the row fades out at both edges */}
          <div className="min-w-0 flex-1 [mask-image:linear-gradient(to_right,transparent,#000_16px,#000_calc(100%-28px),transparent)] sm:[mask-image:linear-gradient(to_right,transparent,#000_24px,#000_calc(100%-40px),transparent)] lg:[mask-image:none]">
            <Tabs
              label="Categories"
              value={searching ? "" : category}
              onChange={pickCategory}
              items={categories.map((c) => ({ value: c.key, label: c.label, icon: c.icon, count: c.count, tone: c.key === "All" ? undefined : familyColor(c.label) }))}
              className="flex-nowrap px-4 sm:px-6 lg:px-8"
            />
          </div>
          <Button
            variant={active ? "primary" : "secondary"}
            size="icon"
            onClick={() => setShowFilters((v) => !v)}
            aria-expanded={showFilters}
            aria-controls="shop-filters"
            aria-label={`Filter and sort${active ? `, ${active} active` : ""}`}
            className="relative h-11 w-11 shrink-0"
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
            {active > 0 && (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-ink px-1 text-center text-[11px] font-semibold leading-5 text-white">{active}</span>
            )}
          </Button>
        </div>

        {showFilters && (
          <div id="shop-filters" className="animate-sheet mt-2.5 flex flex-col gap-3 border-t border-line px-4 pt-3 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Tabs
                label="Sort products"
                value={sort}
                onChange={(v) => setSort(v as Sort)}
                items={[
                  { value: "featured", label: "Featured" },
                  { value: "az", label: "A–Z" },
                  { value: "za", label: "Z–A" },
                  { value: "price", label: "Price: low to high" },
                ]}
              />
              {active > 0 && (
                <Button variant="link" size="sm" onClick={() => setSort("featured")} className="ml-auto text-muted">
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <p role="status" className="mt-6 text-[14px] text-muted">
        {searching ? `${results.length} result${results.length === 1 ? "" : "s"} for “${query.trim()}” across all products` : `${results.length} products`}
      </p>

      {results.length === 0 && (
        <Card padding="lg" className="mt-10">
          <CardTitle as="p" size="lg">No flavors found for “{query}”.</CardTitle>
          <CardText className="mt-2 text-muted">Try another name, or a use like “frosting” or “milk tea”. Can’t find it? Ask us on WhatsApp.</CardText>
        </Card>
      )}

      {grouped ? (
        <div className="mt-6 flex flex-col gap-14">
          {sections.map((sec, gi) => {
            const list = sec.items;
            const col = collectionOf(list[0]);
            return (
              <section key={sec.key} id={`fam-sec-${sec.key}`} aria-labelledby={`fam-${sec.key}`}>
                <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-black/[.08] pb-3">
                  <h2 id={`fam-${sec.key}`} className="font-display text-[30px]">
                    {sec.title}
                  </h2>
                  {col ? (
                    <Button href={`/collections/${col.slug}/`} variant="link" size="sm" className="text-muted">
                      {list.length} {sec.unit === "flavors" ? `${sec.title.toLowerCase()} flavors` : "products"} <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                  ) : (
                    <span className="text-[14px] text-muted tabular-nums">
                      {list.length} {list.length === 1 ? "product" : "products"}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
                  {list.map((p, i) => (
                    <ProductCard key={p.id} p={p} priority={gi === 0 && i < 4} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {results.map((p, i) => (
            <ProductCard key={p.id} p={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
