import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { getPolicy, policySlugs, type PolicySlug } from "@/lib/policies";
import { site } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { pageMeta } from "@/lib/seo";
import { PageHero, PageSheet } from "@/components/page-hero";

export const dynamicParams = false;
export function generateStaticParams() {
  return policySlugs.map((policy) => ({ policy }));
}

export async function generateMetadata({ params }: { params: Promise<{ policy: string }> }): Promise<Metadata> {
  const { policy } = await params;
  if (!policySlugs.includes(policy as PolicySlug)) return {};
  const p = getPolicy(policy as PolicySlug);
  return pageMeta({ title: p.title, description: p.intro, path: `/${policy}/` });
}

export default async function PolicyPage({ params }: { params: Promise<{ policy: string }> }) {
  const { policy } = await params;
  if (!policySlugs.includes(policy as PolicySlug)) notFound();
  const p = getPolicy(policy as PolicySlug);

  // Group consecutive <li> rows into lists.
  const blocks: ({ type: "h2" | "p"; text: string } | { type: "ul"; items: string[] })[] = [];
  for (const b of p.body) {
    const last = blocks[blocks.length - 1];
    if (b.type === "li") last?.type === "ul" ? last.items.push(b.text) : blocks.push({ type: "ul", items: [b.text] });
    else blocks.push({ type: b.type, text: b.text });
  }

  return (
    <>
      <PageHero breadcrumbs={<Breadcrumbs items={[{ name: "Store policies", path: "/policies/" }, { name: p.title, path: `/${policy}/` }]} />} eyebrow="Store policy" title={p.title} intro={<>{p.intro}<span className="mt-2 block text-[14px]">{p.effective}</span></>} />
    <article className="mx-auto max-w-[760px] px-4 sm:px-6 pt-2">
      <div className="mt-10 flex flex-col gap-4 text-[17px] leading-relaxed">
        {blocks.map((b, i) =>
          b.type === "h2" ? (
            <h2 key={i} className="font-display mt-6 text-[28px]">{b.text}</h2>
          ) : b.type === "ul" ? (
            <ul key={i} className="list-disc pl-6 text-ink/85">
              {b.items.map((x) => <li key={x}>{x}</li>)}
            </ul>
          ) : (
            <p key={i} className="text-ink/85">{b.text}</p>
          ),
        )}
      </div>
      <Button href={site.whatsappUrl} variant="secondary" className="mt-10">
        WhatsApp: {site.whatsapp}
      </Button>
    </article>
    </>
  );
}
