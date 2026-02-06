import { NextResponse } from "next/server";
import { readJsonFile } from "@/lib/utils";
import { getCustomDishes } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { MasterRecipe } from "@/lib/types";

export async function GET() {
  try {
    const data = await readJsonFile<{
      recipes: MasterRecipe[];
      soups: unknown[];
    }>("data/master_recipes.json");

    let recipes = [...(data.recipes ?? [])];

    if (supabase) {
      const custom = await getCustomDishes();
      const customAsRecipes: MasterRecipe[] = custom.map((d) => ({
        id: d.id,
        name: d.name,
        heaviness: d.heaviness,
        protein: d.protein,
        season: "all-year",
      }));
      recipes = [...customAsRecipes, ...recipes];
    }

    return NextResponse.json({
      recipes,
      soups: data.soups ?? [],
    });
  } catch {
    return NextResponse.json(
      { recipes: [], soups: [] },
      { status: 200 }
    );
  }
}
