"use client";

import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useBag } from "@/lib/bag";
import { AddressFields } from "@/components/address-fields";
import { photo, site } from "@/lib/catalog";
import { deliveryFor } from "@/lib/delivery";
import { money } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardText, CardTitle } from "@/components/ui/card";
import { Checkbox, Field, FormSection, Input, RadioCard, Textarea } from "@/components/ui/form";
import { PaymentMark, PaymentMarks } from "@/components/payment-mark";

type Placed = { id: string; name: string; total: number; fee: number | null; payment: Payment };

/* Same order as Shopee and Lazada: e-wallets first, then cash on delivery. */
const payments = {
  gcash: { title: "GCash", description: "We send our GCash number with your order confirmation. Reply with the reference number." },
  maya: { title: "Maya", description: "We send our Maya number with your order confirmation. Reply with the reference number." },
  cod: { title: "Cash on delivery", description: "Pay the courier when your order arrives." },
} as const;
type Payment = keyof typeof payments;

/**
 * Staging checkout: validates and shows the confirmation, but sends nothing (Talkerstein Vercel SOP:
 * no API routes or real form submission on staging). Wire to the order API at the production pass.
 */
export function CheckoutForm() {
  const { lines, subtotal, ready, clear, setOpen } = useBag();
  const [business, setBusiness] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const [step, setStep] = useState(1);
  const fee = deliveryFor(subtotal);

  if (placed) {
    return (
      <div className="mx-auto flex max-w-[640px] flex-col items-center py-10 text-center">
        <div aria-hidden className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-600 text-white"><Check className="h-10 w-10" strokeWidth={2.5} /></div>
        <h1 className="font-display mt-6 text-[44px] leading-tight">Thank you, {placed.name}.</h1>
        <p className="mt-3 text-[17px]">
          Your order <strong>{placed.id}</strong> is pending confirmation.
        </p>
        <Card padding="md" className="mt-6 w-full max-w-[360px] text-left">
          <dl className="grid grid-cols-[1fr_auto] gap-y-2 text-[15px]">
            <dt>Order total</dt>
            <dd className="font-semibold tabular-nums">{money(placed.total)}</dd>
            <dt>Payment</dt>
            <dd>{payments[placed.payment].title}</dd>
            <dt>Delivery</dt>
            <dd>{placed.fee == null ? "Confirmed before dispatch" : money(placed.fee)}</dd>
          </dl>
        </Card>
        <p className="mt-6 max-w-[48ch] text-[15px] text-muted">
          We’ll check availability and your delivery details, then confirm on WhatsApp or email
          {placed.payment === "cod" ? "" : ` with our ${payments[placed.payment].title} number`}. We text you again when it ships. Questions? WhatsApp {site.whatsapp} with your order number.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button href="/recipes/">Try a recipe while you wait <ArrowRight className="h-4 w-4" aria-hidden /></Button>
          <Button href="/shop/" variant="secondary">
            Back to the shop
          </Button>
        </div>
        <Card variant="notice" padding="sm" radius="md" className="mt-10 text-[13px]">
          Staging preview: no order was sent and no data left this browser.
        </Card>
      </div>
    );
  }

  if (ready && lines.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <h1 className="font-display text-[40px]">Your cart is empty.</h1>
        <p className="mt-2 text-muted">Pick a flavor to get started.</p>
        <Button href="/shop/" className="mt-6">
          Shop flavors
        </Button>
      </div>
    );
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const id = `PURE-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    setPlaced({ id, name: String(form.get("name")).split(" ")[0], total: subtotal + (fee ?? 0), fee, payment: form.get("payment") as Payment });
    clear();
    scrollTo({ top: 0 });
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <form
        onSubmit={submit}
        className="flex min-w-0 flex-col gap-10"
        onFocusCapture={(e) => {
          const n = Number((e.target as HTMLElement).closest("fieldset")?.dataset.step);
          if (n) setStep((s) => Math.max(s, n));
        }}
      >
        <div>
          <h1 className="font-display text-[44px] leading-tight sm:text-[52px]">Checkout</h1>
          <p className="mt-1 text-muted">Three short steps. Guest checkout, no account needed.</p>
        </div>

        <FormSection step={1} title="Contact information" active={step >= 1}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" className="sm:col-span-2">
              <Input name="name" autoComplete="name" required maxLength={100} />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" autoComplete="email" inputMode="email" required />
            </Field>
            <Field label="Mobile number">
              <Input name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="09XX XXX XXXX" pattern="[0-9 +\-]{10,16}" title="A Philippine mobile number, e.g. 0917 123 4567" />
            </Field>
          </div>
          <Checkbox label="I’m ordering for a business" checked={business} onChange={(e) => setBusiness(e.target.checked)} className="mt-2" />
          {business && (
            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <Field label="Business name">
                <Input name="company" autoComplete="organization" required />
              </Field>
              <Field label="TIN" optional hint="For invoicing">
                <Input name="tin" inputMode="numeric" placeholder="000-000-000-000" />
              </Field>
            </div>
          )}
        </FormSection>

        <FormSection step={2} title="Delivery address" active={step >= 2}>
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Province → City → Barangay from PSGC lists, like Shopee and Lazada */}
            <AddressFields />
            <Field label="House or unit, street, building" className="sm:col-span-2">
              <Textarea name="address" autoComplete="address-line1" required maxLength={250} rows={2} />
            </Field>
            <Field label="Postal code">
              <Input name="postal" autoComplete="postal-code" inputMode="numeric" required maxLength={10} />
            </Field>
            <Field label="Landmark or delivery notes" optional className="sm:col-span-2">
              <Input name="notes" maxLength={200} placeholder="e.g. green gate beside the sari-sari store" />
            </Field>
          </div>
        </FormSection>

        <FormSection step={3} title="Payment" active={step >= 3}>
          <div className="flex flex-col gap-3">
            {(Object.keys(payments) as Payment[]).map((k) => (
              <RadioCard key={k} name="payment" value={k} defaultChecked={k === "cod"} required {...payments[k]} mark={<PaymentMark method={k} />} />
            ))}
          </div>
          <Checkbox
            name="accepted"
            required
            className="mt-4"
            label={
              <>
                I agree to receive order and delivery updates by email and accept the{" "}
                <Link href="/terms/" className="underline">Terms</Link> and <Link href="/privacy/" className="underline">Privacy Policy</Link>.
              </>
            }
          />
        </FormSection>

        <Button type="submit" size="lg" full className="min-h-14 text-[17px]">
          Place order · {money(subtotal + (fee ?? 0))}
        </Button>
      </form>

      <Card as="aside" aria-label="Order summary" padding="md" className="h-fit lg:sticky lg:top-24">
        <div className="flex items-baseline justify-between gap-3">
          <CardTitle as="h2" size="lg">Order summary</CardTitle>
          <Button variant="link" size="sm" onClick={() => setOpen(true)}>
            Edit cart
          </Button>
        </div>
        <ul className="mt-4 divide-y divide-black/[.08]">
          {lines.map(({ product: p, qty }) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <img src={photo(p.photos[0])} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{p.name}</p>
                <p className="text-[13px] text-muted">{[p.size, `Qty ${qty}`].filter(Boolean).join(" · ")}</p>
              </div>
              <span className="tabular-nums">{p.price == null ? "On request" : money(p.price * qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid grid-cols-[1fr_auto] gap-y-2 border-t border-black/[.08] pt-4 text-[15px]">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{money(subtotal)}</dd>
          <dt>Delivery</dt>
          <dd className="text-right">{fee == null ? "Confirmed before dispatch" : money(fee)}</dd>
          <dt className="pt-2 text-[18px] font-semibold">Total</dt>
          <dd className="pt-2 text-[18px] font-semibold tabular-nums">{money(subtotal + (fee ?? 0))}</dd>
        </dl>
        {fee == null && (
          <CardText className="mt-3 text-[13px] text-muted">
            The delivery fee depends on your location and courier. We confirm it with you before dispatch. See the{" "}
            <Link href="/shipping/" className="underline">shipping policy</Link>.
          </CardText>
        )}
      </Card>
    </div>
  );
}
