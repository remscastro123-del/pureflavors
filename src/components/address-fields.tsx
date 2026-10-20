"use client";

import { useEffect, useState } from "react";
import { Field, Select } from "@/components/ui/form";

/**
 * Province → City/Municipality → Barangay, the way Shopee and Lazada ask for a PH address (Jakob's Law).
 * Data: PSGC (PSA) as static JSON in /data/psgc/, one file per province, fetched only when chosen.
 * Rebuild with `npm run psgc`.
 */
type Province = { code: string; name: string };
type City = { code: string; name: string; barangays: string[] };

export function AddressFields() {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [prov, setProv] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [city, setCity] = useState("");
  const [brgy, setBrgy] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/data/psgc/provinces.json")
      .then((r) => r.json())
      .then(setProvinces)
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    setCity("");
    setBrgy("");
    setCities([]);
    if (!prov) return;
    fetch(`/data/psgc/${prov}.json`)
      .then((r) => r.json())
      .then(setCities)
      .catch(() => setError(true));
  }, [prov]);

  const provinceName = provinces.find((p) => p.code === prov)?.name ?? "";
  const cityRow = cities.find((c) => c.code === city);

  return (
    <>
      <Field label="Province">
        <Select required value={prov} onChange={(e) => setProv(e.target.value)} autoComplete="address-level1">
          <option value="" disabled>
            {provinces.length ? "Choose your province" : "Loading provinces…"}
          </option>
          {provinces.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="City or municipality">
        <Select required value={city} onChange={(e) => { setCity(e.target.value); setBrgy(""); }} disabled={!cities.length} autoComplete="address-level2">
          <option value="" disabled>
            {prov ? (cities.length ? "Choose your city or municipality" : "Loading…") : "Choose a province first"}
          </option>
          {cities.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Barangay">
        <Select required value={brgy} onChange={(e) => setBrgy(e.target.value)} disabled={!cityRow} autoComplete="address-level3">
          <option value="" disabled>
            {cityRow ? "Choose your barangay" : "Choose a city first"}
          </option>
          {cityRow?.barangays.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </Select>
      </Field>
      {/* Readable names for the order (the selects hold PSGC codes) */}
      <input type="hidden" name="province" value={provinceName} />
      <input type="hidden" name="city" value={cityRow?.name ?? ""} />
      <input type="hidden" name="barangay" value={brgy} />
      <input type="hidden" name="psgcCity" value={city} />
      {error && (
        <p role="alert" className="text-[14px] text-danger sm:col-span-2">
          We couldn’t load the address list. Check your connection and reload the page, or message us on WhatsApp.
        </p>
      )}
    </>
  );
}
