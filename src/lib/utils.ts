import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const peso = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });

/** Prices are stored in centavos, as in the original API. */
export function money(centavos: number | null | undefined) {
  return centavos == null ? "Price on request" : peso.format(centavos / 100);
}
