import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { delivery } from "@/lib/delivery";
import { money } from "@/lib/utils";
import { site } from "@/lib/catalog";
import { PaymentMark, PaymentMarks } from "@/components/payment-mark";
import { PageHero, PageSheet } from "@/components/page-hero";
import { FinalCta } from "@/components/home-sections";

export const metadata: Metadata = pageMeta({
  title: "Help",
  description: "How to order PURE flavors, payment, delivery fees, order updates and returns. Questions? Message PURE on WhatsApp.",
  path: "/help/",
});

const fee = delivery.flatFee;
const free = delivery.freeDeliveryFrom;

const topics: { id: string; title: string; items: [string, ReactNode][] }[] = [
  {
    id: "ordering",
    title: "Ordering",
    items: [
      ["How do I order?", <>Add flavors to your cart, tap <b>Check out</b>, enter your address and choose how to pay. You’ll get an order summary right away.</>],
      ["Can I order without an account?", "Yes. Checkout only asks for your name, mobile number and address."],
      ["Do you sell on Shopee too?", site.shopeeUrl ? <>Yes, at <a className="underline" href={site.shopeeUrl}>our Shopee store</a>. Prices, vouchers and returns there follow Shopee’s rules.</> : "Some items are also on Shopee. Purchases there follow Shopee’s rules for vouchers and returns."],
    ],
  },
  {
    id: "payment",
    title: "Payment",
    items: [
      ["How can I pay?", <>Cash on delivery, GCash or Maya. With COD you pay the courier when the order arrives.<PaymentMarks className="mt-3 flex" /></>],
      ["How does GCash or Maya work here?", "Send the total to the number shown at checkout, then type the reference number from your receipt. We confirm the payment before dispatch."],
    ],
  },
  {
    id: "delivery",
    title: "Delivery",
    items: [
      ["How much is delivery?", fee == null ? "It depends on your area and the courier. We confirm the fee with you before dispatch, so there are no surprises on delivery day." : <>Delivery is {money(fee)}{free != null && <>, free from {money(free)}</>}.</>],
      ["Where do you deliver?", "Anywhere in the Philippines our couriers reach. We ship from Plaridel, Bulacan."],
      ["How do I track my order?", <>We message your mobile number when it ships, with the courier and tracking number. Lost the message? Send us your order number on <a className="underline" href={site.whatsappUrl}>WhatsApp</a>.</>],
    ],
  },
  {
    id: "returns",
    title: "Returns",
    items: [
      ["Something arrived damaged or wrong.", <>Send a photo and your order number within the window in our <Link className="underline" href="/returns/">returns policy</Link> and we’ll sort it out.</>],
    ],
  },
];

export default function HelpPage() {
  return (
    <>
      <PageHero eyebrow="Help centre" title="How can we help?" intro="Ordering, payment, delivery and returns, answered." />
    <div className="mx-auto max-w-[860px] px-4 sm:px-6 pt-4">
      <nav aria-label="Help topics" className="mt-6 flex flex-wrap gap-2">
        {topics.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-[14px] hover:border-amber-600 hover:text-amber-700">
            {t.title}
          </a>
        ))}
      </nav>

      {topics.map((t) => (
        <section key={t.id} id={t.id} aria-labelledby={`${t.id}-h`} className="mt-12">
          <h2 id={`${t.id}-h`} className="text-[24px] font-semibold">{t.title}</h2>
          <div className="mt-3 divide-y divide-line border-y border-line">
            {t.items.map(([q, a]) => (
              <details key={q} className="group py-1">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-medium">
                  {q}
                  <Plus aria-hidden className="h-5 w-5 shrink-0 text-amber-700 transition group-open:rotate-45" />
                </summary>
                <p className="pb-4 text-[16px] leading-relaxed text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-14 rounded-2xl bg-sand p-6 sm:p-8">
        <h2 className="text-[22px] font-semibold">Still stuck?</h2>
        <p className="mt-2 text-muted">Message us with your order number and we’ll reply during business hours.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href={site.whatsappUrl} size="lg">WhatsApp · {site.whatsapp}</Button>
          <Button href="/contact/" variant="secondary" size="lg">Contact and location</Button>
        </div>
      </section>
    </div>
      <FinalCta />
    </>
  );
}
