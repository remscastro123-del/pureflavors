import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardEyebrow, CardFooter, CardTitle } from "@/components/ui/card";
import { site } from "@/lib/catalog";
import { PaymentMark, PaymentMarks } from "@/components/payment-mark";
import { PageHero, PageSheet } from "@/components/page-hero";
import { FinalCta } from "@/components/home-sections";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description: "Questions about a flavor, bottle sizes or pricing? Contact PURE on WhatsApp. Green Leaves | JNRM Corporation, Plaridel, Bulacan.",
  path: "/contact/",
});

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact PURE" title={<>Let’s talk <span className="text-amber-700">flavor.</span></>} intro="Questions about a flavor, bottle sizes or pricing?" />
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-0">

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <Card as="section" padding="lg">
          <CardTitle as="h2" size="lg">Our location</CardTitle>
          <p className="mt-4 text-[17px] leading-relaxed text-ink/80">
            {site.company}
            <br />
            {site.address}
          </p>
          <CardFooter className="flex-col items-stretch gap-2 pt-6">
            <Button href={site.whatsappUrl} variant="accent" size="lg" full>
              WhatsApp · {site.whatsapp}
            </Button>
            <Button href={site.mapUrl} variant="secondary" full>
              View our location <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Button>
          </CardFooter>
        </Card>
        <Card as="section" padding="lg">
          <CardEyebrow className="text-amber-700">Product inquiries</CardEyebrow>
          <CardTitle as="h2" size="lg" className="mt-3">Found your flavors?</CardTitle>
          <p className="mt-3 text-[17px] leading-relaxed text-ink/80">
            Add PURE products to your cart and check out with cash on delivery, GCash or Maya. Equipment affiliate purchases are completed on Shopee.
          </p>
          <PaymentMarks className="mt-3" />
          <CardFooter className="pt-6">
            <Button href="/shop/">Browse the flavors</Button>
            <Button href="/business/" variant="secondary">Business inquiries</Button>
          </CardFooter>
          <Button href="/policies/" variant="link" className="mt-2 self-start">
            Shipping, returns and privacy
          </Button>
        </Card>
      </div>
    </div>
      <FinalCta />
    </>
  );
}
