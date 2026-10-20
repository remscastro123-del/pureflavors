import productsJson from "@/data/products.json";
import recipesJson from "@/data/recipes.json";
import collectionsJson from "@/data/collections.json";
import { details } from "@/data/product-details";

export type Product = {
  id: string;
  name: string;
  collection: "Flavor" | "Bakery" | "Equipment" | string;
  category: string;
  type: string;
  size: string | null;
  price: number | null;
  stock: number | null;
  position: number;
  description: string;
  usage: string;
  ingredients: string;
  storage: string;
  shopeeUrl: string | null;
  photos: string[];
  featured: boolean;
  cardColor: string | null;
  aliases: string[];
  uses: string[];
  updatedAt: string | null;
  /** Optional content PURE still needs to supply (see src/data/product-details.ts) */
  dosage?: string;
  badge?: string;
};

export type Recipe = {
  id: string;
  title: string;
  category: string;
  summary: string;
  time: string;
  servings: string;
  ingredients: string;
  method: string;
  image: string;
  productId: string | null;
};

export const products: Product[] = (productsJson as Product[]).map((p) => ({
  ...p,
  ...(details[p.id] ?? {}),
  // Bakery-style flavors (banana bread, cheesecake, cinnamon roll, cookies & cream) are shown as Sweet.
  category: p.collection === "Flavor" && p.category === "Bakery" ? "Sweet" : p.category,
  size: details[p.id]?.size ?? p.size,
}));
export const recipes = recipesJson as Recipe[];

export const groups = [
  { id: "Flavor", label: "Flavors" },
  { id: "Bakery", label: "Bakery powders" },
  { id: "Equipment", label: "Equipment" },
].filter((g) => products.some((p) => p.collection === g.id));

/** Flavor families. The scraped "Bakery" flavor category is merged into Sweet when products load (above). */
export const familyOrder = ["Fruit", "Creamy", "Sweet", "Drinks", "Savory"];
export const familyLabel = (c: string) => c;

export const getProduct = (id: string) => products.find((p) => p.id === id);
export const recipesFor = (productId: string) => recipes.filter((r) => r.productId === productId);
export const related = (p: Product, n = 4) =>
  products.filter((x) => x.id !== p.id && x.collection === p.collection && x.category === p.category).slice(0, n);

export const photo = (base: string | undefined, size: "sm" | "lg" = "sm") =>
  base ? `${base}${size === "sm" ? "-sm" : ""}.webp` : "";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

/** Forgiving search (Postel's Law): all groups, local names, uses, any word order. */
export function searchProducts(query: string) {
  const words = norm(query).split(" ").filter(Boolean);
  if (!words.length) return [];
  return products
    .map((p) => {
      const name = norm(p.name);
      const hay = norm([p.name, p.category, familyLabel(p.category), p.collection, p.type, ...p.aliases, ...p.uses].join(" "));
      if (!words.every((w) => hay.includes(w))) return null;
      const score = (name.startsWith(words[0]) ? 3 : 0) + (name.includes(words.join(" ")) ? 2 : 0) + (p.featured ? 1 : 0);
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => x !== null)
    .sort((a, b) => b.score - a.score || a.p.position - b.p.position)
    .map((x) => x.p);
}

export type Collection = {
  slug: string;
  label: string;
  title: string;
  intro: string;
  match: { collection: string; category?: string };
};

/** Category landing pages at /collections/{slug}/ (see src/data/collections.json). */
export const collections = collectionsJson as Collection[];
export const productsIn = (c: Collection) =>
  products
    .filter((p) => p.collection === c.match.collection && (!c.match.category || p.category === c.match.category))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.position - b.position);
export const getCollection = (slug: string) => collections.find((c) => c.slug === slug);
/** The landing page a product belongs to, if any (Savory and Equipment have none: too few items). */
export const collectionOf = (p: Product) =>
  collections.find((c) => c.match.collection === p.collection && (!c.match.category || c.match.category === p.category));

export const site = {
  name: "PURE",
  url: "https://www.mypureflavors.com",
  company: "Green Leaves | JNRM Corporation",
  address: "B3 L5 Grand Industrial Estate, Parulan, Plaridel, Bulacan, Philippines",
  whatsapp: "09760052926",
  whatsappUrl: "https://wa.me/639760052926",
  /** PURE's Shopee store. Null hides every "Prefer Shopee?" link until PURE confirms the URL. */
  shopeeUrl: null as string | null,
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Green%20Leaves%20JNRM%20Corporation%20B3%20L5%20Grand%20Industrial%20Estate%20Parulan%20Plaridel%20Bulacan",
};
