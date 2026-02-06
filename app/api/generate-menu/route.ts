import { NextResponse } from "next/server";
import { masterRecipes, masterSoups } from "@/lib/master-recipes";
import { getHistoryForGeneration } from "@/lib/db";
import { fetchWeatherForNextWeek, getDefaultWeather } from "@/lib/weather";
import { generateMenuWithGemini } from "@/lib/gemini";
import {
  getNextWeekMonday,
  getWorkdaysFromMonday,
  formatDateISO,
} from "@/lib/utils";
async function getHistoryDishIds(): Promise<string[]> {
  try {
    const history = await getHistoryForGeneration();
    const last8 = history;
    const ids = new Set<string>();
    for (const entry of last8) {
      for (const day of entry.days) {
        ids.add(day.soup.id);
        for (const d of day.dishes) ids.add(d.id);
      }
    }
    return Array.from(ids);
  } catch {
    return [];
  }
}

async function getSpecialtyHistory(): Promise<string[]> {
  try {
    const history = await getHistoryForGeneration();
    const last8 = history;
    return last8
      .map((e) => e.specialty?.name)
      .filter(Boolean) as string[];
  } catch {
    return [];
  }
}

export async function POST() {
  console.log("[generate-menu] Požadavek přijat");
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("[generate-menu] Chybí GEMINI_API_KEY");
      return NextResponse.json(
        { error: "Chybí GEMINI_API_KEY v prostředí. Zkontrolujte .env.local." },
        { status: 500 }
      );
    }

    console.log("[generate-menu] Načítám recepty a počasí...");
    const weather = await fetchWeatherForNextWeek().catch(() =>
      getDefaultWeather()
    );

    const historyIds = await getHistoryDishIds();
    const specialtyHistory = await getSpecialtyHistory();

    console.log("[generate-menu] Volám Gemini API (může trvat 10-15 s)...");
    const menu = await generateMenuWithGemini(
      masterRecipes,
      masterSoups,
      weather,
      historyIds,
      specialtyHistory
    );

    const monday = getNextWeekMonday();
    const workdays = getWorkdaysFromMonday(monday);
    const weekStart = formatDateISO(monday);
    const weekEnd = formatDateISO(workdays[4]);

    const weatherByDate = Object.fromEntries(
      weather.map((w) => [w.date, w])
    );

    const enrichedDays = menu.days.map((day, i) => {
      const w = weatherByDate[day.date] ?? weather[i];
      return {
        ...day,
        weather: w
          ? {
              temp_max: w.temp_max,
              temp_min: w.temp_min,
              condition: w.condition,
            }
          : undefined,
        dishes: day.dishes.map((d) => ({ ...d, source: "master" as const })),
      };
    });

    console.log("[generate-menu] Hotovo, vracím menu");
    return NextResponse.json({
      week_start: weekStart,
      week_end: weekEnd,
      specialty: {
        ...menu.specialty,
        source: menu.specialty.id ? "master" : "custom",
      },
      days: enrichedDays,
    });
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Nepodařilo se vygenerovat menu.";
    console.error("[generate-menu] Chyba:", e);
    return NextResponse.json(
      { error: msg.includes("API") ? "Chyba AI služby. Zkuste to později." : msg },
      { status: 500 }
    );
  }
}
