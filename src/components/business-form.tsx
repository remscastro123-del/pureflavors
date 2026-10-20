"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Coffee,
  Croissant,
  CupSoda,
  Droplet,
  Factory,
  Sparkles,
  Store,
  User,
  type LucideIcon,
} from "lucide-react";
import { photo, products, site } from "@/lib/catalog";
import { colorFor, familyColor } from "@/lib/tones";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";

/**
 * Business pricing inquiry as a four-step visual form:
 *   1 business type (icon cards) · 2 flavors (photo chips, pick several) · 3 monthly volume (droplet scale) · 4 contact.
 * Each step is checked before moving on; the last screen summarises what was sent.
 * Staging: validates and confirms in the page, sends nothing. Production pass: wire to email (Resend) or a CRM.
 */
const types: { label: string; Icon: LucideIcon; tone: string }[] = [
  { label: "Bakery or pastry shop", Icon: Croissant, tone: "Creamy" },
  { label: "Café or coffee shop", Icon: Coffee, tone: "Sweet" },
  { label: "Milk-tea or beverage shop", Icon: CupSoda, tone: "Drinks" },
  { label: "Restaurant or catering", Icon: ChefHat, tone: "Fruit" },
  { label: "Food manufacturer", Icon: Factory, tone: "Savory" },
  { label: "Reseller or distributor", Icon: Store, tone: "Bakery powder" },
  { label: "Something else", Icon: Sparkles, tone: "Equipment" },
];

const volumes: { label: string; hint: string; drops: number }[] = [
  { label: "Trying it out", hint: "Under 1 liter a month", drops: 1 },
  { label: "Steady", hint: "1 to 5 liters a month", drops: 2 },
  { label: "Busy", hint: "5 to 20 liters a month", drops: 3 },
  { label: "High volume", hint: "Over 20 liters a month", drops: 4 },
];

const steps: { title: string; Icon: LucideIcon }[] = [
  { title: "Your business", Icon: Store },
  { title: "Flavors", Icon: Droplet },
  { title: "How much", Icon: CupSoda },
  { title: "Contact", Icon: User },
];

export function BusinessForm() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState<string | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [unsure, setUnsure] = useState(false);
  const [volume, setVolume] = useState<string | null>(null);
  const [making, setMaking] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ name: string } | null>(null);
  const items = useMemo(() => products.filter((p) => p.collection !== "Equipment"), []);

  const next = () => {
    if (step === 0 && !type) return setError("Pick the kind of business you run.");
    if (step === 1 && !picked.length && !unsure) return setError("Pick at least one flavor, or choose “Not sure yet”.");
    if (step === 2 && !volume) return setError("Pick roughly how much you use.");
    setError(null);
    setStep((s) => s + 1);
  };
  const back = () => {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  };
  const toggle = (id: string) => {
    setUnsure(false);
    setPicked((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));
  };

  if (sent) {
    return (
      <div className="rounded-[40px] bg-white p-6 shadow-[0_24px_60px_-30px_rgb(0_0_0/.35)] sm:p-8">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-600 text-white animate-[vis-pop_.45s_cubic-bezier(.2,.9,.3,1.4)_both]">
          <Check className="h-7 w-7" strokeWidth={2.5} aria-hidden />
        </span>
        <h3 className="font-display mt-4 text-[30px] leading-tight">Thanks, {sent.name}. We’ve got your details.</h3>
        <p className="mt-2 text-[16px] text-muted">PURE will reply on WhatsApp or email with pack sizes and pricing. For anything urgent, message us on WhatsApp at {site.whatsapp}.</p>
        <dl className="mt-6 grid gap-3 rounded-[24px] bg-sand p-4 text-[14px] sm:grid-cols-3">
          <div><dt className="text-muted">Business</dt><dd className="font-semibold">{type}</dd></div>
          <div><dt className="text-muted">Flavors</dt><dd className="font-semibold">{unsure ? "Not sure yet" : `${picked.length} picked`}</dd></div>
          <div><dt className="text-muted">Volume</dt><dd className="font-semibold">{volume}</dd></div>
        </dl>
        <p className="mt-5 rounded-xl border border-dashed border-amber-600/50 px-3 py-2 text-[13px] text-amber-800">Staging preview: this inquiry was not sent.</p>
      </div>
    );
  }

  return (
    <form
      noValidate={step < 3}
      onSubmit={(e) => {
        e.preventDefault();
        if (step < 3) return next();
        const f = e.currentTarget;
        if (!f.checkValidity()) return f.reportValidity();
        setSent({ name: String(new FormData(f).get("name")).split(" ")[0] });
      }}
      className="rounded-[40px] bg-white p-5 shadow-[0_24px_60px_-30px_rgb(0_0_0/.35)] sm:p-7"
    >
      {/* progress: four step icons on a track that fills as you go */}
      <ol className="relative flex items-center justify-between" aria-label="Steps">
        <span aria-hidden className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-sand" />
        <span aria-hidden className="absolute left-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-amber-600 transition-[width] duration-500 ease-out" style={{ width: `calc((100% - 48px) * ${step / (steps.length - 1)})` }} />
        {steps.map((s, i) => (
          <li key={s.title} className="relative z-10 flex flex-col items-center gap-1.5">
            <span
              aria-current={i === step ? "step" : undefined}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-[14px] ring-[3px] ring-white transition-colors duration-300",
                i < step ? "bg-amber-600 text-white" : i === step ? "bg-amber-100 text-amber-800" : "bg-sand text-muted",
              )}
            >
              {i < step ? <Check className="h-5 w-5" strokeWidth={2.5} aria-hidden /> : <s.Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />}
            </span>
            <span className={cn("hidden text-[12px] font-medium sm:block", i === step ? "text-ink" : "text-muted")}>{s.title}</span>
          </li>
        ))}
      </ol>

      <div key={step} className="mt-6 animate-[step-in_.35s_ease-out] motion-reduce:animate-none">
        {step === 0 && (
          <fieldset>
            <legend className="font-display text-[26px] leading-tight sm:text-[30px]">What kind of business do you run?</legend>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {types.map(({ label, Icon, tone }) => {
                const c = familyColor(tone);
                const on = type === label;
                return (
                  <label
                    key={label}
                    className={cn("relative flex cursor-pointer flex-col items-start gap-3 rounded-[24px] p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5", on ? "ring-2" : "ring-0")}
                    style={{ background: c.pale, color: c.deep, ["--tw-ring-color" as string]: c.deep }}
                  >
                    <input type="radio" name="type" value={label} checked={on} onChange={() => setType(label)} className="sr-only" />
                    <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: on ? c.deep : c.mid, color: on ? "#fff" : c.deep }}>
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <span className="text-[14px] font-semibold leading-snug">{label}</span>
                    {on && <Check className="absolute right-3 top-3 h-5 w-5" strokeWidth={2.5} aria-hidden />}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset>
            <legend className="font-display text-[26px] leading-tight sm:text-[30px]">Which flavors are you after?</legend>
            <p className="mt-1 text-[14px] text-muted">Pick as many as you like. {picked.length > 0 && <b className="text-ink">{picked.length} picked.</b>}</p>
            <div className="no-scrollbar mt-4 grid max-h-[300px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
              {items.map((p) => {
                const on = picked.includes(p.id);
                const c = colorFor(p);
                return (
                  <label key={p.id} className={cn("flex min-w-0 cursor-pointer items-center gap-2 rounded-2xl p-1.5 pr-2.5 transition-colors", on ? "text-white" : "bg-sand hover:bg-[#ece9e1]")} style={on ? { background: c.deep } : undefined}>
                    <input type="checkbox" name="flavors" value={p.name} checked={on} onChange={() => toggle(p.id)} className="sr-only" />
                    <span className="relative shrink-0 overflow-hidden rounded-xl" style={{ background: c.pale }}>
                      <img src={photo(p.photos[0])} alt="" className="h-10 w-10 object-cover" loading="lazy" />
                      {on && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Check className="h-5 w-5 text-white" strokeWidth={3} aria-hidden />
                        </span>
                      )}
                    </span>
                    <span className="min-w-0 truncate text-[13px] font-semibold">{p.name.replace(/ (Flavor|Powder)$/i, "")}</span>
                  </label>
                );
              })}
            </div>
            <label className={cn("mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] font-medium", unsure ? "border-amber-600 bg-amber-50 text-amber-800" : "border-line")}>
              <input type="checkbox" checked={unsure} onChange={(e) => { setUnsure(e.target.checked); if (e.target.checked) setPicked([]); }} className="sr-only" />
              <Sparkles className="h-4 w-4" aria-hidden />
              Not sure yet, recommend some
            </label>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <legend className="font-display text-[26px] leading-tight sm:text-[30px]">Roughly how much do you use?</legend>
            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {volumes.map((v) => {
                const on = volume === v.label;
                return (
                  <label key={v.label} className={cn("flex cursor-pointer flex-col items-start gap-3 rounded-[24px] p-4 transition-colors", on ? "bg-amber-600 text-white" : "bg-sand hover:bg-[#ece9e1]")}>
                    <input type="radio" name="volume" value={v.label} checked={on} onChange={() => setVolume(v.label)} className="sr-only" />
                    <span className="flex items-end gap-0.5" aria-hidden>
                      {[1, 2, 3, 4].map((d) => (
                        <Droplet key={d} className={cn("transition-all", d <= v.drops ? "" : "opacity-25")} style={{ width: 10 + d * 3, height: 10 + d * 3 }} strokeWidth={2} fill={d <= v.drops ? "currentColor" : "none"} />
                      ))}
                    </span>
                    <span>
                      <span className="block text-[15px] font-semibold">{v.label}</span>
                      <span className={cn("block text-[12px]", on ? "text-white/85" : "text-muted")}>{v.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
            <Field label="What do you make with it?" optional className="mt-5">
              <Textarea name="making" rows={2} maxLength={600} value={making} onChange={(e) => setMaking(e.target.value)} placeholder="Milk tea, ensaymada, ube cheese pandesal…" />
            </Field>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="font-display text-[26px] leading-tight sm:text-[30px]">Where should we send pricing?</legend>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Your name"><Input name="name" autoComplete="name" required /></Field>
              <Field label="Business name"><Input name="company" autoComplete="organization" required /></Field>
              <Field label="City or province"><Input name="city" autoComplete="address-level2" required /></Field>
              <Field label="Mobile or Viber number"><Input name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="0917 123 4567" /></Field>
              <Field label="Email" className="sm:col-span-2"><Input name="email" type="email" autoComplete="email" required /></Field>
            </div>
            {/* earlier answers travel with the form */}
            <input type="hidden" name="type" value={type ?? ""} />
            <input type="hidden" name="volume" value={volume ?? ""} />
            <input type="hidden" name="flavors" value={unsure ? "Not sure yet" : picked.join(", ")} />
          </fieldset>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[14px] font-medium text-danger">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={back}>
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>
        ) : (
          <span className="text-[13px] text-muted">Step 1 of 4</span>
        )}
        <Button type="submit" size="lg">
          {step < 3 ? (
            <>
              Next
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          ) : (
            "Send inquiry"
          )}
        </Button>
      </div>
    </form>
  );
}
