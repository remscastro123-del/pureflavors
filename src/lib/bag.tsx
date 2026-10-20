"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products, type Product } from "@/lib/catalog";

type Lines = Record<string, number>;
type BagLine = { product: Product; qty: number };

type BagState = {
  lines: BagLine[];
  count: number;
  subtotal: number;
  hasPriceOnRequest: boolean;
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  toast: string | null;
};

const KEY = "pure-bag"; // same key as the original site, so existing bags carry over
const BagContext = createContext<BagState | null>(null);

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [raw, setRaw] = useState<Lines>({});
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        const clean: Lines = {};
        for (const [id, q] of Object.entries(saved))
          if (products.some((p) => p.id === id) && Number.isInteger(q) && (q as number) > 0) clean[id] = Math.min(q as number, 99);
        setRaw(clean);
      }
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(raw));
    } catch {}
  }, [raw, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((id: string, qty = 1) => {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    setRaw((r) => ({ ...r, [id]: Math.min((r[id] || 0) + qty, 99) }));
    setToast(`${p.name} added to your cart`);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setRaw((r) => {
      const next = { ...r };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(qty, 99);
      return next;
    });
  }, []);

  const value = useMemo<BagState>(() => {
    const lines = products.filter((p) => raw[p.id]).map((p) => ({ product: p, qty: raw[p.id] }));
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal: lines.reduce((s, l) => s + (l.product.price ?? 0) * l.qty, 0),
      hasPriceOnRequest: lines.some((l) => l.product.price == null),
      ready,
      open,
      setOpen,
      add,
      setQty,
      clear: () => setRaw({}),
      toast,
    };
  }, [raw, ready, open, add, setQty, toast]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used inside BagProvider");
  return ctx;
}
