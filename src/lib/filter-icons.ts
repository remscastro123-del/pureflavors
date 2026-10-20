import { Apple, CakeSlice, Candy, CookingPot, CupSoda, Droplet, LayoutGrid, Martini, Milk, Soup, Wheat, type LucideIcon } from "lucide-react";

/** One icon per filter value, shared by the shop and recipe chips. Unknown values get no icon. */
export const filterIcons: Record<string, LucideIcon> = {
  // product groups
  Flavor: Droplet,
  Bakery: Wheat,
  Equipment: CookingPot,
  "Bakery powder": Wheat,
  "Bakery powders": Wheat,
  // flavor families
  All: LayoutGrid,
  Fruit: Apple,
  Creamy: Milk,
  Sweet: Candy,
  Drinks: CupSoda,
  Savory: Soup,
  // recipe categories
  "All recipes": LayoutGrid,
  Desserts: CakeSlice,
  Cocktails: Martini,
};
