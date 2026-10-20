"use client";

import { useState } from "react";
import { recipes, type Recipe } from "@/lib/catalog";
import { Card, CardBody, CardEyebrow, CardMedia, CardText, CardTitle } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";

/** Recipe card used on /recipes, the homepage and anywhere else a recipe is listed. */
export function RecipeCard({ r, size = "md", ratio = "4/5" }: { r: Recipe; size?: "md" | "lg"; ratio?: "4/5" | "5/4" }) {
  const href = `/recipes/${r.id}/`;
  return (
    <Card variant="plain" as="article" className="overflow-visible">
      <CardMedia src={r.image} alt={r.title} href={href} ratio={ratio} label={r.title} />
      <CardBody className="pt-4">
        <CardEyebrow>
          {r.category} · {r.time}
          {size === "lg" && ` · ${r.servings}`}
        </CardEyebrow>
        <CardTitle href={href} size={size === "lg" ? "lg" : "md"}>
          {r.title}
        </CardTitle>
        {size === "lg" && <CardText className="mt-1 max-w-[52ch]">{r.summary}</CardText>}
      </CardBody>
    </Card>
  );
}

export function RecipeList() {
  // Only show categories that have recipes (the original "Mini-vlogs" tab was empty).
  const cats = ["All recipes", ...Array.from(new Set(recipes.map((r) => r.category)))];
  const [cat, setCat] = useState("All recipes");
  const list = cat === "All recipes" ? recipes : recipes.filter((r) => r.category === cat);

  return (
    <>
      <Tabs label="Recipe categories" value={cat} onChange={setCat} items={cats.map((c) => ({ value: c, label: c }))} className="mt-8" />
      <ul className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2">
        {list.map((r) => (
          <li key={r.id}>
            <RecipeCard r={r} size="lg" ratio="5/4" />
          </li>
        ))}
      </ul>
    </>
  );
}
