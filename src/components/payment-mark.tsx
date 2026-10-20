import { Banknote } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Payment method marks, used everywhere a payment method is named.
 * GCash and Maya show their official logos from public/media/pay/ once the files are added there
 * (taken from each company's own website in October 2026; neither publishes a public press kit. Do not redraw them).
 * Until a logo file is set below, the mark falls back to a neutral name pill so nothing looks broken.
 */
export type PayMethod = "gcash" | "maya" | "cod";

export const payLogos: Record<Exclude<PayMethod, "cod">, string | null> = {
  gcash: "/media/pay/gcash-logo.avif", // from gcash.com (the logo GCash serves on its own site)
  maya: "/media/pay/maya-logo.svg", // from maya.ph (the header logo Maya serves on its own site)
};

const names: Record<PayMethod, string> = { gcash: "GCash", maya: "Maya", cod: "Cash on delivery" };

export function PaymentMark({ method, size = "md", tone = "light", className }: { method: PayMethod; size?: "sm" | "md" | "lg"; tone?: "light" | "dark"; className?: string }) {
  const h = size === "sm" ? "h-6" : size === "lg" ? "h-9" : "h-7";
  const logo = method === "cod" ? null : payLogos[method];
  if (logo) {
    return (
      <span className={cn("inline-flex items-center justify-center rounded-md bg-white px-2", h, className)}>
        <img src={logo} alt={names[method]} className="h-[70%] w-auto" />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 font-semibold",
        size === "sm" ? "text-[11px]" : size === "lg" ? "text-[14px]" : "text-[12px]",
        tone === "dark" ? "bg-white/10 text-white" : "bg-white text-ink ring-1 ring-line",
        h,
        className,
      )}
    >
      {method === "cod" && <Banknote className="h-3.5 w-3.5" aria-hidden />}
      {names[method]}
    </span>
  );
}

/** "GCash · Maya · COD" row. */
export function PaymentMarks({ methods = ["gcash", "maya", "cod"], size, tone, className }: { methods?: PayMethod[]; size?: "sm" | "md" | "lg"; tone?: "light" | "dark"; className?: string }) {
  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1.5", className)}>
      {methods.map((m) => (
        <PaymentMark key={m} method={m} size={size} tone={tone} />
      ))}
    </span>
  );
}
