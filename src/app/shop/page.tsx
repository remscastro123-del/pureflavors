import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { ShopBrowser } from "@/components/shop-browser";
import { FinalCta } from "@/components/home-sections";
import { DeepBlobs, Flow } from "@/components/intro-steps";

export const metadata: Metadata = pageMeta({
  title: "Shop flavor concentrates and baking powders",
  description: "Shop 37 PURE food flavor concentrates and 5 baking powders: mango, ube, matcha, vanilla and more. ₱230 per flavor, cash on delivery in the Philippines.",
  path: "/shop/",
  image: "/media/og/shop.jpg",
});

export default function ShopPage() {
  return (
    <>
      {/* one-line title in a pill that hugs the text, framed by the home slider's "Add a few drops" gradient (flow panel 2 + its deep blobs) */}
      <section className="relative mx-2 flex justify-center overflow-hidden rounded-b-[40px] rounded-t-[28px] px-3 py-10 sm:mx-3 sm:rounded-b-[64px] sm:py-16">
        <Flow x={1} />
        <DeepBlobs step={1} />
        <h1 className="relative whitespace-nowrap rounded-full bg-[#f6f4ef] px-5 py-3 font-display text-[clamp(20px,5.6vw,64px)] leading-none sm:px-10 sm:py-6">
          Find your next <span className="text-amber-700">ingredient.</span>
        </h1>
      </section>
      <p className="mx-auto mt-6 max-w-[720px] px-4 text-center text-[15px] text-muted sm:text-[17px]">
        Shop PURE food flavor concentrates and baking powders, from mango, ube and matcha to vanilla and milk tea. A few drops flavor cakes, frostings, drinks and desserts. ₱230 per flavor, delivered nationwide with cash on delivery across the Philippines.
      </p>
    <div className="mx-auto max-w-[1320px] px-4 pb-10 sm:px-6 lg:px-8 pt-6">
      <ShopBrowser />
    </div>
      <FinalCta />
    </>
  );
}
