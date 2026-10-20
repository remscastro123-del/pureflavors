"use client";

import Link from "next/link";
import { useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { filterIcons } from "@/lib/filter-icons";

/**
 * The one tab/chip control for the site.
 *  - variant "segmented": switches between views (product groups). role=tablist / tab, aria-selected, arrow keys.
 *  - variant "pills": filters or jumps (flavor families, recipe categories, section nav). aria-pressed, or links.
 * Items with an href render as links (aria-current), so the same component covers navigation chips.
 */
export type TabItem = {
  value: string;
  label: string;
  count?: number;
  href?: string;
  /** Key into filterIcons; defaults to the label */
  icon?: string;
  /** Family colours (pills only): mid icon circle on a white chip; selected fills with deep */
  tone?: { pale: string; mid: string; deep: string };
};

const chip = "inline-flex min-h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition-colors";
const chipOn = "bg-amber-600 text-white";
const chipOff = "border border-line bg-white text-ink hover:border-ink/40";

export function Tabs({
  items,
  value,
  onChange,
  variant = "pills",
  label,
  scroll = true,
  className,
}: {
  items: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
  variant?: "segmented" | "pills";
  label: string;
  /** Single scrollable row instead of wrapping */
  scroll?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const count = (n?: number) => (n == null ? null : <span className="tabular-nums opacity-70">{n}</span>);
  const icon = (t: TabItem) => {
    const Icon = filterIcons[t.icon ?? t.label] ?? filterIcons[t.value];
    return Icon ? <Icon aria-hidden className="h-4 w-4 shrink-0" strokeWidth={1.75} /> : null;
  };

  if (variant === "pills") {
    return (
      <div role="group" aria-label={label} className={cn("no-scrollbar -mx-1 flex max-w-full gap-2 px-1 py-2", scroll ? "overflow-x-auto" : "flex-wrap", className)}>
        {items.map((t) => {
          const on = t.value === value;
          const toned = t.tone
            ? {
                // inactive: plain white chip, colour only on the icon circle; active: filled with the deep tone
                className: cn(chip, "pl-1.5", on ? "shadow-[0_4px_14px_-6px_rgb(0_0_0/.35)]" : "border border-line bg-white text-ink hover:border-ink/40"),
                style: on ? { background: t.tone.deep, color: "#fff" } : undefined,
              }
            : null;
          const body = toned ? (
            <>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" style={{ background: on ? "rgb(255 255 255 / .2)" : t.tone!.mid, color: on ? "#fff" : t.tone!.deep }}>
                {icon(t)}
              </span>
              {t.label}
              {count(t.count)}
            </>
          ) : (
            <>
              {icon(t)}
              {t.label}
              {count(t.count)}
            </>
          );
          return t.href ? (
            <Link key={t.value} href={t.href} aria-current={on ? "page" : undefined} className={toned?.className ?? cn(chip, on ? chipOn : chipOff)} style={toned?.style}>
              {body}
            </Link>
          ) : (
            <button key={t.value} type="button" aria-pressed={on} onClick={() => onChange?.(t.value)} className={toned?.className ?? cn(chip, on ? chipOn : chipOff)} style={toned?.style}>
              {body}
            </button>
          );
        })}
      </div>
    );
  }

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = items.findIndex((t) => t.value === value);
    const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : null;
    if (next == null) return;
    e.preventDefault();
    const t = items[(next + items.length) % items.length];
    onChange?.(t.value);
    track.current?.querySelector<HTMLElement>(`[data-value="${CSS.escape(t.value)}"]`)?.focus();
  };

  return (
    <div
      ref={track}
      role="tablist"
      aria-label={label}
      onKeyDown={onKey}
      className={cn("no-scrollbar inline-flex max-w-full gap-1 self-start overflow-x-auto rounded-full bg-sand p-1", className)}
    >
      {items.map((t) => {
        const on = t.value === value;
        return (
          <button
            key={t.value}
            type="button"
            role="tab"
            data-value={t.value}
            aria-selected={on}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange?.(t.value)}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-[13px] font-medium transition-colors sm:gap-1.5 sm:px-4 sm:text-[14px]",
              on ? "bg-white font-semibold text-amber-700 shadow-sm" : "text-ink/80 hover:text-ink",
            )}
          >
            <span className="contents max-sm:hidden">{icon(t)}</span>
            {t.label}
            {count(t.count)}
          </button>
        );
      })}
    </div>
  );
}
