# PURE storefront (React rebuild)

Next.js 15 + React 19 + Tailwind 4 + React Bits Pro. A rebuild of mypureflavors.com using the original copy, photos and catalog, with the fixes from `../audit/pure-site-audit.html` and `../audit/laws-of-ux-review.md`.

**Status: staging. Fully static.** `output: "export"`, no API routes, no middleware, no SSR, no Blob, no analytics. Checkout and the business form validate and show their confirmation screens, but **send nothing** (Talkerstein Vercel cost SOP). Nothing has been deployed.

## Run it

```bash
npm install
npm run build      # writes the static site to out/
npm start          # serves out/ locally
npm run dev        # dev server with hot reload
```

**Local servers that don't step on each other.**
- `npm run dev` runs on http://localhost:3118 and keeps its own cache in `.next-dev/`, so `next build` (which uses `.next/` and `out/`) can run at the same time.
- Start it from your own terminal so it isn't tied to a Claude session.
- `npm run preview` copies `out/` to `.preview/` and serves the copy on http://localhost:3119. A rebuild never deletes the folder being served. After a build, run `npm run preview:sync` to refresh it.
- In the desktop app's Browser pane, the `pure-static` launch entry runs the same preview on port 3117, and `pure-dev` runs dev on 3118.

`npm run prepare:data` rebuilds `src/data/products.json`, `src/data/recipes.json` and the WebP images in `public/media/` from `../catalog/` (the scrape). The images go from 90 MB of JPG/WebP to about 17 MB of WebP, at 560 px for cards and 1200 px for product pages.

React Bits Pro uses the license key in `.env.local` (git-ignored). Registries are set in `components.json`.

## SEO

- **Metadata:** every page goes through `pageMeta()` in `src/lib/seo.ts`, which sets the title, description, canonical URL, Open Graph and Twitter tags, and a 1200×630 share image.
- **Share images:** static JPGs in `public/media/og/`, made by `npm run og` (also part of `npm run prepare:data`). There's one per product, recipe and collection, plus the homepage, shop, recipes and business pages.
- **Category landing pages:** `/collections/` and `/collections/{slug}/` (fruit, creamy, sweet, drinks, bakery-style, bakery powders). Each is defined in `src/data/collections.json` and carries CollectionPage + ItemList structured data. Savory (1 product) and Equipment (1) are left out as too thin.
- **Structured data:**
  - Organization and WebSite on every page. Add the brand's social URLs to `sameAs` in `layout.tsx` once confirmed.
  - BreadcrumbList on product, recipe, collection and policy pages, via `<Breadcrumbs>`.
  - Product, with offer, item condition, shipping destination PH and the return-policy link. The shipping rate appears automatically once `delivery.flatFee` is set.
  - Recipe, with `totalTime`, keywords and a link to the product it uses.
- **Sitemap:** 66 URLs and 220 images, with products dated from the catalog's `updated_at`.
- **robots.txt:** allows everything. Checkout and the style guide use `noindex` instead, so Google can see it.
- **Readable URLs and file names:** the baking tray's UUID id is now `baking-tray`. Images are named `pure-{name}-flavor-concentrate-{n}.webp`.
- **`vercel.json`:** permanent redirects from the old site (`/shop.html?flavor=mango` → `/shop/mango/`, `?category=Bakery` → bakery powders, `.html` pages, `/recipe`), bare domain → `www`, `trailingSlash`, and long cache headers for `/media` and `/_next/static`. This only applies when the site is hosted on Vercel; the current live site is behind Cloudflare.

## Shared components (single source)

Every button, card, tab and form control comes from `src/components/ui/`. Don't restyle them inline; add a variant to the component instead.

| Component | File | Covers |
|---|---|---|
| `Button` | `ui/button.tsx` | All buttons and button-styled links (`<button>`, `<Link>` or `<a>` from one API). Variants: primary, secondary, accent, dark, inverse, inverse-outline, ghost, link. Sizes: sm, md, lg, icon, icon-lg |
| `Card` + slots | `ui/card.tsx` | All cards and panels. Variants: plain, surface, sunken, dark, brand, selected, notice. Slots: `CardMedia`, `CardBody`, `CardEyebrow`, `CardTitle`, `CardText`, `CardFooter`. `ProductCard`, `RecipeCard` and the React Bits card-spread all use them |
| `Tabs` | `ui/tabs.tsx` | Product groups (segmented), flavor families, recipe categories, mobile-menu shortcuts (pills, optionally links) |
| `Field`, `Input`, `Textarea`, `Select`, `SearchInput`, `Checkbox`, `RadioCard`, `FormSection` | `ui/form.tsx` | Checkout, business inquiry, header and shop search, sort |
| `Quantity` | `ui/quantity.tsx` | Product page and bag steppers |

Not converted, on purpose: the FAQ accordion triggers and the product-photo thumbnails. They are disclosure and picker controls, not buttons.

## Style guide

`/style-guide/` is the brand and UI reference: logo use, color tokens with computed contrast, type scale, layout, buttons, chips, live product cards, forms, feedback states, imagery, motion, voice and UX rules. It renders from the real components; colors mirror the plain theme block at the end of `globals.css` and `src/lib/tones.ts`. The page is `noindex` and disallowed in robots.txt.

## What changed versus the live site

| Audit finding | Fix in this build |
|---|---|
| Checkout said "Delivery pricing is not set yet" and showed demo payments | Only cash on delivery is shown. Delivery reads "Confirmed before dispatch", the shipping policy's own wording. Set real rates in `src/lib/delivery.ts` |
| No Shop button and no bag on the homepage; 3.2 phone screens of film before the first product | Shop and For-business buttons on screen one. The bag is in the header on every page. The film is 1.7 screens on desktop; phones get the poster with "Play the film". Featured flavors start at 847 px on a phone instead of 2,598 px |
| Products only opened in a modal, with no URL | 43 static product pages at `/shop/{id}/`, each with a title, description, canonical URL, OG image and Product JSON-LD |
| Shop was locked behind a 5 s loader | Removed. The grid renders immediately; the first row loads with `fetchpriority=high` |
| Search only matched names in the open tab ("ube" found nothing) | Searches every group and matches local names and uses: mangga, niyog, keso, milk tea, frosting |
| 37 flavors in one flat list | Grouped by family (Fruit, Creamy, Sweet, Drinks, Bakery-style, Savory). The 5 homepage favorites carry a "Start here" label |
| "Shopee · Link coming soon" on 41 cards; empty Syrups tab | Shopee links show only when they exist. Empty groups are hidden |
| Add to bag sat above the name and price on phones | Price, quantity and Add to bag sit together. On phones they form a sticky bottom bar |
| Placeholder-only checkout fields; no autofill for email | Visible labels above every field, `autocomplete` on all fields, and optional business name and TIN |
| No business path | `/business/`: who it's for, a 3-step process (React Bits Pro how-it-works-4), an inquiry form and an FAQ (React Bits Pro faq-1) |
| No sitemap, robots.txt, OG tags or schema | `sitemap.xml` (59 URLs), `robots.txt`, OG and Twitter tags, Organization, Product and Recipe JSON-LD |
| Recipes only rendered with JavaScript | 4 static recipe pages, each linking its PURE ingredient to the product |
| 16–20 px tap targets | Links and buttons are at least 44 px tall |

React Bits used:
- **Starter components:** `staggered-text` (hero headline), `card-spread` (featured flavor fan, extended with links, labels and card colors), `blur-highlight` (About page).
- **Pro blocks:** `how-it-works-4` and `faq-1`, re-skinned to PURE's palette and type and given props.

## Content PURE needs to confirm

None of this was invented. Each item stays hidden or neutral until it's supplied.

- **Bottle size** for 37 flavors (only Vanilla "30" and the 100 g powders are in the catalog). Add in `src/data/product-details.ts`.
- **Dosage** ("how much to use") per flavor. Same file.
- **Real usage, ingredient, allergen and storage text.** All 43 products share placeholder text from the old catalog.
- **Delivery rates** and an optional free-delivery threshold, in `src/lib/delivery.ts`. Setting the threshold turns on the progress bar in the bag.
- **Business terms** (pack sizes, minimums, payment terms). The business page currently says "ask us" for all of these.
- **Badges** like "Bestseller". Use them only if they're true.

## Production pass (not done; needs approval)

- Order submission: wire checkout to the existing order API, or to a Vercel function that emails via Resend.
- Business inquiry: same, with a honeypot and rate limiting.
- GCash, Maya and QR Ph through PayMongo, once live keys exist.
- GA4 and Meta/TikTok pixels, if someone will review the data.
- Features from the old site not carried over because they need a backend: Scratch & Win rewards, Google sign-in, order tracking in /account, and the delivery map pin.
- Redirects from old URLs (`/shop.html`, `/about.html`, `/contact.html`, `/recipe`) to the new ones, plus a 301 from the bare domain to `www`.
