import Link from "next/link";
import { Banknote, RotateCcw, Truck, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentMark, PaymentMarks } from "@/components/payment-mark";

/**
 * Payment and trust signals, shown where shoppers look before committing (product buy box, bag, footer).
 * Only lists what is actually live. GCash and Maya are paid manually (number sent with the order confirmation) until a gateway is added.
 */
export const livePayments = [
  { id: "gcash", label: "GCash", icon: Wallet },
  { id: "maya", label: "Maya", icon: Wallet },
  { id: "cod", label: "Cash on delivery", icon: Banknote },
] as const;

export function TrustBadges({ variant = "list", className }: { variant?: "list" | "inline" | "footer"; className?: string }) {
  if (variant === "footer") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        <span className="text-[13px] text-muted">We accept</span>
        <PaymentMarks />
      </div>
    );
  }
  if (variant === "inline") {
    return (
      <p className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted", className)}>
        <PaymentMarks size="sm" />
        <span className="inline-flex items-center gap-1.5">
          <Truck className="h-4 w-4" aria-hidden /> Ships across the Philippines
        </span>
      </p>
    );
  }
  return (
    <ul className={cn("grid gap-2.5 text-[14px] text-ink/85", className)} aria-label="Payment and delivery">
      <li className="flex items-center gap-2.5">
        <Banknote className="h-[18px] w-[18px] shrink-0 text-amber-700" aria-hidden />
        <span>
          <strong className="font-semibold">Cash on delivery</strong>: pay the courier when it arrives
        </span>
      </li>
      <li className="flex items-center gap-2.5">
        <Truck className="h-[18px] w-[18px] shrink-0 text-amber-700" aria-hidden />
        Delivery fee confirmed before dispatch
      </li>
      <li className="flex items-center gap-2.5">
        <RotateCcw className="h-[18px] w-[18px] shrink-0 text-amber-700" aria-hidden />
        <span>
          Damaged or wrong item?{" "}
          <Link href="/returns/" className="underline underline-offset-4">
            Returns & refunds
          </Link>
        </span>
      </li>
    </ul>
  );
}
