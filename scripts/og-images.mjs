// Renders 1200×630 share images into public/media/og/ from the product and recipe photos.
// Static files, generated at build-prep time (no runtime image functions). Run: npm run og
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const pub = path.join(root, "public");
const out = path.join(pub, "media/og");
const read = async (f) => JSON.parse(await fs.readFile(path.join(root, "src/data", f), "utf8"));
const products = await read("products.json");
const recipes = await read("recipes.json");
const collections = await read("collections.json");

const W = 1200, H = 630;
const C = { cream: "#f8f3e9", ink: "#29231b", muted: "#6b655c", green: "#254c36", amber: "#a8650f", honey: "#ffbf39" };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const peso = (c) => (c == null ? "Price on request" : `₱${(c / 100).toFixed(2)}`);
const familyLabel = (c) => (c === "Bakery" ? "Bakery-style" : c);
const logo = await fs.readFile(path.join(pub, "media/pure-logo.svg"));

// Split a title into lines of at most `max` characters
function lines(text, max) {
  const words = String(text).split(" ");
  const res = [""];
  for (const w of words) {
    const cur = res[res.length - 1];
    if ((cur + " " + w).trim().length > max && cur) res.push(w);
    else res[res.length - 1] = (cur + " " + w).trim();
  }
  return res;
}

const photo = (base, size = "") => path.join(pub, `${base}${size}.webp`);
const cover = (file, w, h) => sharp(file).resize(w, h, { fit: "cover", position: "centre" }).toBuffer();

async function save(name, layers, bg = C.cream) {
  const file = path.join(out, `${name}.jpg`);
  await fs.mkdir(path.dirname(file), { recursive: true });
  await sharp({ create: { width: W, height: H, channels: 3, background: bg } })
    .composite(layers)
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(file);
}

const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`);
const logoLayer = async (left, top, h = 46, light = false) => {
  let img = sharp(logo, { density: 300 }).resize({ height: h });
  if (light) img = img.negate({ alpha: false }).modulate({ brightness: 3 });
  return { input: await img.png().toBuffer(), left, top };
};

// Text panel on the right of a photo: eyebrow, title, sub, price, footer
function panel({ x, eyebrow, title, sub, price, footer, titleSize = 76 }) {
  // Wrap to the space left of the right margin (Georgia averages ~0.56em per character)
  const t = lines(title, Math.floor((W - x - 60) / (titleSize * 0.56)));
  let y = 200;
  let body = `<text x="${x}" y="150" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="700" letter-spacing="4" fill="${C.green}">${esc(eyebrow.toUpperCase())}</text>`;
  for (const l of t) {
    body += `<text x="${x}" y="${y + titleSize * 0.8}" font-family="Georgia, 'Times New Roman', serif" font-size="${titleSize}" fill="${C.ink}">${esc(l)}</text>`;
    y += titleSize * 1.05;
  }
  y += 18;
  if (sub) {
    body += `<text x="${x}" y="${y + 26}" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="${C.muted}">${esc(sub)}</text>`;
    y += 50;
  }
  if (price) body += `<text x="${x}" y="${y + 44}" font-family="Georgia, serif" font-size="44" fill="${C.amber}">${esc(price)}</text>`;
  body += `<text x="${x}" y="${H - 48}" font-family="Arial, Helvetica, sans-serif" font-size="22" fill="${C.muted}">${esc(footer)}</text>`;
  return svg(body);
}

// Products: photo left, details right
for (const p of products) {
  const eyebrow = `PURE · ${p.collection === "Flavor" ? familyLabel(p.category) : p.collection === "Bakery" ? "Bakery powder" : p.collection}`;
  await save(`products/${p.id}`, [
    { input: await cover(photo(p.photos[0]), 600, H), left: 0, top: 0 },
    await logoLayer(W - 170, 44),
    { input: panel({ x: 660, eyebrow, title: p.name, sub: [p.type, p.size].filter(Boolean).join(" · "), price: peso(p.price), footer: "mypureflavors.com · Cash on delivery" }), left: 0, top: 0 },
  ]);
}

// Recipes: photo left (several recipe photos have text baked in, so no overlay), details right
for (const r of recipes) {
  await save(`recipes/${r.id}`, [
    { input: await cover(path.join(pub, r.image), 560, H), left: 0, top: 0 },
    await logoLayer(W - 170, 44),
    { input: panel({ x: 620, eyebrow: `PURE recipe · ${r.category}`, title: r.title, sub: `${r.time} · ${r.servings}`, footer: "mypureflavors.com/recipes", titleSize: 60 }), left: 0, top: 0 },
  ]);
}

// Tiles of product photos with a title panel on the left
async function tiled(name, title, eyebrow, sub, ids) {
  const pics = ids.slice(0, 4);
  const layers = [];
  const tw = 300, th = H / 2;
  for (const [i, p] of pics.entries()) {
    layers.push({ input: await cover(photo(p.photos[0], "-sm"), tw, Math.ceil(th)), left: 600 + (i % 2) * tw, top: Math.floor(i / 2) * Math.floor(th) });
  }
  layers.push(await logoLayer(56, 44));
  layers.push({ input: panel({ x: 56, eyebrow, title, sub, footer: "mypureflavors.com", titleSize: 64 }), left: 0, top: 0 });
  await save(name, layers);
}

const byId = (id) => products.find((p) => p.id === id);
for (const c of collections) {
  const items = products
    .filter((p) => p.collection === c.match.collection && (!c.match.category || p.category === c.match.category))
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.position - b.position);
  await tiled(`collections/${c.slug}`, c.title, "PURE collection", `${items.length} products`, items);
}
await tiled("shop", "Find your next ingredient.", "The PURE flavor shop", "37 flavors + 5 bakery powders", ["mango", "matcha", "ube-powder", "strawberry"].map(byId));
await tiled("business", "Flavor for your whole menu.", "PURE for business", "Bakeries · cafés · milk-tea shops", ["mango", "ube-powder", "coffee", "strawberry"].map(byId));

// Recipes index: four recipe photos
{
  const layers = [];
  for (const [i, r] of recipes.slice(0, 4).entries()) layers.push({ input: await cover(path.join(pub, r.image), 300, 315), left: 600 + (i % 2) * 300, top: Math.floor(i / 2) * 315 });
  layers.push(await logoLayer(56, 44));
  layers.push({ input: panel({ x: 56, eyebrow: "The PURE recipe book", title: "A little flavor. A lot to create.", sub: "Desserts and cocktails", footer: "mypureflavors.com/recipes", titleSize: 60 }), left: 0, top: 0 });
  await save("recipes", layers);
}

// Site default: the film poster with the brand line
{
  const text = `<rect width="${W}" height="${H}" fill="${C.cream}" fill-opacity="0.35"/>
    <text x="64" y="300" font-family="Georgia, serif" font-size="84" fill="${C.ink}">A world of flavor.</text>
    <text x="64" y="396" font-family="Georgia, serif" font-size="84" fill="${C.ink}">A drop of <tspan font-style="italic" fill="${C.amber}">PURE.</tspan></text>
    <text x="64" y="470" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="${C.muted}">Food flavor concentrates · Cash on delivery · Philippines</text>`;
  await save("pure", [{ input: await cover(path.join(pub, "media/flavor-poster.jpg"), W, H), left: 0, top: 0 }, { input: svg(text), left: 0, top: 0 }, await logoLayer(64, 56, 54)]);
}

console.log(`og images: ${products.length} products, ${recipes.length} recipes, ${collections.length} collections, 4 pages`);
