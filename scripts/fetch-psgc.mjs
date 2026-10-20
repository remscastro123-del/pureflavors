// Builds static Philippine address data for checkout dropdowns (Province → City/Municipality → Barangay).
// Source: Philippine Standard Geographic Code (PSA), via the public mirror at https://psgc.gitlab.io/api
// Output: public/data/psgc/provinces.json and one small file per province, loaded on demand. Run: npm run psgc
import fs from "node:fs/promises";
import path from "node:path";

const API = "https://psgc.gitlab.io/api";
const out = path.resolve(import.meta.dirname, "../public/data/psgc");
const get = async (p) => {
  const r = await fetch(`${API}/${p}/`);
  if (!r.ok) throw new Error(`${p}: ${r.status}`);
  return r.json();
};

const [provinces, cities, barangays] = await Promise.all([get("provinces"), get("cities-municipalities"), get("barangays")]);
const NCR = "130000000";
const METRO = { code: "metro-manila", name: "Metro Manila" };

// Cities with no province code: NCR cities go under "Metro Manila"; the two others go under the province they sit in.
const provinceByName = (n) => provinces.find((p) => p.name === n)?.code;
const orphanHome = { "City of Isabela": provinceByName("Basilan"), "City of Cotabato": provinceByName("Maguindanao del Norte") ?? provinceByName("Maguindanao") };
const provinceOf = (c) => c.provinceCode || (c.regionCode === NCR ? METRO.code : orphanHome[c.name]) || `region-${c.regionCode}`;

const brgyByCity = new Map();
for (const b of barangays) {
  const key = b.cityCode || b.municipalityCode;
  if (!brgyByCity.has(key)) brgyByCity.set(key, []);
  brgyByCity.get(key).push(b.name);
}

const byProvince = new Map();
for (const c of cities) {
  const p = provinceOf(c);
  if (!byProvince.has(p)) byProvince.set(p, []);
  byProvince.get(p).push({ code: c.code, name: c.name, barangays: (brgyByCity.get(c.code) ?? []).sort((a, b) => a.localeCompare(b, "en", { numeric: true })) });
}

await fs.mkdir(out, { recursive: true });
const list = [METRO, ...provinces.map((p) => ({ code: p.code, name: p.name }))]
  .filter((p) => byProvince.has(p.code))
  .sort((a, b) => (a.code === METRO.code ? -1 : b.code === METRO.code ? 1 : a.name.localeCompare(b.name)));
await fs.writeFile(path.join(out, "provinces.json"), JSON.stringify(list));
for (const p of list) {
  const rows = byProvince.get(p.code).sort((a, b) => a.name.localeCompare(b.name));
  await fs.writeFile(path.join(out, `${p.code}.json`), JSON.stringify(rows));
}
const unplaced = [...byProvince.keys()].filter((k) => !list.some((p) => p.code === k));
console.log(`provinces: ${list.length}, cities/municipalities: ${cities.length}, barangays: ${barangays.length}${unplaced.length ? `, UNPLACED: ${unplaced}` : ""}`);
