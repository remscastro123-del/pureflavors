"use client";

import { useState } from "react";
import { ShoppingCart, SlidersHorizontal } from "lucide-react";
import { Tabs } from "@/components/ui/tabs";
import { Quantity } from "@/components/ui/quantity";
import { SearchInput } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

/** Live demos for the plain style guide (the page itself is a server component). */
export function ChipsDemo() {
  const [group, setGroup] = useState("Flavor");
  const [family, setFamily] = useState("All");
  const [q, setQ] = useState("");
  return (
    <div className="flex flex-col gap-4">
      <Tabs
        variant="segmented"
        label="Demo product groups"
        value={group}
        onChange={setGroup}
        items={[
          { value: "Flavor", label: "Flavors", count: 37 },
          { value: "Bakery", label: "Bakery powders", count: 5 },
          { value: "Equipment", label: "Equipment", count: 1 },
        ]}
      />
      <Tabs
        label="Demo flavor families"
        value={family}
        onChange={setFamily}
        items={["All", "Fruit", "Creamy", "Sweet", "Drinks", "Savory"].map((f) => ({ value: f, label: f === "All" ? "All flavors" : f, icon: f }))}
      />
      <div className="flex max-w-[420px] items-center gap-2">
        <SearchInput label="Demo search" value={q} onChange={(e) => setQ(e.target.value)} onClear={() => setQ("")} placeholder="Search: mango, ube, milk tea…" className="flex-1" />
        <Button variant={family !== "All" ? "primary" : "secondary"} size="icon" aria-label="Filter and sort" className="h-11 w-11">
          <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
        </Button>
      </div>
    </div>
  );
}

export function QuantityDemo() {
  const [n, setN] = useState(1);
  return <Quantity value={n} onChange={(v) => setN(Math.min(99, Math.max(1, v)))} />;
}

/** Static copy of the pinned CartBar (the real one only shows when the cart has items). */
export function CartBarDemo() {
  return (
    <div className="flex w-full max-w-[420px] items-center gap-2 rounded-full border border-line bg-white py-1 pl-3 pr-1 shadow-[0_6px_24px_-10px_rgb(0_0_0/.3)]">
      <span className="flex min-h-10 flex-1 items-center gap-2.5">
        <span className="relative shrink-0">
          <ShoppingCart className="h-5 w-5 text-amber-700" aria-hidden />
          <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-amber-600 px-1 text-center text-[10px] font-semibold leading-4 text-white">2</span>
        </span>
        <span className="text-[14px]">
          <b className="font-semibold">₱460.00</b>
          <span className="text-muted"> + delivery</span>
        </span>
      </span>
      <Button size="sm">Check out</Button>
    </div>
  );
}
