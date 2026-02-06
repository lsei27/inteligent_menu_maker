/**
 * Master recepty – import JSON, aby byl součástí bundlu (Vercel serverless)
 */
import raw from "@/data/master_recipes.json";
import type { MasterRecipe, MasterSoup } from "./types";

export const masterRecipes = (raw.recipes ?? []) as MasterRecipe[];
export const masterSoups = (raw.soups ?? []) as MasterSoup[];
