"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

// React Bits Pro faq-1 (two-column, sticky title), harmonized to PURE: brand tokens, props, aria-expanded, scroll reveal.
export default function FAQ1({ title, intro, faqs }: { title: string; intro: string; faqs: { question: string; answer: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();
  const base = useId();

  return (
    <section className="w-full py-16 sm:py-20">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div className="flex flex-col gap-3 lg:sticky lg:top-28 lg:self-start">
          <h2 className="font-display text-[36px] leading-tight sm:text-[48px]">{title}</h2>
          <p className="max-w-[30ch] text-[17px] leading-relaxed text-ink/75">{intro}</p>
        </div>

        <div className="flex flex-col">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div key={faq.question} className={`border-b border-black/[.08] ${index === 0 ? "border-t" : ""}`}>
                <h3>
                  <button
                    onClick={() => setOpenIndex(open ? null : index)}
                    aria-expanded={open}
                    aria-controls={`${base}-${index}`}
                    className="group flex w-full items-start justify-between gap-4 py-6 text-left"
                  >
                    <span className="text-[17px] font-semibold transition-colors group-hover:text-amber-700 sm:text-[18px]">{faq.question}</span>
                    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: reduce ? 0 : 0.3 }} className="mt-1 shrink-0">
                      <ChevronDown className="h-5 w-5 text-muted" aria-hidden />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`${base}-${index}`}
                      initial={reduce ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reduce ? undefined : { height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.3, ease: "easeInOut" }, opacity: { duration: 0.2 } }}
                      className="overflow-hidden"
                    >
                      <p className="max-w-[62ch] pb-6 pr-8 text-[16px] leading-relaxed text-ink/80">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
