"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

const KEY = "pure-cookie-consent";

// Cookie notice pinned to the bottom until the visitor chooses. Stores "all" or "essential";
// anything non-essential added later (analytics, pixels) should check for "all" first.
export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  const choose = (v: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, v);
    } catch {}
    setShow(false);
  };

  if (!show) return null;
  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="animate-sheet fixed inset-x-2 bottom-2 z-[55] flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_20px_50px_-15px_rgb(0_0_0/.35)] ring-1 ring-black/[.05] sm:inset-x-auto sm:left-3 sm:bottom-3 sm:max-w-[420px] sm:p-5"
    >
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
          <Cookie className="h-5 w-5" aria-hidden />
        </span>
        <p className="text-[14px] leading-relaxed text-ink/80">
          We use cookies to keep your cart and make the site work. With your OK, we also use them to see what’s popular.{" "}
          <Link href="/privacy/" className="font-semibold text-ink underline underline-offset-4">
            Privacy policy
          </Link>
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" className="min-h-10 flex-1" onClick={() => choose("essential")}>
          Essential only
        </Button>
        <Button size="sm" className="min-h-10 flex-1" onClick={() => choose("all")}>
          Accept all
        </Button>
      </div>
    </div>
  );
}
