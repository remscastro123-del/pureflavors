"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Quantity stepper used on product pages, the bag and anywhere else a count is chosen. */
export function Quantity({
  value,
  onChange,
  name,
  min = 1,
  max = 99,
  size = "md",
}: {
  value: number;
  onChange: (n: number) => void;
  /** Product name, for button labels */
  name?: string;
  min?: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const btn = cn(
    "inline-flex items-center justify-center rounded-full transition hover:bg-black/[.05] disabled:opacity-40",
    size === "sm" ? "h-10 w-10" : "h-12 w-12",
  );
  return (
    <div className="inline-flex shrink-0 items-center rounded-full border border-line bg-white">
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min && min > 0} aria-label={name ? `Remove one ${name}` : "Decrease quantity"}>
        <Minus className="h-4 w-4" />
      </button>
      <span className={cn("text-center font-semibold tabular-nums", size === "sm" ? "w-7" : "w-8 text-[17px]")} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={name ? `Add one ${name}` : "Increase quantity"}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
