/**
 * Google Gemini API client pro generování menu
 */
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { GeneratedMenu } from "./types";
import type { MasterRecipe, MasterSoup } from "./types";
import type { WeatherDay } from "./types";
import { getSeasonFromMonth } from "./utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? "");

export const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
    // Vypnutí thinking módu – zkracuje latenci (Gemini 2.5 má thinking defaultně zapnutý)
    thinkingConfig: { thinkingBudget: 0 },
  } as Record<string, unknown>,
});

function buildPrompt(
  recipes: MasterRecipe[],
  soups: MasterSoup[],
  weather: WeatherDay[],
  historyLast8Weeks: string[],
  specialtyHistory: string[]
): string {
  const month = new Date().getMonth();
  const season = getSeasonFromMonth(month);
  const recipesJson = JSON.stringify(
    recipes.map((r) => ({
      id: r.id,
      name: r.name,
      heaviness: r.heaviness,
      protein: r.protein,
      season: r.season,
      margin: r.price && r.cost ? r.price - r.cost / 1.12 : 0,
      sales_count: r.sales_count ?? 0,
    })),
    null,
    0
  );
  const soupsJson = JSON.stringify(
    soups.map((s) => ({
      id: s.id,
      name: s.name,
      heaviness: s.heaviness,
      season: s.season,
      sales_count: s.sales_count ?? 0,
    })),
    null,
    0
  );
  const weatherJson = JSON.stringify(
    weather.map((w) => ({
      date: w.date,
      temp_max: w.temp_max,
      temp_min: w.temp_min,
      condition: w.condition,
    })),
    null,
    0
  );

  return `Jsi asistent pro plánování poledního menu české restaurace.

## JAZYK
Veškeré texty (reason, reasoning) piš VÝHRADNĚ v češtině. Žádná angličtina.

## Vstupní data
- Recepty (hlavní jídla): ${recipesJson}
- Polévky: ${soupsJson}
- Předpověď počasí (5 dní Po-Pá): ${weatherJson}
- Historie jídel za posledních 6 týdnů (NEPOUŽÍVEJ): ${JSON.stringify(historyLast8Weeks)}
- Historie specialit za posledních 8 týdnů (NEPOUŽÍVEJ): ${JSON.stringify(specialtyHistory)}
- Aktuální sezóna: ${season}

## Tvůj úkol
Vygeneruj kompletní menu na pracovní týden (Po-Pá). Data weather mají datumy odpovídající dnům.

## Struktura každého dne
- 1× polévka (z soups)
- 5× hlavní jídlo (z recipes)

## Povinná pravidla - STRIKTNĚ DODRŽUJ
1. VEGETARIÁNSKÉ: Každý den MINIMÁLNĚ 1 jídlo s protein="vege". DŮLEŽITÉ: Označuj jako vege POUZE jídla BEZ masa. Čočka/uzení, fazole se slaninou, polévky s uzeným = NENÍ vege. Řízek (holandský, vídeňský) = maso, NENÍ vege. Respektuj hodnotu protein z vstupních dat receptů.
2. DIVERZITA: V 5 jídlech jednoho dne MAXIMÁLNĚ 2× stejný typ proteinu
3. BEZ OPAKOVÁNÍ: Žádné jídlo (hlavní ani polévka) se NESMÍ opakovat v týdnu
4. HISTORIE 6 TÝDNŮ: NEPOUŽÍVEJ jídla z historyLast8Weeks
5. HISTORIE SPECIALIT 8 TÝDNŮ: NEPOUŽÍVEJ speciality z specialtyHistory
6. PRODEJNOST (sales_count): Preferuj jídla s vyšším sales_count (prodalo se více porcí). Vyhýbej se jídlům se sales_count=0 nebo velmi nízkým (<10) – ty se téměř neprodávala. Při stejném splnění pravidel vyber populárnější jídla.

## Pravidla počasí → těžkost
- Nad 25°C: 60% light, 30% medium, 10% heavy
- 15-25°C: 30% light, 50% medium, 20% heavy
- 5-15°C: 20% light, 40% medium, 40% heavy
- Pod 5°C: 10% light, 30% medium, 60% heavy

## Týdenní specialita
- Vyber z recipes jídlo s margin > 80 (price - cost/1.12)
- Sezónně relevantní
- Nesmí být v specialtyHistory

## Výstup - POUZE validní JSON:
{
  "specialty": {
    "id": "id_z_recipes_nebo_null",
    "name": "Název",
    "reason": "max 15 slov V ČEŠTINĚ"
  },
  "days": [
    {
      "date": "YYYY-MM-DD",
      "day_name": "Pondělí|Úterý|...",
      "soup": { "id": "id", "name": "Název" },
      "dishes": [
        { "id": "id", "name": "Název", "protein": "vege|chicken|...", "heaviness": "light|medium|heavy" }
      ],
      "reasoning": "max 10 slov V ČEŠTINĚ"
    }
  ]
}

ODPOVĚZ POUZE VALIDNÍM JSON OBJEKTEM.`;
}

function parseGeminiResponse(text: string): GeneratedMenu {
  let cleaned = text.trim();
  const jsonStart = cleaned.indexOf("{");
  const jsonEnd = cleaned.lastIndexOf("}") + 1;
  if (jsonStart >= 0 && jsonEnd > jsonStart) {
    cleaned = cleaned.slice(jsonStart, jsonEnd);
  }
  return JSON.parse(cleaned) as GeneratedMenu;
}

export async function generateMenuWithGemini(
  recipes: MasterRecipe[],
  soups: MasterSoup[],
  weather: WeatherDay[],
  historyDishIds: string[],
  specialtyHistory: string[],
  maxRetries = 2
): Promise<GeneratedMenu> {
  const prompt = buildPrompt(
    recipes,
    soups,
    weather,
    historyDishIds,
    specialtyHistory
  );

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      if (!text) {
        throw new Error("Prázdná odpověď z Gemini API");
      }
      return parseGeminiResponse(text);
    } catch (e) {
      lastError = e instanceof Error ? e : new Error(String(e));
    }
  }
  throw lastError ?? new Error("Nepodařilo se vygenerovat menu pomocí AI.");
}
