// Builds src/data/*.json and compressed WebP media from the scraped catalog in ../catalog.
// Run once after a new scrape: npm run prepare:data
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const catalogDir = path.resolve(root, "../catalog");
const snapshotDir = path.resolve(root, "../site-snapshot");
const mediaDir = path.join(root, "public/media");
const outData = path.join(root, "src/data");

// Search aliases: local names and common uses, so "mangga" or "milk tea" finds the right flavor.
const aliases = {
  mango: ["mangga"], coconut: ["niyog", "buko"], pineapple: ["pinya"], banana: ["saging"],
  strawberry: ["presa"], grape: ["ubas"], watermelon: ["pakwan"], orange: ["dalandan"],
  coffee: ["kape"], chocolate: ["tsokolate", "choco"], "cheese-powder": ["keso"], honey: ["pulot"],
  "fresh-milk": ["gatas", "milk"], "condensed-milk": ["gatas", "milk"], "ube-powder": ["ube", "purple yam"],
  "cocoa-powder": ["cacao", "tsokolate"], "moringa-powder": ["malunggay"], lemon: ["lemonade"],
};
const usesByCategory = {
  Fruit: ["shakes", "juice", "ice cream", "cake"],
  Creamy: ["frosting", "ice cream", "cake", "pastry"],
  Sweet: ["frosting", "candy", "cake", "drinks"],
  Drinks: ["milk tea", "coffee", "frappe", "drinks"],
  Bakery: ["cake", "bread", "pastry", "frosting"],
  Savory: ["soup", "snacks", "seasoning"],
};
// The five flavors the original homepage features; shown as "Start here" in the shop.
const featured = ["lychee", "matcha", "mango", "strawberry", "vanilla"];
const cardColors = { lychee: "#eee1cd", matcha: "#dbe2bd", mango: "#f3d47b", strawberry: "#f2c4bb", vanilla: "#e9dfc7" };

async function toWebp(src, dest, width) {
  try {
    await fs.access(dest);
    return;
  } catch {}
  await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 78 }).toFile(dest);
}

const { products } = JSON.parse(await fs.readFile(path.join(catalogDir, "products.json"), "utf8"));
await fs.mkdir(path.join(mediaDir, "products"), { recursive: true });

const slugify = (t) => t.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(id);

// Moves an image generated under its old name to its new descriptive name, or encodes it from the catalog.
async function placeImage(src, oldDest, newDest, width) {
  try {
    await fs.access(newDest);
    return;
  } catch {}
  try {
    await fs.rename(oldDest, newDest);
    return;
  } catch {}
  await toWebp(src, newDest, width);
}

const out = [];
for (const p of products) {
  if (!p.active) continue;
  const name = p.name.charAt(0).toUpperCase() + p.name.slice(1);
  // Readable ids everywhere: the one catalog item with a UUID id becomes a slug of its name (URL /shop/baking-tray/).
  const id = isUuid(p.id) ? slugify(p.name) : p.id;
  // Descriptive file names for image search: pure-mango-flavor-concentrate-1.webp
  const stem = `pure-${slugify(name)}${p.collection === "Flavor" ? "-flavor-concentrate" : ""}`;
  const sources = [p.image, p.secondary_image, ...(p.gallery || [])].filter(Boolean);
  const photos = [];
  for (const [i, rel] of sources.entries()) {
    const oldBase = path.join(mediaDir, "products", `${p.id}-${i + 1}`);
    const base = `${stem}-${i + 1}`;
    await placeImage(path.join(catalogDir, rel), `${oldBase}.webp`, path.join(mediaDir, "products", `${base}.webp`), 1200);
    await placeImage(path.join(catalogDir, rel), `${oldBase}-sm.webp`, path.join(mediaDir, "products", `${base}-sm.webp`), 560);
    photos.push(`/media/products/${base}`);
  }
  out.push({
    id,
    name,
    collection: p.collection,
    category: p.category,
    type: p.type || (p.collection === "Flavor" ? "Food flavor concentrate" : p.collection),
    size: p.size ? (/^\d+$/.test(p.size) ? `${p.size} ml` : p.size) : null,
    price: p.price_php == null ? null : Math.round(p.price_php * 100),
    stock: p.stock,
    position: p.position,
    description: p.description,
    usage: p.usage,
    ingredients: p.ingredients,
    storage: p.storage,
    shopeeUrl: p.shopee_url,
    photos,
    featured: featured.includes(id),
    cardColor: cardColors[id] ?? null,
    aliases: aliases[id] ?? [],
    uses: usesByCategory[p.category] ?? [],
    updatedAt: p.updated_at ?? null,
  });
}
await fs.writeFile(path.join(outData, "products.json"), JSON.stringify(out, null, 1));

const { recipes } = JSON.parse(await fs.readFile(path.join(catalogDir, "recipes.json"), "utf8"));
await fs.mkdir(path.join(mediaDir, "recipes"), { recursive: true });
const recipeProduct = { lychee: "lychee", cinnamon: "cinnamon-roll", honey: "honey", peach: "peach" };
const recipesOut = [];
for (const r of recipes.filter((r) => r.active)) {
  const file = path.basename(r.image);
  await toWebp(path.join(catalogDir, "images/recipes", file), path.join(mediaDir, "recipes", file.replace(/\.\w+$/, ".webp")), 1400);
  recipesOut.push({ ...r, image: `/media/recipes/${file.replace(/\.\w+$/, ".webp")}`, productId: recipeProduct[r.id] ?? null });
}
await fs.writeFile(path.join(outData, "recipes.json"), JSON.stringify(recipesOut, null, 1));

// Brand and film assets
for (const [from, to] of [
  ["assets/pure-logo.svg", "pure-logo.svg"],
  ["flavor-poster.jpg", "flavor-poster.jpg"],
  ["flavor-scroll-hd.mp4", "flavor-film-hd.mp4"],
  ["flavor-scroll-mobile.mp4", "flavor-film-mobile.mp4"],
]) {
  await fs.copyFile(path.join(snapshotDir, from), path.join(mediaDir, to));
}
console.log(`products: ${out.length}, recipes: ${recipesOut.length}`);
