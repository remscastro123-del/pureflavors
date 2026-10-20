"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { familyLabel, photo, searchProducts } from "@/lib/catalog";
import { cn, money } from "@/lib/utils";
import { SearchInput } from "@/components/ui/form";

/**
 * Header search with live suggestions (WAI-ARIA combobox). Typing shows up to 6 products;
 * arrow keys move, Enter opens the highlighted product or the full results page, Escape closes.
 */
export function SearchSuggest({ placeholder, className, onNavigate }: { placeholder: string; className?: string; onNavigate?: () => void }) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef<HTMLDivElement>(null);

  const all = useMemo(() => (q.trim() ? searchProducts(q) : []), [q]);
  const hits = all.slice(0, 6);
  const showAll = all.length > hits.length;
  const rows = hits.length + (q.trim() ? 1 : 0); // last row: "See all results"

  useEffect(() => setActive(-1), [q]);
  useEffect(() => {
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQ("");
    onNavigate?.();
    router.push(href);
  };
  const resultsHref = `/shop/?q=${encodeURIComponent(q.trim())}`;

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && rows) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % rows);
    } else if (e.key === "ArrowUp" && rows) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? rows - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    go(active >= 0 && active < hits.length ? `/shop/${hits[active].id}/` : resultsHref);
  };

  const expanded = open && q.trim().length > 0;

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <form onSubmit={submit} role="search">
        <SearchInput
          label="Search products"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          onClear={() => setQ("")}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={expanded && active >= 0 ? `${listId}-${active}` : undefined}
          autoComplete="off"
        />
      </form>
      {expanded && (
        <ul id={listId} role="listbox" aria-label="Suggestions" className="absolute inset-x-0 top-[calc(100%+6px)] z-50 min-w-[300px] overflow-hidden rounded-[20px] bg-white/80 p-1.5 shadow-[0_0_0_.5px_rgb(0_0_0/.06),0_18px_40px_-14px_rgb(0_0_0/.3)] backdrop-blur-xl backdrop-saturate-150">
          {hits.length === 0 && (
            <li className="px-3 py-3 text-[14px] text-muted">
              No matches for “{q.trim()}”. Try a flavor or a use, like “milk tea”.
            </li>
          )}
          {hits.map((p, i) => (
            <li
              key={p.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={active === i}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => go(`/shop/${p.id}/`)}
              onPointerEnter={() => setActive(i)}
              className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5", active === i && "bg-amber-100/70")}
            >
              <img src={photo(p.photos[0])} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-lg object-cover" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{p.name}</span>
                <span className="block text-[12px] text-muted">{p.collection === "Flavor" ? familyLabel(p.category) : p.collection}</span>
              </span>
              <span className="text-[14px] tabular-nums">{money(p.price)}</span>
            </li>
          ))}
          {q.trim() && (
            <li
              id={`${listId}-${hits.length}`}
              role="option"
              aria-selected={active === hits.length}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => go(resultsHref)}
              onPointerEnter={() => setActive(hits.length)}
              className={cn("mt-1 flex min-h-11 cursor-pointer items-center rounded-xl border-t border-black/[.06] px-3 text-[14px] font-medium text-amber-700", active === hits.length && "bg-amber-100/70")}
            >
              {showAll ? `See all ${all.length} results for “${q.trim()}”` : `Search the shop for “${q.trim()}”`} <ArrowRight className="h-4 w-4" aria-hidden />
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
