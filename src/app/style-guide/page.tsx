import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ProductCard } from "@/components/product-card";
import { CategoryTiles } from "@/components/category-tiles";
import { familyColors } from "@/lib/tones";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardFooter, CardText, CardTitle } from "@/components/ui/card";
import { Checkbox, Field, FormSection, Input, RadioCard, Select } from "@/components/ui/form";
import { filterIcons } from "@/lib/filter-icons";
import { getProduct } from "@/lib/catalog";
import { CartBarDemo, ChipsDemo, QuantityDemo } from "./plain-demos";
import { PaymentMark, PaymentMarks } from "@/components/payment-mark";

export const metadata: Metadata = {
  title: "Style guide · PURE",
  description: "PURE plain system: white, green and dark grey. Colors, type, buttons, chips, cards, forms, cart bar and the PH buy flow.",
  robots: { index: false, follow: false },
};

/* Values mirror the plain theme block at the end of globals.css. Change both together. */
const greens = [
  ["50", "#effaf3"], ["100", "#d7f2e0"], ["200", "#b0e3c4"], ["300", "#7fcd9f"], ["400", "#4bb077"],
  ["500", "#2a9459"], ["600", "#1f7a47"], ["700", "#1b623b"], ["800", "#194f31"], ["900", "#15402a"],
] as const;
const neutrals = [
  ["white", "#ffffff", "Page, cards, inputs"],
  ["sand", "#f4f6f5", "Photo wells, segmented track, quiet panels"],
  ["line", "#e2e5e3", "Borders and dividers"],
  ["muted", "#5f6361", "Secondary text, hints"],
  ["ink", "#333333", "All body text and headings"],
] as const;
const pairs: [string, string, string, string][] = [
  ["ink", "#333333", "#ffffff", "Body text on white"],
  ["muted", "#5f6361", "#ffffff", "Hints, captions"],
  ["white", "#ffffff", "#1f7a47", "Primary button label"],
  ["green 700", "#1b623b", "#ffffff", "Links, eyebrows, accents"],
  ["green 900", "#15402a", "#d7f2e0", "Badges"],
];

function lum(hex: string) {
  const c = hex.replace("#", "").match(/../g)!.map((x) => parseInt(x, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

const type = [
  ["Display", "text-[56px] sm:text-[64px] font-semibold tracking-tight leading-[1.05]", "Hero H1 only", "The secret to great taste."],
  ["H2", "text-[40px] sm:text-[56px] font-semibold tracking-tight leading-tight", "Section titles", "Find your next favorite."],
  ["H3", "text-[22px] font-semibold", "Card and block titles", "Mango flavor"],
  ["Body", "text-[17px] leading-relaxed", "Paragraphs", "Discover quality flavor concentrates and ingredients."],
  ["Small", "text-[14px] text-muted", "Hints, meta", "₱230.00 · 30 ml"],
  ["Eyebrow", "eyebrow text-[12px] text-amber-700", "Above a title", "Food flavor concentrates"],
] as const;

const flow: [string, string, string][] = [
  ["Product", "Price first, then ratings and sold count, size and how much to use.", "Buy now and Add to cart together; on phones in a sticky bar."],
  ["Cart", "Called “cart”, never “bag”. Count on the button, free-delivery progress with real numbers.", "Pinned cart bar on every page once something is added."],
  ["Checkout", "Address as Province, then City, then Barangay. Delivery fee and arrival dates before Place order.", "Guest checkout, three numbered steps."],
  ["Payment", "GCash, Maya, then cash on delivery: the same order as Shopee.", "COD always available."],
  ["Order placed", "Order number, amount to pay, what happens next, and a chat link.", "We text when it ships."],
];

const rules: [string, string][] = [
  ["Show the delivery fee before “Place order”", "58% would abandon a cart over hidden fees (Milieu 2025)"],
  ["Set a free-delivery threshold and show progress", "8 in 10 see free shipping as a must (Shopify 2024)"],
  ["Offer GCash and Maya", "GCash is about 38–41% of PH online payments; COD 11–23%"],
  ["Show ratings and sold counts", "64% rank platform reviews as their top source (HKTDC 2025)"],
  ["Give an arrival date range", "70%+ expect delivery within 3 days"],
  ["Use Shopee’s words: Cart, Check out, Buy now, Place order", "Familiar labels (Jakob’s Law)"],
  ["Write ₱230.00 and 0917 123 4567", "Local formats"],
];

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 border-t border-line py-14">
      <h2 id={`${id}-h`} className="font-display text-[32px] leading-tight sm:text-[40px]">{title}</h2>
      {intro && <p className="mt-2 max-w-[68ch] text-[16px] text-muted">{intro}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

const nav = [
  ["principles", "Principles"], ["color", "Color"], ["type", "Type"], ["buttons", "Buttons"], ["chips", "Chips and icons"],
  ["scale", "Card scale"], ["tones", "Family colors"], ["categories", "Categories"], ["cards", "Cards"], ["forms", "Forms"], ["cart", "Cart bar"], ["flow", "PH buy flow"],
];

export default function StyleGuide() {
  const demo = ["strawberry", "ube-powder"].map(getProduct).filter((p) => p != null);
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-10 pt-10 sm:px-6 lg:px-8">
      <p className="eyebrow text-amber-700">PURE · plain system</p>
      <h1 className="font-display mt-3 text-[48px] leading-none sm:text-[64px]">Style guide</h1>
      <p className="mt-4 max-w-[64ch] text-[17px] text-muted">
        White, green and dark grey. No glass, textures or pointer effects: the flow does the work. Every value here comes from the theme block at the end of
        <code className="mx-1 rounded bg-sand px-1.5 py-0.5 text-[14px]">globals.css</code>
        and the components in <code className="rounded bg-sand px-1.5 py-0.5 text-[14px]">src/components/ui/</code>.
      </p>
      <nav aria-label="Style guide sections" className="mt-6 flex flex-wrap gap-2">
        {nav.map(([id, l]) => (
          <a key={id} href={`#${id}`} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-[14px] hover:border-ink/40">
            {l}
          </a>
        ))}
      </nav>

      <Section id="principles" title="Principles">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Shopee habits first", "Filipino shoppers already know the Shopee flow. Copy its order and words; keep PURE’s look."],
            ["Facts over mood", "Price, size, delivery fee and payment answer the questions people would otherwise message about."],
            ["One green action", "Each view has one filled green button. Everything else is outlined, a link or a chip."],
            ["Plain and fast", "White surfaces, hairline borders, no blur or glass. Phones first; 44px touch targets."],
          ].map(([t, d], i) => (
            <li key={t}>
              <Card padding="md" className="h-full">
                <span className="text-[13px] font-semibold text-amber-700">0{i + 1}</span>
                <CardTitle size="sm" className="mt-1">{t}</CardTitle>
                <CardText className="mt-2 text-muted">{d}</CardText>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="color" title="Color" intro="Green is the only accent. In code it is still named amber-* (the theme remaps it), so rename in one pass when the theme is final.">
        <div className="grid grid-cols-5 overflow-hidden rounded-xl border border-line sm:grid-cols-10">
          {greens.map(([s, h]) => (
            <div key={s}>
              <div className="h-16" style={{ background: h }} />
              <div className="px-2 py-2 text-[12px]">
                <b className="block">{s}</b>
                <span className="text-muted">{h}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-muted">600 is the primary button and selected chip; 700 is links and eyebrows; 100 badge fill; 50 hover tint.</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-5">
          {neutrals.map(([n, h, use]) => (
            <div key={n} className="overflow-hidden rounded-xl border border-line">
              <div className="h-14 border-b border-line" style={{ background: h }} />
              <div className="p-3 text-[13px]">
                <b className="block">{n}</b>
                <span className="text-muted">{h} · {use}</span>
              </div>
            </div>
          ))}
        </div>

        <table className="mt-8 w-full text-left text-[14px]">
          <caption className="sr-only">Contrast pairs</caption>
          <thead className="border-b border-line text-muted">
            <tr><th className="py-2 font-medium">Sample</th><th className="py-2 font-medium">Use</th><th className="py-2 text-right font-medium">Contrast</th></tr>
          </thead>
          <tbody>
            {pairs.map(([n, fg, bg, use]) => {
              const r = ratio(fg, bg);
              return (
                <tr key={n + bg} className="border-b border-line">
                  <td className="py-2"><span className="inline-block rounded-md px-3 py-1 font-semibold" style={{ color: fg, background: bg, boxShadow: "inset 0 0 0 1px #e2e5e3" }}>{n}</span></td>
                  <td className="py-2 text-muted">{use}</td>
                  <td className="py-2 text-right tabular-nums">{r.toFixed(1)}:1 <span className={r >= 4.5 ? "text-amber-700" : "text-danger"}>{r >= 4.5 ? "AA" : "fail"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Section>

      <Section id="type" title="Type" intro="Inter for everything, self-hosted. Headings semibold with tight tracking; body regular at 17px. Never below 13px.">
        <div className="divide-y divide-line border-y border-line">
          {type.map(([n, cls, use, sample]) => (
            <div key={n} className="grid gap-2 py-5 sm:grid-cols-[160px_1fr] sm:items-baseline">
              <div className="text-[13px] text-muted"><b className="block text-ink">{n}</b>{use}</div>
              <p className={n === "Display" || n === "H2" ? `font-display ${cls}` : cls}>{sample}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="buttons" title="Buttons" intro="Rounded pills from one component. One primary per view. Labels are verbs, sentence case, no punctuation.">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Shop flavors</Button>
          <Button variant="secondary">For business</Button>
          <Button variant="dark">Cart</Button>
          <Button variant="ghost">Recipes</Button>
          <Button variant="link">All recipes <ArrowRight className="h-4 w-4" aria-hidden /></Button>
          <Button disabled>Out of stock</Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button size="sm">Add to cart</Button>
          <Button size="md">Check out</Button>
          <Button size="lg">Place order · ₱460.00</Button>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl bg-amber-700 p-5">
          <Button variant="accent">Ask for business pricing</Button>
          <Button variant="inverse-outline">Learn more</Button>
        </div>
        <ul className="mt-6 grid gap-1 text-[14px] text-muted sm:grid-cols-2">
          <li><b className="text-ink">primary</b>: the action that moves a purchase forward</li>
          <li><b className="text-ink">secondary</b>: the alternative next to it</li>
          <li><b className="text-ink">dark</b>: the header cart button only</li>
          <li><b className="text-ink">accent / inverse-outline</b>: on the green band</li>
        </ul>
      </Section>

      <Section id="chips" title="Chips and icons" intro="Segmented control switches between product groups; chips filter. Filters carry a 16px Lucide outline icon at 1.75 stroke. On the shop, families and sort live behind the filter icon, which turns green and shows a count when a filter is on.">
        <ChipsDemo />
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:grid-cols-8">
          {Object.entries(filterIcons).map(([name, Icon]) => (
            <div key={name} className="flex flex-col items-center gap-2 rounded-xl border border-line p-3 text-center text-[12px]">
              <Icon className="h-5 w-5 text-amber-700" strokeWidth={1.75} aria-hidden />
              {name}
            </div>
          ))}
        </div>
        <p className="mt-2 text-[13px] text-muted">Add a filter value to <code className="rounded bg-sand px-1">src/lib/filter-icons.ts</code> and every chip with that label gets the icon.</p>
      </Section>

      <Section id="scale" title="Product card scale" intro="One ProductCard, four sizes. Same order everywhere: tags on top, name left, price right, then the action. Pick the size by the space, not the page.">
        <div className="grid gap-8">
          <div>
            <p className="mb-2 text-[13px] text-muted"><b className="text-ink">lg</b> · feature: photo, description, uses, full actions. One per section at most.</p>
            {demo[0] && <ProductCard p={demo[0]} size="lg" className="max-w-[860px]" />}
          </div>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="mb-2 text-[13px] text-muted"><b className="text-ink">md</b> · grid default: shop, collections, home, related.</p>
              <div className="grid grid-cols-2 gap-4">{demo.map((p) => <ProductCard key={p.id} p={p} />)}</div>
            </div>
            <div className="flex flex-col gap-6">
              <div>
                <p className="mb-2 text-[13px] text-muted"><b className="text-ink">row</b> · lists and narrow columns: search results, recipe ingredients. Icon-only cart button.</p>
                <div className="flex flex-col gap-2">{demo.map((p) => <ProductCard key={p.id} p={p} size="row" />)}</div>
              </div>
              <div>
                <p className="mb-2 text-[13px] text-muted"><b className="text-ink">mini</b> · cart, order summary, suggestions. No action.</p>
                <div className="max-w-[360px] rounded-2xl border border-line p-1">{demo.map((p) => <ProductCard key={p.id} p={p} size="mini" />)}</div>
              </div>
            </div>
          </div>
          <table className="w-full text-left text-[14px]">
            <caption className="sr-only">Card scale reference</caption>
            <thead className="border-b border-line text-muted">
              <tr><th className="py-2 pr-4 font-medium">Size</th><th className="py-2 pr-4 font-medium">Photo</th><th className="py-2 pr-4 font-medium">Name / price</th><th className="py-2 pr-4 font-medium">Action</th><th className="py-2 font-medium">Columns</th></tr>
            </thead>
            <tbody>
              {[
                ["lg", "Square, left half", "30 / 22px", "Add to cart + view", "1"],
                ["md", "4:3.4 with tags on it", "17 / 16px", "Add to cart, full width", "2 phone, 3 tablet, 4 desktop"],
                ["row", "80px square", "16 / 15px", "Cart icon button", "1, or 2 on desktop"],
                ["mini", "48px square", "14 / 14px", "None (whole row links)", "1"],
              ].map((r) => (
                <tr key={r[0]} className="border-b border-line">{r.map((c, i) => <td key={i} className={i === 0 ? "py-2 pr-4 font-semibold" : "py-2 pr-4 text-muted"}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="tones" title="Family colors" intro="Each family is a trio from one hue, the way Calendly builds its palette: a pale ground, a vivid mid for shapes and accents, and a deep shade for text and icons. Deep on pale is 6.5 to 9.3:1. Product cards stay white; families show as pale tags with deep text. Colors live in src/lib/tones.ts.">
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {Object.entries(familyColors).map(([family, t]) => (
            <div key={family} className="overflow-hidden rounded-xl border border-line">
              <div className="p-3" style={{ background: t.pale, color: t.deep }}>
                <b className="block text-[15px]">{t.name}</b>
                <span className="block text-[13px]">{family}</span>
              </div>
              <div className="h-8" style={{ background: t.mid }} />
              <div className="h-6" style={{ background: t.deep }} />
              <p className="px-3 py-2 text-[11px] leading-relaxed text-muted tabular-nums">{t.pale}<br />{t.mid}<br />{t.deep}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="categories" title="Shop by category" intro="Tinted tiles, one per collection: icon and count, label, and a product photo fading in from the right. Dark grey text on every tint.">
        <CategoryTiles />
      </Section>

      <Section id="cards" title="Cards" intro="Panels are white with a hairline border; one green band per page.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card padding="md">
            <CardEyebrow>Surface</CardEyebrow>
            <CardTitle className="mt-2">Delivery nationwide</CardTitle>
            <CardText className="mt-2 text-muted">Bordered white panel for steps, summaries and help.</CardText>
            <CardFooter><Button variant="secondary" size="sm">Read more</Button></CardFooter>
          </Card>
          <Card variant="brand" padding="md">
            <CardEyebrow className="text-white/80">Brand band</CardEyebrow>
            <CardTitle className="mt-2">Run a café?</CardTitle>
            <CardText className="mt-2">One per page, for the business offer.</CardText>
            <CardFooter><Button variant="accent" size="sm">Business pricing</Button></CardFooter>
          </Card>
        </div>
        <Card variant="notice" padding="sm" radius="md" className="mt-6 text-[13px]">Notice: dashed outline, for staging or missing-data messages only.</Card>
      </Section>

      <Section id="forms" title="Forms" intro="Labels above, always visible. 48px fields, 16px text so iOS doesn’t zoom. Phone as 09XX XXX XXXX; address as Province, then City, then Barangay.">
        <div className="grid gap-10 lg:grid-cols-2">
          <FormSection step={1} title="Contact information" active>
            <div className="grid gap-4">
              <Field label="Full name"><Input placeholder="Juan dela Cruz" /></Field>
              <Field label="Mobile number" hint="For delivery updates"><Input inputMode="tel" placeholder="0917 123 4567" /></Field>
              <Field label="Province"><Select defaultValue=""><option value="" disabled>Choose your province</option><option>Bulacan</option></Select></Field>
              <Field label="Landmark" optional><Input placeholder="Green gate beside the sari-sari store" /></Field>
              <Checkbox label="I’m ordering for a business" />
            </div>
          </FormSection>
          <FormSection step={3} title="Payment">
            <div className="flex flex-col gap-3">
              <RadioCard name="sg-pay" title="GCash" description="Number sent with your order confirmation." mark={<PaymentMark method="gcash" />} />
              <RadioCard name="sg-pay" title="Maya" description="Number sent with your order confirmation." mark={<PaymentMark method="maya" />} />
              <RadioCard name="sg-pay" title="Cash on delivery" description="Pay the courier when it arrives." defaultChecked />
            </div>
            <div className="mt-6 flex items-center gap-4">
              <QuantityDemo />
              <span className="text-[14px] text-muted">Quantity stepper</span>
            </div>
          </FormSection>
        </div>
      </Section>

      <Section id="cart" title="Cart bar" intro="Pinned to the bottom once the cart has items. Shows count, subtotal and Check out; tapping the left opens the cart. It also carries the “added to your cart” message. Hidden on checkout, while the cart is open, and on phones on product pages, where the buy bar sits.">
        <div className="flex justify-center rounded-2xl bg-sand px-4 py-10">
          <CartBarDemo />
        </div>
      </Section>

      <Section id="flow" title="PH buy flow" intro="Nine in ten Filipino online shoppers use Shopee, so the flow follows its order and words (Jakob’s Law). Only the flow is borrowed; the look stays PURE.">
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {flow.map(([t, d, n], i) => (
            <li key={t} className="rounded-xl border border-line p-4">
              <span className="text-[13px] font-semibold text-amber-700">{i + 1}</span>
              <h3 className="mt-1 text-[17px] font-semibold">{t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed">{d}</p>
              <p className="mt-2 text-[13px] text-muted">{n}</p>
            </li>
          ))}
        </ol>
        <table className="mt-10 w-full text-left text-[14px]">
          <caption className="sr-only">Buy-flow rules and evidence</caption>
          <thead className="border-b border-line text-muted">
            <tr><th className="py-2 pr-4 font-medium">Rule</th><th className="py-2 font-medium">Why</th></tr>
          </thead>
          <tbody>
            {rules.map(([r, w]) => (
              <tr key={r} className="border-b border-line align-top">
                <td className="py-2.5 pr-4 font-medium">{r}</td>
                <td className="py-2.5 text-muted">{w}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[13px] text-muted">
          Still needed from PURE: delivery fees by area and the free-delivery amount, bottle size and dosage, Shopee store link and rating, GCash and Maya numbers, and which chat app customers use.
        </p>
      </Section>
    </div>
  );
}
