import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { RecipeList } from "@/components/recipe-list";
import { PageHero, PageSheet } from "@/components/page-hero";
import { FinalCta } from "@/components/home-sections";

export const metadata: Metadata = pageMeta({
  title: "Recipes with PURE flavors",
  description: "Sweet moments, signature sips and stories from the kitchen. Cocktail and dessert recipes made with PURE flavor concentrates.",
  path: "/recipes/",
  image: "/media/og/recipes.jpg",
});

export default function RecipesPage() {
  return (
    <>
      <PageHero eyebrow="The PURE recipe book" title={<>A little flavor. <span className="text-amber-700">A lot to create.</span></>} intro="Sweet moments, signature sips and stories from the kitchen. Find your next creation, one recipe at a time." />
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8 pt-4">
      <RecipeList />
    </div>
      <FinalCta />
    </>
  );
}
