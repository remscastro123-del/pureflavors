"use client";

import { motion, useReducedMotion } from "motion/react";
import { Check } from "lucide-react";
import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";

// React Bits Pro how-it-works-4, harmonized to PURE: brand tokens, page type scale, content via props.
export type Stage = { label: string; title: string; items: string[] };

export default function HowItWorks4({
  eyebrow,
  title,
  stages,
}: {
  eyebrow: string;
  title: string;
  stages: Stage[];
}) {
  const reduce = useReducedMotion();
  const anim = (delay: number, y = 16) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.5, ease: "easeOut" as const, delay } };

  return (
    <section className="w-full py-16 sm:py-20">
      <motion.div {...anim(0)} className="flex flex-col gap-3">
        <h2 className="font-display max-w-[22ch] text-[36px] leading-tight sm:text-[48px]">{title}</h2>
      </motion.div>

      <div className="relative mt-10 hidden md:block">
        <div className="grid grid-cols-3">
          {stages.map((s, i) => (
            <motion.div key={s.label} {...anim(0.08 * i, 10)} className="flex justify-center">
              <span className="rounded-full bg-white/65 px-4 ring-1 ring-black/[.06] backdrop-blur py-1.5 text-[14px] font-semibold">{s.label}</span>
            </motion.div>
          ))}
        </div>
        <div className="relative mt-4 flex h-3 items-center">
          <div className="absolute left-[16.66%] right-[16.66%] h-px bg-line" />
          {stages.map((s, i) => (
            <span
              key={s.label}
              className="absolute h-3 w-3 rounded-full border-2 border-amber-600 bg-white"
              style={{ left: `calc(${16.66 + 33.33 * i}% - 6px)` }}
            />
          ))}
        </div>
      </div>

      <ol className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        {stages.map((s, i) => (
          <motion.li key={s.label} {...anim(0.08 * i)}>
            <Card padding="md" className="h-full gap-4">
            <CardEyebrow className="md:hidden">{s.label}</CardEyebrow>
            <CardTitle>{s.title}</CardTitle>
            <ul className="flex flex-col gap-2.5">
              {s.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-[15px] text-ink/85">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" strokeWidth={2.5} aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            </Card>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
