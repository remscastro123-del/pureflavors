import Link from "next/link";
import { ArrowUpRight, MapPin, MessageCircle } from "lucide-react";
import { collections, site } from "@/lib/catalog";
import { PaymentMark, PaymentMarks } from "@/components/payment-mark";

/**
 * Footer in the Calendly format: a dark rounded panel inset from the page. Big statement top-left, logo bottom-left,
 * link columns on the right, then a bottom row with payments, small print and policy links.
 */
const columns: { title: string; links: [string, string][] }[] = [
  { title: "Shop", links: [["All products", "/shop/"], ...collections.map((c) => [c.label, `/collections/${c.slug}/`] as [string, string])] },
  { title: "Make", links: [["Recipes", "/recipes/"], ["For business", "/business/"]] },
  { title: "Help", links: [["How ordering works", "/help/"], ["Payment", "/help/#payment"], ["Delivery", "/help/#delivery"], ["Returns", "/help/#returns"], ["Contact", "/contact/"]] },
  { title: "Company", links: [["About PURE", "/about/"], ["Store policies", "/policies/"]] },
];

const policies: [string, string][] = [
  ["Privacy", "/privacy/"],
  ["Terms", "/terms/"],
  ["Shipping", "/shipping/"],
  ["Returns and refunds", "/returns/"],
  ["Affiliate disclosure", "/affiliate-disclosure/"],
];

export function SiteFooter() {
  return (
    <footer className="mx-2 mb-2 mt-24 rounded-[28px] bg-[#0f2a1e] text-white sm:mx-3 sm:mb-3 sm:rounded-[36px]">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-6 pb-10 pt-14 sm:px-10 lg:grid-cols-[1fr_1.6fr] lg:px-14 lg:pt-20">
        <div className="flex flex-col justify-between gap-10">
          <p className="font-display max-w-[14ch] text-[36px] leading-[1.05] sm:text-[48px]">A world of flavor in every drop.</p>
          <div>
            <img src="/media/pure-logo.svg" alt="PURE" width={120} height={44} className="h-11 w-auto brightness-0 invert" />
            <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-white/70">
              {site.company}
              <br />
              {site.address}
            </p>
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="text-[15px] font-semibold">{col.title}</p>
              <ul className="mt-3 space-y-0.5">
                {col.links.map(([l, h]) => (
                  <li key={h}>
                    <Link href={h} className="inline-flex min-h-9 items-center text-[14px] text-white/75 hover:text-white">
                      {l}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-8 gap-y-4 px-6 pb-6 sm:px-10 lg:px-14">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[13px] text-white/70">We accept</span>
          <PaymentMarks tone="dark" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={site.whatsappUrl} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[13px] hover:bg-white/20">
            <MessageCircle className="h-4 w-4" aria-hidden />
            WhatsApp {site.whatsapp}
          </a>
          <a href={site.mapUrl} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[13px] hover:bg-white/20">
            <MapPin className="h-4 w-4" aria-hidden />
            Plaridel, Bulacan
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 px-6 py-5 text-[13px] text-white/60 sm:px-10 lg:px-14">
        <nav aria-label="Store policies" className="flex flex-wrap gap-x-5">
          {policies.map(([l, h]) => (
            <Link key={h} href={h} className="inline-flex min-h-9 items-center hover:text-white">
              {l}
            </Link>
          ))}
        </nav>
        <p>© {new Date().getFullYear()} PURE. All rights reserved.</p>
      </div>
    </footer>
  );
}
