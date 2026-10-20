import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { policyIndex } from "@/lib/policies";
import { PageHero, PageSheet } from "@/components/page-hero";

export const metadata: Metadata = pageMeta({
  title: "Store policies",
  description: "Clear information about ordering from PURE and how we handle your information.",
  path: "/policies/",
});

export default function PoliciesPage() {
  return (
    <>
      <PageHero eyebrow="PURE store" title="Store policies" intro={<>Clear information about ordering from PURE and how we handle your information.<span className="mt-2 block text-[14px]">Effective September 16, 2026</span></>} />
    <div className="mx-auto max-w-[920px] px-4 sm:px-6 pt-4">
      <ul className="mt-10 divide-y divide-black/[.08] border-y border-black/[.08]">
        {policyIndex.map((p) => (
          <li key={p.slug}>
            <Link href={`/${p.slug}/`} className="group flex items-center justify-between gap-6 py-6">
              <span>
                <span className="font-display block text-[26px] group-hover:text-amber-700">{p.title}</span>
                <span className="mt-1 block text-[16px] text-ink/75">{p.blurb}</span>
              </span>
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </div>
    </>
  );
}
