import { familyLabel, type Product } from "@/lib/catalog";

/**
 * Family colors, built like Calendly's 2026 system: each family is a trio from one hue.
 *   pale – grounds (tags, tiles, section bands)
 *   mid  – vivid accent: shapes, dots, illustration fills. Not for body text.
 *   deep – text and icons on pale (contrast 6.5–9.3:1) and on mid at large sizes.
 * Cards stay white; families show up as pale tags with deep text.
 */
export type FamilyColor = { name: string; pale: string; mid: string; deep: string };

export const familyColors: Record<string, FamilyColor> = {
  Fruit: { name: "Mango", pale: "#fff0dc", mid: "#ff9f2e", deep: "#6b3a0c" },
  Creamy: { name: "Butter", pale: "#fff7d6", mid: "#f5d04e", deep: "#5e4b0d" },
  Sweet: { name: "Berry", pale: "#fce7ec", mid: "#f0708c", deep: "#6e1f33" },
  Drinks: { name: "Matcha", pale: "#eaf3d3", mid: "#a7cf4e", deep: "#3f5418" },
  "Bakery powder": { name: "Ube", pale: "#eee7fb", mid: "#b89efa", deep: "#473082" },
  Savory: { name: "Sea salt", pale: "#d9f3f1", mid: "#2cc5ba", deep: "#0b5e60" },
  Equipment: { name: "Stone", pale: "#eef0ef", mid: "#a3aba6", deep: "#3a403c" },
};

const fallback: FamilyColor = { name: "Stone", pale: "#eef0ef", mid: "#a3aba6", deep: "#3a403c" };

export const familyOf = (p: Product) =>
  p.collection === "Flavor" ? familyLabel(p.category) : p.collection === "Bakery" ? "Bakery powder" : p.collection;

/** Color for a family label; accepts plurals like "Bakery powders". */
export const familyColor = (label: string): FamilyColor => familyColors[label] ?? familyColors[label.replace(/s$/, "")] ?? fallback;

export const colorFor = (p: Product) => familyColor(familyOf(p));
