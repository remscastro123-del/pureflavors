import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Interior page opener in the homepage style: the rounded off-white sheet (same shape as the home hero),
 * centred display headline and intro (no preheader), with optional breadcrumbs above and actions below.
 * `children` render inside the sheet under the intro (chips, tabs, a search bar).
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  breadcrumbs,
  actions,
  align = "center",
  children,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  breadcrumbs?: ReactNode;
  actions?: ReactNode;
  align?: "center" | "left";
  children?: ReactNode;
  className?: string;
}) {
  const center = align === "center";
  return (
    <section className={cn("mx-2 rounded-b-[40px] rounded-t-[28px] bg-[#f6f4ef] sm:mx-3 sm:rounded-b-[64px]", className)}>
      <div className={cn("mx-auto max-w-[1100px] px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-12", center && "text-center")}>
        {breadcrumbs && <div className={cn("mb-4", center && "flex justify-center")}>{breadcrumbs}</div>}
        <h1 className={cn("font-display text-[40px] leading-[1.03] tracking-tight sm:text-[60px] lg:text-[68px]", center && "mx-auto max-w-[18ch]")}>{title}</h1>
        {intro && <div className={cn("mt-5 max-w-[56ch] text-[17px] leading-relaxed text-muted sm:text-[18px]", center && "mx-auto")}>{intro}</div>}
        {actions && <div className={cn("mt-7 flex flex-wrap gap-3", center && "justify-center")}>{actions}</div>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

/** The same sheet with no headline, for pages that open with their own layout (product page, checkout). */
export function PageSheet({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("mx-2 rounded-b-[40px] rounded-t-[28px] bg-[#f6f4ef] sm:mx-3 sm:rounded-b-[64px]", className)}>
      <div className="mx-auto max-w-[1320px] px-4 pb-12 pt-6 sm:px-6 sm:pb-16 lg:px-8">{children}</div>
    </section>
  );
}
