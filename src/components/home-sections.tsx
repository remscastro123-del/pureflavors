"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CakeSlice,
  Candy,
  Citrus,
  Coffee,
  Cookie,
  Croissant,
  CupSoda,
  Dessert,
  Donut,
  Droplet,
  IceCreamCone,
  Martini,
  Milk,
  Popsicle,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { photo, products, recipes } from "@/lib/catalog";
import { colorFor, familyColor, familyColors, type FamilyColor } from "@/lib/tones";
import { cn, money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import testimonials from "@/data/testimonials.json";

const EASE = "cubic-bezier(.4,0,.2,1)";

function useBreakpoint() {
  const [bp, setBp] = useState<"mobile" | "tablet" | "desktop">("desktop");
  useEffect(() => {
    const set = () => setBp(innerWidth < 768 ? "mobile" : innerWidth < 1200 ? "tablet" : "desktop");
    set();
    addEventListener("resize", set);
    return () => removeEventListener("resize", set);
  }, []);
  return bp;
}

/* ================================================================================================
 * UGC carousel, to the calendly.com mechanism:
 *  - five slots by distance from the active card: centre, near, far on each side;
 *    desktop 762x513 / 105x344 / 74x205, tablet 672x430 centre, phone 320x538 centre with 20x42 / 16x28 slivers;
 *  - cards morph between slots (size + position, 0.62s, ease .4,0,.2,1); the centre card's content slides in
 *    from the direction of travel and fades in (0.35s), side cards show the photo only;
 *  - autoplay every 6s; the active dot is an 80px pill whose fill is the countdown; hover/focus pauses.
 *  - goo connectors belong to the slot, not the gap: each side card carries one on the edge facing the centre
 *    (absolutely positioned, overlapping 1px, vertically centred), so it moves and resizes with its card.
 *    20x42 beside the centre card, 16x28 on the outer pair and on phones; the gap equals the connector width.
 * Testimonials come from src/data/testimonials.json. The current entries are FICTIONAL SAMPLES for local testing
 * (flagged "sample": true and badged "Sample" on screen). Replace them with real, permitted customer quotes before launch.
 * ============================================================================================== */
type Story = { kicker: string; headline: string; body: string; byline: string; role?: string; image: string; href: string; sample?: boolean };

function buildStories(): Story[] {
  type T = { quote: string; headline?: string; name: string; role?: string; image: string; productId?: string; sample?: boolean };
  const real = (testimonials as T[]).map((t) => {
    const p = products.find((x) => x.id === t.productId);
    return {
      kicker: p ? `Made with ${p.name}` : "Made with PURE",
      headline: t.headline ?? (p ? `Made with ${p.name}` : "Made with PURE"),
      body: `“${t.quote}”`,
      byline: t.name,
      role: t.role,
      image: t.image,
      href: p ? `/shop/${p.id}/` : "/shop/",
      sample: t.sample,
    };
  });
  if (real.length >= 3) return real;
  // fallback until there are enough testimonials: PURE's own recipes, in PURE's own words
  const own = recipes.map((r) => {
    const p = products.find((x) => x.id === r.productId);
    return { kicker: "From the PURE kitchen", headline: r.title, body: r.summary, byline: p ? `Made with ${p.name}` : "Made with PURE", image: r.image, href: `/recipes/${r.id}/` };
  });
  return [...real, ...own];
}

/**
 * Background palette for the active card, from the PURE family colours only: the photo is sampled on a small
 * canvas and matched to the two nearest families by colour distance. Calendly-style: deep blobs at the top,
 * the mid colour as the ground, so white text sits on the darker top and white markers on the mid.
 */
const FAMILY_LIST = Object.values(familyColors);
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hue = ([r, g, b]: number[]) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
  if (!d) return 0;
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return (h * 60 + 360) % 360;
};
function usePalette(src: string) {
  const [pair, setPair] = useState<[FamilyColor, FamilyColor]>([familyColors.Fruit, familyColors.Sweet]);
  useEffect(() => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    img.onload = () => {
      const N = 24;
      const cv = document.createElement("canvas");
      cv.width = cv.height = N;
      const ctx = cv.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, N, N);
      const d = ctx.getImageData(0, 0, N, N).data;
      // weight saturated pixels so the food colour wins over white plates and backgrounds
      let r = 0, g = 0, b = 0, w = 0;
      for (let i = 0; i < d.length; i += 4) {
        const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
        const sat = mx ? (mx - mn) / mx : 0;
        const wt = sat * sat + 0.02;
        r += d[i] * wt; g += d[i + 1] * wt; b += d[i + 2] * wt; w += wt;
      }
      // match by hue (circular distance), so browns and oranges land on Mango, not on the nearest RGB green
      const target = hue([r / w, g / w, b / w]);
      const ranked = FAMILY_LIST.filter((f) => f.name !== "Stone" && f.name !== "Slate")
        .map((f) => {
          const dh = Math.abs(hue(hex(f.mid)) - target);
          return { f, dist: Math.min(dh, 360 - dh) };
        })
        .sort((x, y) => x.dist - y.dist);
      setPair([ranked[0].f, ranked[1].f]);
    };
  }, [src]);
  return pair;
}

const SLOTS = {
  // c/n/f: centre, near and far card sizes; g1/g2: connector (and gap) size beside the centre / outer pair
  desktop: { c: [762, 513], n: [105, 344], f: [74, 205], g1: [20, 42], g2: [16, 28] },
  tablet: { c: [672, 430], n: [96, 300], f: [64, 180], g1: [20, 42], g2: [16, 28] },
  mobile: { c: [320, 538], n: [20, 42], f: [16, 28], g1: [16, 28], g2: [16, 28] },
} as const;

export function MadeWithPure() {
  const list = buildStories();
  const n = list.length;
  const bp = useBreakpoint();
  const S = SLOTS[bp];
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the progress fill
  const [fa, fb] = usePalette(list[i].image);

  const go = (k: number) => {
    const d = ((k - i + n) % n) <= n / 2 ? 1 : -1;
    setDir(d as 1 | -1);
    setI(((k % n) + n) % n);
    setCycle((c) => c + 1);
  };

  useEffect(() => {
    if (paused || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(i + 1), 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i, paused, cycle]);

  // Only the five visible slots render. When the active card changes, any card whose previous offset is outside
  // the visible range, or that would jump more than the visible span, gets a new generation (a new React key):
  // it mounts fresh, sliding in 120px from outside, instead of travelling across the row (calendly.com WZ).
  const OFFSETS = [-2, -1, 0, 1, 2];
  const prev = useRef(i);
  const gens = useRef(new Map<number, number>());
  const wrap = (from: number, to: number) => {
    let r = to - from;
    if (r > Math.floor(n / 2)) r -= n;
    if (r < -Math.floor(n / 2)) r += n;
    return r;
  };
  const shown = useRef<{ key: string; k: number; d: number }[]>([]);
  const leaving = useRef<{ key: string; k: number; d: number }[]>([]);
  const [, setTick] = useState(0);
  if (prev.current !== i) {
    const before = shown.current;
    for (const o of OFFSETS) {
      const card = (((i + o) % n) + n) % n;
      const was = wrap(prev.current, card);
      if (Math.abs(was) > 2 || Math.abs(o - was) > 2) gens.current.set(card, (gens.current.get(card) ?? 0) + 1);
    }
    prev.current = i;
    const nowKeys = new Set(OFFSETS.map((o) => { const c = (((i + o) % n) + n) % n; return `${c}-g${gens.current.get(c) ?? 0}`; }));
    leaving.current = before.filter((b) => !nowKeys.has(b.key));
  }
  shown.current = OFFSETS.map((o) => { const c = (((i + o) % n) + n) % n; return { key: `${c}-g${gens.current.get(c) ?? 0}`, k: c, d: o }; });
  useEffect(() => {
    if (!leaving.current.length) return;
    const t = setTimeout(() => { leaving.current = []; setTick((x) => x + 1); }, 200);
    return () => clearTimeout(t);
  }, [i]);
  const near = S.c[0] / 2 + S.g1[0] + S.n[0] / 2;
  const far = S.c[0] / 2 + S.g1[0] + S.n[0] + S.g2[0] + S.f[0] / 2;
  const slot = (d: number) => {
    const a = Math.abs(d);
    if (a === 0) return { x: 0, w: S.c[0], h: S.c[1], o: 1 };
    if (a === 1) return { x: Math.sign(d) * near, w: S.n[0], h: S.n[1], o: 1 };
    if (a === 2) return { x: Math.sign(d) * far, w: S.f[0], h: S.f[1], o: 1 };
    return { x: Math.sign(d) * (far + S.f[0]), w: S.f[0], h: S.f[1], o: 0 };
  };

  return (
    <section
      aria-labelledby="ugc-title"
      className="relative mx-2 overflow-hidden rounded-[40px] py-16 sm:mx-3 sm:rounded-[64px] sm:py-24"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* background: the two PURE family colours nearest the active photo; deep blobs on top, mid ground */}
      <div aria-hidden className="pointer-events-none absolute inset-0 transition-colors duration-1000" style={{ backgroundColor: fa.mid }}>
        <span className="goo-blob absolute -left-[10%] -top-[35%] h-[80%] w-[60%] rounded-full blur-[90px] transition-colors duration-1000" style={{ backgroundColor: fa.deep }} />
        <span className="goo-blob absolute -right-[10%] -top-[30%] h-[75%] w-[55%] rounded-full blur-[90px] transition-colors duration-1000 [animation-direction:reverse]" style={{ backgroundColor: fb.deep }} />
        <span className="goo-blob absolute -bottom-[30%] left-[20%] h-[70%] w-[60%] rounded-full opacity-80 blur-[90px] transition-colors duration-1000" style={{ backgroundColor: fb.mid }} />
      </div>
      <div className="relative">
        <h2 id="ugc-title" className="font-display px-4 text-center text-[34px] leading-tight text-white sm:text-[52px]">
          Loved in kitchens across the Philippines
        </h2>
        <p className="mt-2 px-4 text-center text-[16px] text-white/85">Bakers, cafés and home cooks on what a few drops of PURE changed.</p>

        <div className="relative mx-auto mt-10" style={{ height: S.c[1] }}>
          {leaving.current.map(({ key, k, d }) => {
            const p = slot(d);
            return (
              <div
                key={`out-${key}`}
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2"
                style={{ width: p.w, height: p.h, transform: `translate(calc(-50% + ${p.x}px), -50%)`, zIndex: 5 }}
              >
                <div
                  className="h-full w-full overflow-hidden rounded-[32px] bg-white p-1.5 sm:rounded-[40px] sm:p-2"
                  style={{ animation: `${p.x >= 0 ? "ugc-exit-r" : "ugc-exit-l"} .18s cubic-bezier(.4,0,1,1) forwards` }}
                >
                  <span className="relative block h-full w-full overflow-hidden rounded-[24px] bg-sand sm:rounded-[32px]">
                    <img src={list[k].image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </span>
                </div>
              </div>
            );
          })}
          {OFFSETS.map((d) => {
            const k = (((i + d) % n) + n) % n;
            const s = list[k];
            const p = slot(d);
            const center = d === 0;
            return (
              <div
                key={`${k}-g${gens.current.get(k) ?? 0}`}
                className="group/slot absolute left-1/2 top-1/2"
                style={{
                  width: p.w,
                  height: p.h,
                  opacity: p.o,
                  transform: `translate(calc(-50% + ${p.x}px), -50%)`,
                  transition: `width .62s ${EASE}, height .62s ${EASE}, transform .62s ${EASE}, opacity .3s`,
                  zIndex: 10 - Math.abs(d),
                }}
                aria-hidden={!center}
              >
                {d !== 0 && Math.abs(d) <= 2 && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 my-auto block"
                    style={{
                      width: (Math.abs(d) === 1 ? S.g1 : S.g2)[0] + 2,
                      height: (Math.abs(d) === 1 ? S.g1 : S.g2)[1],
                      ...(d < 0 ? { left: "calc(100% - 1px)" } : { right: "calc(100% - 1px)" }),
                      transition: `width .62s ${EASE}, height .62s ${EASE}`,
                    }}
                  >
                    <svg viewBox="0 0 16 28" preserveAspectRatio="none" className="block h-full w-full fill-white">
                      <path d="M0 0c0 6 3 10 8 10s8-4 8-10v28c0-6-3-10-8-10S0 22 0 28Z" />
                    </svg>
                  </span>
                )}
                <div
                  className={cn(
                    "h-full w-full overflow-hidden rounded-[32px] bg-white shadow-[0_10px_30px_rgb(95_109_119/.08)] transition-transform duration-300 [transition-timing-function:cubic-bezier(.3,1.5,.5,1)] sm:rounded-[40px]",
                    d !== 0 && "group-hover/slot:scale-[1.04]",
                  )}
                  style={{ animation: `${d >= 0 ? "ugc-enter-r" : "ugc-enter-l"} .62s cubic-bezier(.4,0,.2,1) backwards` }}
                >
                {center ? (
                  <article
                    key={`c-${i}`}
                    className={cn("flex h-full gap-4 p-3 sm:p-4", bp === "mobile" ? "flex-col" : "flex-row", dir > 0 ? "animate-[ugc-in-fwd_.35s_cubic-bezier(0,0,.2,1)]" : "animate-[ugc-in-back_.35s_cubic-bezier(0,0,.2,1)]", "motion-reduce:animate-none")}
                  >
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-3 overflow-hidden p-3 sm:p-5">
                      <div>
                        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-muted">
                          {s.kicker}
                          {s.sample && <span className="rounded-full bg-amber-100 px-2 py-0.5 normal-case tracking-normal text-amber-900">Sample</span>}
                        </p>
                        <h3 className="mt-2 line-clamp-3 text-[21px] font-semibold leading-tight sm:text-[25px]">{s.headline}</h3>
                      </div>
                      <div>
                        <p className="font-display line-clamp-5 text-[16px] leading-snug sm:text-[18px]">{s.body}</p>
                        <p className="mt-3 flex min-w-0 flex-wrap gap-1.5">
                          <span className="max-w-full truncate rounded-md bg-sand px-2 py-1 text-[12px] font-semibold">{s.byline}</span>
                          {s.role && <span className="max-w-full truncate rounded-md bg-sand px-2 py-1 text-[12px]">{s.role}</span>}
                        </p>
                        <Link href={s.href} className="mt-1 flex min-h-10 items-center gap-1 text-[14px] font-semibold underline-offset-4 hover:underline">
                          Shop the flavor
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                      </div>
                    </div>
                    <div
                      className={cn("relative shrink-0 overflow-hidden rounded-[24px] bg-sand sm:rounded-[32px]", bp === "mobile" ? "h-[150px]" : "self-stretch")}
                      style={bp === "mobile" ? undefined : { width: `clamp(200px, 50%, ${bp === "tablet" ? 312 : 361}px)` }}
                    >
                      <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  </article>
                ) : (
                  <button type="button" tabIndex={Math.abs(d) <= 2 ? 0 : -1} onClick={() => go(k)} aria-label={`Show ${s.headline}`} className="block h-full w-full p-1.5 sm:p-2">
                    <span className="relative block h-full w-full overflow-hidden rounded-[24px] bg-sand sm:rounded-[32px]">
                      <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    </span>
                  </button>
                )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Testimonials">
          {list.map((s, k) => (
            <button key={k} type="button" role="tab" aria-selected={k === i} aria-label={s.headline} onClick={() => go(k)} className="flex h-8 items-center">
              <span className={cn("relative block h-2 overflow-hidden rounded-full bg-white/40 transition-[width] duration-300", k === i ? "w-20" : "w-2")}>
                {k === i && (
                  <span
                    key={`${i}-${cycle}`}
                    className="absolute inset-y-0 left-0 rounded-full bg-white animate-[ugc-progress_6s_linear_forwards] motion-reduce:animate-none"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================================================
 * Icon tiles joined by goo bridges, to the calendly.com integrations mechanism:
 *  - each tile is a rounded linen body (112x136, 24px radius, 64px icon) with half-bridges on the sides
 *    that touch a neighbour (12px wide, 42px tall, concave), so a row reads as one liquid chain;
 *  - hover/focus swells the body (padding 24 to 30px) and pulls in its free edges, 0.2s ease-in-out;
 *  - phones use the small size (92x112, 16px radius, 53px icon, 10x34 bridges).
 * ============================================================================================== */
const makes: { label: string; q: string; Icon: LucideIcon; tone: string }[] = [
  { label: "Milk tea", q: "milk tea", Icon: CupSoda, tone: "Drinks" },
  { label: "Coffee", q: "coffee", Icon: Coffee, tone: "Sweet" },
  { label: "Shakes", q: "shakes", Icon: Milk, tone: "Creamy" },
  { label: "Juice", q: "juice", Icon: Citrus, tone: "Fruit" },
  { label: "Frappés", q: "frappe", Icon: Popsicle, tone: "Drinks" },
  { label: "Cocktails", q: "lychee", Icon: Martini, tone: "Bakery powder" },
  { label: "Ice cream", q: "ice cream", Icon: IceCreamCone, tone: "Creamy" },
  { label: "Cakes", q: "cake", Icon: CakeSlice, tone: "Sweet" },
  { label: "Frosting", q: "frosting", Icon: Dessert, tone: "Sweet" },
  { label: "Candy", q: "candy", Icon: Candy, tone: "Fruit" },
  { label: "Pastries", q: "pastry", Icon: Croissant, tone: "Creamy" },
  { label: "Breads", q: "bread", Icon: Wheat, tone: "Bakery powder" },
  { label: "Cookies", q: "cookie", Icon: Cookie, tone: "Sweet" },
  { label: "Doughnuts", q: "pastry", Icon: Donut, tone: "Fruit" },
];

function Bridge({ side }: { side: "left" | "right" }) {
  // concave half-bridge: flush with the tile body on one side, pinched to a 14/42 neck where it meets the neighbour
  return (
    <span aria-hidden className="goo-bridge relative self-center overflow-hidden" data-side={side}>
      <svg viewBox="0 0 12 42" preserveAspectRatio="none" className={cn("absolute inset-0 h-full w-[calc(100%+1px)] fill-[#f5f3ee] transition-[fill] duration-200 group-active:fill-[#e9e5dc]", side === "left" ? "-scale-x-100 left-0" : "-left-px")}>
        <path d="M0 0c0 8 8 14 12 14v14c-4 0-12 6-12 14Z" />
      </svg>
    </span>
  );
}

function TileRow({ items }: { items: typeof makes }) {
  return (
    <ul className="flex justify-center">
      {items.map(({ label, q, Icon, tone }, k) => {
        const c = familyColor(tone);
        const L = k > 0 ? 1 : 0, R = k < items.length - 1 ? 1 : 0;
        return (
          <li key={label} className="goo-tile" style={{ ["--l" as string]: L, ["--r" as string]: R }}>
            <Link href={`/shop/?q=${encodeURIComponent(q)}`} aria-label={`Flavors for ${label.toLowerCase()}`} className="group flex h-full items-center outline-none">
              {L ? <Bridge side="left" /> : null}
              <span className="goo-body relative z-10 flex items-center justify-center bg-[#f5f3ee] group-active:bg-[#e9e5dc]">
                <span className="goo-icon flex items-center justify-center rounded-full" style={{ background: c.pale, color: c.deep }}>
                  <Icon className="h-[55%] w-[55%]" strokeWidth={1.5} aria-hidden />
                </span>
              </span>
              {R ? <Bridge side="right" /> : null}
            </Link>
            <span className="mt-2 block text-center text-[12px] font-medium sm:text-[13px]">{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function GoesInto() {
  const half = Math.ceil(makes.length / 2);
  return (
    <section aria-labelledby="goes-title" className="mx-auto max-w-[1200px] px-2 py-16 text-center sm:px-6 sm:py-24">
      <h2 id="goes-title" className="font-display mx-auto max-w-[18ch] text-[34px] leading-tight sm:text-[52px]">
        Flavor for everything you make
      </h2>
      <p className="mt-3 text-[16px] text-muted">Tap what you’re making to see the flavors that suit it.</p>
      <Link href="/shop/" className="mt-4 inline-flex min-h-11 items-center gap-1 text-[15px] font-semibold underline-offset-4 hover:underline">
        View all products
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
      {/* desktop and tablet: two rows of 7; phones: rows of 3 */}
      <div className="mt-10 hidden flex-col gap-6 md:flex">
        <TileRow items={makes.slice(0, half)} />
        <TileRow items={makes.slice(half)} />
      </div>
      <div className="mt-8 flex flex-col gap-5 md:hidden">
        {Array.from({ length: Math.ceil(makes.length / 3) }, (_, r) => (
          <TileRow key={r} items={makes.slice(r * 3, r * 3 + 3)} />
        ))}
      </div>
    </section>
  );
}

/* ================================================================================================
 * Final CTA, to the calendly.com mechanism: centred headline and one dark pill, then an endless row of
 * rounded gradient cards whose subject (a cut-out bottle) rises above the card's top edge. The row drifts
 * continuously (one set repeated three times), cards swell as they pass the centre, and status chips float
 * on the centred card. Hover pauses; reduced motion stops the drift.
 * ============================================================================================== */
const finale = ["mango", "strawberry", "matcha", "lychee", "coffee", "watermelon", "vanilla"];
const sizes = [
  [656, 384],
  [593, 432],
  [558, 326],
  [504, 367],
];

export function FinalCta() {
  const items = finale.map((id) => products.find((p) => p.id === id)).filter((p) => p != null);
  const track = useRef<HTMLUListElement>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, x = 0, last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      const setW = el.scrollWidth / 3;
      if (!paused) x = (x + dt * 0.045) % setW; // ~45px per second
      el.style.transform = `translate3d(${-x}px,0,0)`;
      const mid = innerWidth / 2;
      for (const li of el.children as unknown as HTMLElement[]) {
        const r = li.getBoundingClientRect();
        const d = Math.min(1, Math.abs(r.left + r.width / 2 - mid) / (r.width * 0.9));
        const card = li.firstElementChild as HTMLElement;
        card.style.transform = `scale(${(1.06 - 0.06 * d).toFixed(3)})`;
        li.style.setProperty("--chip", String(Math.max(0, 1 - d * 2.2)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  const set = (rep: number) =>
    items.map((p, k) => {
      const c = colorFor(p);
      const [w, h] = sizes[k % sizes.length];
      return (
        <li key={`${rep}-${p.id}`} className="-mr-4 shrink-0 sm:-mr-7 lg:mr-10" aria-hidden={rep > 0}>
          <Link
            href={`/shop/${p.id}/`}
            tabIndex={rep > 0 ? -1 : 0}
            className="relative block w-[var(--w-sm)] origin-center sm:w-[var(--w)]"
            style={{ ["--w" as string]: `${w}px`, ["--w-sm" as string]: `${Math.round(w * 0.52)}px`, aspectRatio: `${w}/${h}` }}
          >
            <span className="absolute inset-x-0 bottom-0 h-[80.6%] overflow-hidden rounded-[28px] sm:rounded-[40px]" style={{ background: `linear-gradient(160deg, ${c.pale}, ${c.mid})` }} />
            <img src={`/media/hero/${p.id}-cutout.webp`} alt={`PURE ${p.name}`} loading="lazy" className="absolute bottom-[4%] left-1/2 h-[96%] w-auto max-w-none -translate-x-1/2 drop-shadow-[0_16px_20px_rgb(0_0_0/.18)]" />
            <span className="pointer-events-none absolute left-[6%] top-[34%] flex flex-col items-start gap-2 transition-opacity" style={{ opacity: "var(--chip, 0)" }}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold shadow-md">
                <Droplet className="h-3.5 w-3.5" style={{ color: c.deep }} aria-hidden />
                {p.name.replace(/ Flavor$/, "")}
              </span>
              <span className="ml-6 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold tabular-nums shadow-md">{money(p.price)}</span>
            </span>
          </Link>
        </li>
      );
    });

  return (
    <section aria-labelledby="final-title" className="overflow-hidden pt-16 sm:pt-24">
      <div className="px-4 text-center">
        <h2 id="final-title" className="font-display mx-auto max-w-[16ch] text-[38px] leading-[1.05] sm:text-[60px]">
          Your next favorite is a drop away
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-[17px] text-muted">Order today and pay cash on delivery or by e-wallet. Delivered nationwide.</p>
        <Button href="/shop/" variant="dark" size="lg" className="mt-7">
          Shop flavors
        </Button>
      </div>
      <div className="mt-14 w-full overflow-hidden pb-6 pt-10" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <ul ref={track} className="flex w-max items-end will-change-transform">
          {set(0)}
          {set(1)}
          {set(2)}
        </ul>
      </div>
    </section>
  );
}
