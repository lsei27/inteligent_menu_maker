import { NextResponse } from "next/server";
import { insertMenuEntry, insertCustomDishes } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type {
  MenuHistoryEntry,
  CustomDish,
  MenuDish,
} from "@/lib/types";

interface SaveBody {
  week_start: string;
  week_end: string;
  specialty: { id: string; name: string; source: "master" | "custom" };
  days: Array<{
    date: string;
    day_name: string;
    soup: { id: string; name: string };
    dishes: MenuDish[];
  }>;
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Databáze není nakonfigurována. Zkontrolujte Supabase env." },
        { status: 500 }
      );
    }

    const body = (await request.json()) as SaveBody;
    const { week_start, week_end, specialty, days } = body;

    if (!week_start || !week_end || !specialty || !days?.length) {
      return NextResponse.json(
        { error: "Neplatná data menu." },
        { status: 400 }
      );
    }

    const customDishes: CustomDish[] = [];
    for (const day of days) {
      for (const d of day.dishes) {
        if (d.source === "custom" && d.id.startsWith("custom_")) {
          customDishes.push({
            id: d.id,
            name: d.name,
            protein: d.protein,
            heaviness: d.heaviness,
            created_at: new Date().toISOString(),
          });
        }
      }
    }
    if (specialty.source === "custom" && specialty.id.startsWith("custom_")) {
      customDishes.push({
        id: specialty.id,
        name: specialty.name,
        protein: "mixed",
        heaviness: "medium",
        created_at: new Date().toISOString(),
      });
    }

    const uniqueCustom = Array.from(
      new Map(customDishes.map((c) => [c.id, c])).values()
    );
    await insertCustomDishes(uniqueCustom);

    const entryData: Omit<MenuHistoryEntry, "id" | "created_at"> = {
      week_start,
      week_end,
      specialty,
      days: days.map((d) => ({
        date: d.date,
        day_name: d.day_name,
        soup: d.soup,
        dishes: d.dishes.map(({ id, name, protein, heaviness, source }) => ({
          id,
          name,
          protein,
          heaviness,
          source: source ?? "master",
        })),
      })),
    };

    const result = await insertMenuEntry(entryData);
    if (!result) {
      return NextResponse.json(
        { error: "Nepodařilo se uložit menu do databáze." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, id: result.id });
  } catch {
    return NextResponse.json(
      { error: "Nepodařilo se uložit menu." },
      { status: 500 }
    );
  }
}
