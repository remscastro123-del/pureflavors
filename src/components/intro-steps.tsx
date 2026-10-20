"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChefHat, Droplet, Truck, X, type LucideIcon } from "lucide-react";
import { products, recipes } from "@/lib/catalog";
import { familyColor } from "@/lib/tones";
import { cn, money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PaymentMark } from "@/components/payment-mark";

/**
 * Three-step intro, built to the mechanism measured on calendly.com (October 2026):
 *
 * Tablet and up ("scroll" mode)
 *  1. The panel (max 1200 x 611, 64px corners) scrolls in with the page.
 *  2. When its top reaches 24px it pins, and over the next EXPAND px of scroll it grows to the viewport minus a 24px
 *     inset, sitting above the header. Width/height are scrubbed by scroll, not timed.
 *  3. A wide blurred colour strip (one panel width per step + 1) pans sideways, scrubbed by scroll (the "goo flow").
 *  4. Every STEP px of scroll the active step changes: content crossfades inside one white card (in .35s
 *     cubic-bezier(0,0,.2,1), out .09s), and the active tab bubble slides, joined to the card by a drop-shaped neck.

 *  5. After the last step the panel releases and the page scrolls on.
 * Phones ("autoplay" mode): no pinning; a step every 6s. Reduced motion: the steps simply stack.
 */
type Step = { key: string; Icon: LucideIcon; title: string; text: string; cta: { label: string; href: string }; tone: string };

const steps: Step[] = [
  { key: "pick", Icon: Droplet, title: "Pick your flavor", text: "37 flavor concentrates, from mango and lychee to matcha and cheesecake, plus ube, cocoa and cheese powders for baking.", cta: { label: "Shop flavors", href: "/shop/" }, tone: "Fruit" },
  { key: "add", Icon: ChefHat, title: "Add a few drops", text: "Concentrated, so a little goes a long way in cakes, frosting, milk tea and ice cream. Start with a recipe if you like.", cta: { label: "Get a recipe", href: "/recipes/" }, tone: "Sweet" },
  { key: "order", Icon: Truck, title: "Order with COD or GCash", text: "Check out as a guest and pay cash on delivery, GCash or Maya. We deliver nationwide.", cta: { label: "How ordering works", href: "/help/" }, tone: "Drinks" },
];

const MAX_W = 1200;
const MAX_H = 611;
const INSET = 24; // resting gap above the panel; full screen has none
const EXPAND = 260; // px of scroll to grow from resting panel to full screen
const STEP = 600; // px of scroll per step
const AUTOPLAY = 6000;

function Visual({ i, on }: { i: number; on: boolean }) {
  const c = familyColor(steps[i].tone);
  // `anim(name, delayMs)` only applies while this step is active, so re-entering a step replays it
  const anim = (name: string, delay = 0) => (on ? { animation: `${name} both`, animationDelay: `${delay}ms` } : undefined);
  const frame = (children: ReactNode) => (
    <div className="relative flex h-full min-h-[220px] items-center justify-center overflow-hidden rounded-[32px] px-4 py-5 sm:min-h-[300px]" style={{ background: c.pale, ...anim("vis-frame .6s cubic-bezier(.2,.8,.2,1)") }}>
      <span aria-hidden className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-50" style={{ background: c.mid, ...anim("vis-blob 1.1s cubic-bezier(.2,.8,.2,1)", 80) }} />
      {children}
    </div>
  );
  if (i === 0) {
    return frame(
      <div className="relative flex h-full w-full max-w-[440px] items-end justify-center self-stretch pb-2">
        {["strawberry", "mango", "matcha"].map((id, k) => {
          const p = products.find((x) => x.id === id);
          return (
            <Link key={id} href={`/shop/${id}/`} className={cn("group relative -mx-1.5 flex min-w-0 flex-col items-center", k === 1 ? "z-10 w-[46%]" : "w-[36%]")} style={anim("vis-rise .7s cubic-bezier(.2,.9,.25,1.2)", 120 + (k === 1 ? 0 : 140 + k * 60))}>
              <img src={`/media/hero/${id}-cutout.webp`} alt={p?.name ?? id} className="w-full drop-shadow-[0_14px_18px_rgb(0_0_0/.16)] transition-transform duration-300 group-hover:-translate-y-1" />
              <span className="mt-1 max-w-full truncate rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold shadow-sm sm:text-[12px]" style={anim("vis-pop .45s cubic-bezier(.2,.9,.3,1.4)", 520 + k * 90)}>
                {p?.name.replace(/ Flavor$/, "")}
              </span>
            </Link>
          );
        })}
      </div>,
    );
  }
  if (i === 1) {
    const r = recipes.find((x) => x.id === "peach") ?? recipes[0];
    const made = products.find((p) => p.id === r.productId);
    return (
      <Link href={`/recipes/${r.id}/`} className="group relative block h-full min-h-[220px] overflow-hidden rounded-[32px] sm:min-h-[300px]" style={{ background: c.pale, ...anim("vis-frame .6s cubic-bezier(.2,.8,.2,1)") }}>
        <img src="/media/recipes/recipe-peach-dish.webp" alt={r.title} className="absolute inset-0 h-full w-full object-cover" style={anim("vis-kenburns 1.6s cubic-bezier(.2,.8,.2,1)")} />
        <span className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2">
          <span className="max-w-full truncate rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold shadow-md" style={anim("vis-pop .45s cubic-bezier(.2,.9,.3,1.4)", 450)}>
            {r.title}
          </span>
          {made && (
            <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-full px-3 py-1.5 text-[12px] font-semibold shadow-md" style={{ background: c.pale, color: c.deep, ...anim("vis-pop .45s cubic-bezier(.2,.9,.3,1.4)", 600) }}>
              <Droplet className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Made with {made.name}
            </span>
          )}
        </span>
      </Link>
    );
  }
  const lines = ["mango", "ube-powder"].map((id) => products.find((p) => p.id === id)).filter((p) => p != null);
  const total = lines.reduce((s, p) => s + (p.price ?? 0), 0);
  return frame(
    <div className="relative w-full min-w-0 max-w-[340px] rounded-2xl bg-white p-4 shadow-[0_12px_30px_-12px_rgb(0_0_0/.3)]" style={anim("vis-rise .6s cubic-bezier(.2,.9,.25,1.1)", 100)}>
      <p className="text-[13px] font-semibold">Your order</p>
      <ul className="mt-2 divide-y divide-line">
        {lines.map((p, k) => (
          <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-[14px]" style={anim("vis-slide .45s cubic-bezier(.2,.8,.2,1)", 300 + k * 110)}>
            <span className="min-w-0 truncate">{p.name}</span>
            <span className="font-medium tabular-nums">{money(p.price)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {(["cod", "gcash", "maya"] as const).map((m, k) => (
          <span key={m} className={cn("flex min-w-0 items-center justify-center rounded-lg border p-1", m === "cod" ? "border-amber-600" : "border-line")} style={anim("vis-pop .4s cubic-bezier(.2,.9,.3,1.4)", 560 + k * 80)}>
            {m === "cod" ? <span className="text-[12px] font-semibold text-amber-700">COD</span> : <PaymentMark method={m} size="sm" className="ring-0" />}
          </span>
        ))}
      </div>
      <span className="mt-3 flex min-h-10 items-center justify-center rounded-full bg-amber-600 text-[14px] font-semibold text-white" style={anim("vis-pop .45s cubic-bezier(.2,.9,.3,1.3)", 860)}>
        Place order {money(total)}
      </span>
    </div>,
  );
}

function Tabs({ active, onTab }: { active: number; onTab: (i: number) => void }) {
  return (
    <div className="flex justify-center">
      <div role="tablist" aria-label="How PURE works" className="relative flex gap-2.5">
        {steps.map((t, i) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={i === active}
            aria-label={`Step ${i + 1}: ${t.title}`}
            onClick={() => onTab(i)}
            className={cn(
              "relative z-10 flex h-12 w-12 items-center justify-center rounded-[16px] ring-[3px] ring-white transition-colors duration-200",
              i === active ? "" : "bg-white/45 text-ink/70 backdrop-blur hover:bg-white/70",
            )}
            style={i === active ? { background: familyColor(t.tone).pale, color: familyColor(t.tone).deep } : undefined}
          >
            <t.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </button>
        ))}
        {/* drop-shaped neck joining the active bubble to the card below */}
        <svg
          aria-hidden
          viewBox="0 0 36 14"
          className="absolute top-[calc(100%+1px)] h-[16px] w-[36px] fill-white transition-[left] duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]"
          style={{ left: `calc(${active} * 58px + 24px - 18px)` }}
        >
          <path d="M0 14c9 0 12-4 13.5-8.5C14.6 2.2 16 0 18 0s3.4 2.2 4.5 5.5C24 10 27 14 36 14Z" />
        </svg>
      </div>
    </div>
  );
}

function Card({ active, onTab }: { active: number; onTab: (i: number) => void }) {
  return (
    <div className="relative z-10 flex w-full items-center justify-center">
      <div className="w-full min-w-0 max-w-[996px]">
        <Tabs active={active} onTab={onTab} />
        <div className="mt-[16px] grid rounded-[40px] bg-white p-6 shadow-[0_24px_60px_-30px_rgb(0_0_0/.35)] sm:rounded-[48px] sm:p-8">
          {steps.map((s, i) => (
            <div
              key={s.key}
              aria-hidden={i !== active}
              inert={i !== active}
              className={cn(
                "col-start-1 row-start-1 grid min-w-0 items-center gap-6 md:grid-cols-[1fr_1.15fr] md:gap-8",
                i === active ? "opacity-100 transition-opacity duration-[350ms] ease-[cubic-bezier(0,0,.2,1)]" : "pointer-events-none opacity-0 transition-opacity duration-[90ms] ease-[cubic-bezier(.4,0,1,1)]",
              )}
            >
              <div className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-full bg-sand px-3 py-1 text-[12px] font-semibold">
                  <s.Icon className="h-3.5 w-3.5 text-amber-700" aria-hidden />
                  Step {i + 1} of {steps.length}
                </span>
                <h3 className="font-display mt-3 text-[28px] leading-[1.08] sm:text-[40px]">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-[16px]">{s.text}</p>
                <Button href={s.cta.href} size="lg" className="mt-6">
                  {s.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>
              <Visual i={i} on={i === active} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** The goo flow: a wide blurred strip, (steps + 1) panels wide, panned by `x` panel widths. */
/** Darker blobs riding over the flow, in the active step's deep family colours (Calendly: dark top, light body). */
export function DeepBlobs({ step }: { step: number }) {
  const a = familyColor(steps[step].tone).deep;
  const b = familyColor(steps[(step + 1) % steps.length].tone).deep;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="goo-blob absolute -left-[8%] -top-[30%] h-[70%] w-[50%] rounded-full opacity-60 blur-[100px] transition-colors duration-1000" style={{ backgroundColor: a }} />
      <span className="goo-blob absolute -right-[10%] -top-[25%] h-[60%] w-[45%] rounded-full opacity-45 blur-[100px] transition-colors duration-1000 [animation-direction:reverse]" style={{ backgroundColor: b }} />
    </div>
  );
}

export function Flow({ x, eased = false }: { x: number; eased?: boolean }) {
  return (
    <img
      aria-hidden
      src="/media/hero/flow.webp"
      alt=""
      className={cn("pointer-events-none absolute left-0 top-0 h-full max-w-none select-none", eased && "transition-transform duration-[900ms] ease-[cubic-bezier(.4,0,.2,1)]")}
      style={{ width: `${(steps.length + 1) * 100}%`, transform: `translate3d(${(-x / (steps.length + 1)) * 100}%,0,0)` }}
    />
  );
}

export function IntroSteps() {
  const ref = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<"scroll" | "autoplay" | "static">("static");
  const [active, setActive] = useState(0);
  const [grow, setGrow] = useState(0);
  const [pan, setPan] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [vp, setVp] = useState({ w: 1280, h: 800 });

  useEffect(() => {
    const rm = matchMedia("(prefers-reduced-motion: reduce)");
    const tb = matchMedia("(min-width: 768px)");
    const set = () => {
      setMode(rm.matches ? "static" : tb.matches ? "scroll" : "autoplay");
      setVp({ w: document.documentElement.clientWidth, h: innerHeight });
    };
    set();
    rm.addEventListener("change", set);
    tb.addEventListener("change", set);
    addEventListener("resize", set);
    return () => {
      rm.removeEventListener("change", set);
      tb.removeEventListener("change", set);
      removeEventListener("resize", set);
    };
  }, []);

  // Scroll mode: grow, pan and step are all functions of how far the section top is above the viewport top.
  useEffect(() => {
    if (mode !== "scroll") return;
    let raf = 0;
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const t = -el.getBoundingClientRect().top;
      setPinned(t >= 0 && t <= el.offsetHeight - innerHeight);
      setGrow(Math.min(1, Math.max(0, t / EXPAND)));
      setPan(Math.min(steps.length, Math.max(0, t / STEP)));
      setActive(Math.min(steps.length - 1, Math.max(0, Math.floor((t - EXPAND) / STEP + 0.5))));
    };
    const tick = () => {
      update();
      raf = requestAnimationFrame(tick);
    };
    // scroll events make step changes immediate; the frame loop keeps the scrubbed values smooth
    addEventListener("scroll", update, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", update);
    };
  }, [mode]);

  // Autoplay mode (phones)
  useEffect(() => {
    if (mode !== "autoplay") return;
    const t = setInterval(() => setActive((v) => (v + 1) % steps.length), AUTOPLAY);
    return () => clearInterval(t);
  }, [mode]);

  const jump = useCallback(
    (i: number) => {
      const el = ref.current;
      if (mode !== "scroll" || !el) return setActive(i);
      scrollTo({ top: el.offsetTop + EXPAND + i * STEP + 1, behavior: "smooth" });
    },
    [mode],
  );

  const skip = () => {
    const el = ref.current;
    if (el) scrollTo({ top: el.offsetTop + el.offsetHeight - innerHeight + 2, behavior: "smooth" });
  };

  if (mode === "static") {
    return (
      <section aria-label="How PURE works" className="mx-auto flex max-w-[1248px] flex-col gap-6 px-4 py-6 sm:px-6">
        {steps.map((_, i) => (
          <div key={i} className="relative overflow-hidden rounded-[48px] px-3 py-8 sm:px-8">
            <Flow x={i} />
            <DeepBlobs step={i} />
            <Card active={i} onTab={() => {}} />
          </div>
        ))}
      </section>
    );
  }

  if (mode === "autoplay") {
    return (
      <section aria-label="How PURE works" className="px-3 pt-4">
        <div className="relative overflow-hidden rounded-[48px] px-4 pb-4 pt-6">
          <Flow x={active} eased />
          <DeepBlobs step={active} />
          <div className="relative">
            <Card active={active} onTab={setActive} />
          </div>
        </div>
      </section>
    );
  }

  // Scroll mode geometry: lerp from the resting panel to the full-screen panel.
  const fullW = vp.w, fullH = vp.h;
  const w0 = Math.min(MAX_W, fullW), h0 = Math.min(MAX_H, fullH);
  const w = w0 + (fullW - w0) * grow;
  const h = h0 + (fullH - h0) * grow;

  return (
    <section ref={ref} aria-label="How PURE works" className="relative" style={{ height: EXPAND + steps.length * STEP + vp.h }}>
      <div className={cn("sticky top-0 -mx-2 flex h-[100svh] justify-center sm:-mx-3", pinned && "z-50")} style={{ paddingTop: INSET * (1 - grow) }}>
        <div className="relative overflow-hidden bg-[#f6f4ef]" style={{ width: w, height: h - INSET * (1 - grow), borderRadius: 64 * (1 - grow) }}>
          <button
            type="button"
            onClick={skip}
            aria-label="Close and skip the intro"
            className={cn(
              "absolute right-5 top-5 z-20 flex h-12 w-12 items-center justify-center rounded-full bg-white/70 text-ink shadow-sm backdrop-blur transition-opacity duration-300 hover:bg-white sm:right-8 sm:top-8",
              grow > 0.9 ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
          <Flow x={pan} />
          <DeepBlobs step={active} />
          <div className="relative flex h-full items-center px-6">
            <Card active={active} onTab={jump} />
          </div>
        </div>
      </div>
    </section>
  );
}
