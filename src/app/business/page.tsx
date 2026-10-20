import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardMedia, CardText, CardTitle } from "@/components/ui/card";
import HowItWorks4 from "@/components/blocks/how-it-works-4";
import FAQ1 from "@/components/blocks/faq-1";
import { BusinessForm } from "@/components/business-form";
import { Reveal } from "@/components/reveal";
import { photo, products } from "@/lib/catalog";
import { PageHero, PageSheet } from "@/components/page-hero";
import { FinalCta } from "@/components/home-sections";

export const metadata: Metadata = pageMeta({
  title: "Flavor concentrates for bakeries, cafés and milk-tea shops",
  description: "Order PURE flavor concentrates and baking powders in volume for your bakery, café, milk-tea shop or food business. Tell us what you make and we'll quote pack sizes and pricing.",
  path: "/business/",
  image: "/media/og/business.jpg",
});

// Copy here is new (the old site had no business page). Anything about pack sizes, terms or documents is phrased
// as "ask us" until PURE confirms what it offers. See README → Content PURE needs to confirm.
const segments = [
  { title: "Bakeries and pastry shops", body: "Ube, cheese and cocoa powders, plus flavors like cheesecake and cinnamon roll.", img: "ube-powder" },
  { title: "Cafés and milk-tea shops", body: "Matcha, mocha, coffee, lychee and fruit flavors for drinks, syrups and toppings.", img: "matcha" },
  { title: "Food makers and caterers", body: "Creamy, sweet and savory flavors for desserts, fillings and snacks made in batches.", img: "custard" },
];

export default function BusinessPage() {
  return (
    <>
    <PageSheet>
      <section id="inquiry" aria-labelledby="inquiry-title" className="grid scroll-mt-24 items-start gap-10 pt-4 sm:pt-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="lg:sticky lg:top-28">
          <h1 id="inquiry-title" className="font-display text-[40px] leading-[1.03] tracking-tight sm:text-[60px] lg:text-[64px]">
            Ask for <span className="text-amber-700">business pricing.</span>
          </h1>
          <p className="mt-5 max-w-[46ch] text-[18px] leading-relaxed text-muted">
            For bakeries, cafés, milk-tea shops and food makers who use PURE every week. Four quick steps; rough numbers are fine, and we’ll reply with pack sizes and pricing.
          </p>
          <ul className="mt-6 flex flex-wrap gap-2">
            {["mango", "ube-powder", "coffee", "strawberry"].map((id) => {
              const p = products.find((x) => x.id === id);
              return p ? (
                <li key={id} className="h-16 w-16 overflow-hidden rounded-2xl bg-white shadow-sm">
                  <img src={photo(p.photos[0])} alt={`PURE ${p.name}`} className="h-full w-full object-cover" />
                </li>
              ) : null;
            })}
          </ul>
          <Button href="/shop/" variant="secondary" size="lg" className="mt-7">
            Browse the shop
          </Button>
        </div>
        <BusinessForm />
      </section>
    </PageSheet>
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">

      <section aria-labelledby="who" className="pt-20 sm:pt-24">
        <Reveal>
          <h2 id="who" className="font-display mt-3 text-[36px] leading-tight sm:text-[48px]">Made for kitchens that run every day.</h2>
        </Reveal>
        <ul className="mt-8 grid gap-5 md:grid-cols-3">
          {segments.map((s, i) => {
            const p = products.find((x) => x.id === s.img);
            return (
              <li key={s.title}>
                <Reveal delay={0.06 * i} className="h-full">
                  <Card className="h-full">
                    {p && <CardMedia src={photo(p.photos[0])} alt="" ratio="16/10" rounded={false} zoom={false} />}
                    <CardBody className="p-6">
                      <CardTitle>{s.title}</CardTitle>
                      <CardText className="mt-2">{s.body}</CardText>
                    </CardBody>
                  </Card>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      <HowItWorks4
        eyebrow="How it works"
        title="From first message to regular orders."
        stages={[
          { label: "Step 1", title: "Tell us what you need.", items: ["Fill in the form at the top or message us on WhatsApp", "List the flavors you use and roughly how much", "Say where you need delivery"] },
          { label: "Step 2", title: "Get a quote.", items: ["PURE replies with available pack sizes", "Pricing for your volume", "Delivery options for your area"] },
          { label: "Step 3", title: "Reorder easily.", items: ["Order again by message or through the shop", "Cash on delivery available", "One contact who knows your account"] },
        ]}
      />


      <FAQ1
        title="Business FAQs"
        intro="What bakeries and cafés usually ask before their first order."
        faqs={[
          { question: "Do you sell larger pack sizes?", answer: "Tell us which flavors you use and how much, and we’ll reply with the pack sizes available for them and pricing for your volume." },
          { question: "Is there a minimum order?", answer: "Ask us with your expected volume. Small shops can also order straight from the website at retail prices any time." },
          { question: "How do I pay?", answer: "Website orders are cash on delivery. Payment arrangements for regular business orders are agreed with PURE when your account is set up." },
          { question: "Do you deliver outside Bulacan?", answer: "Delivery availability depends on your location and the couriers serving it. Include your city in the inquiry and we’ll confirm options and fees." },
          { question: "Can I get ingredient and allergen details?", answer: "List the details you need for your kitchen or labels in your inquiry, and PURE will send what’s available for those products." },
        ]}
      />
    </div>
      <FinalCta />
    </>
  );
}
