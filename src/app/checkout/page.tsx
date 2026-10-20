import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { CheckoutForm } from "@/components/checkout-form";
import { PageHero, PageSheet } from "@/components/page-hero";

export const metadata: Metadata = pageMeta({ title: "Checkout", description: "Complete your PURE order.", path: "/checkout/", noindex: true });

export default function CheckoutPage() {
  return (
    <PageSheet>
      <div className="mx-auto max-w-[1180px] pt-4">
        <CheckoutForm />
      </div>
    </PageSheet>
  );
}
