import { NextResponse } from "next/server";
import { masterRecipes, masterSoups } from "@/lib/master-recipes";
import { getCustomDishes } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { MasterRecipe } from "@/lib/types";

export async function GET() {
  try {
    let recipes = [...masterRecipes];

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
      soups: masterSoups,
    });
  } catch {
    return NextResponse.json(
      { recipes: [], soups: [] },
      { status: 200 }
    );
  }
}
