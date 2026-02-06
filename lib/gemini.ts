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
Veškeré texty (reason, reasoning) piš VÝHRADNĚ v češtině.

## Vstupní data
- Recepty (hlavní jídla): ${recipesJson}
- Polévky: ${soupsJson}
- Předpověď počasí (5 dní Po-Pá): ${weatherJson}
- Historie jídel 6 týdnů (NEPOUŽÍVEJ): ${JSON.stringify(historyLast8Weeks)}
- Historie specialit 8 týdnů (NEPOUŽÍVEJ): ${JSON.stringify(specialtyHistory)}
- Sezóna: ${season}

## STRUKTURA TÝDNE – NEZBYTNÁ
- **1× týdenní specialita** – stejná každý den, NEZAPOČÍTÁVÁ se do 5 hlavních jídel (je MIMO ně)
- **Každý den:** 1 polévka + 5 hlavních jídel (celkem 5 různých receptů na den)

## POVINNÁ PRAVIDLA – PORUŠENÍ = NEVALIDNÍ MENU

### 1. VEGETARIÁNSKÉ
Každý den MINIMÁLNĚ 1 jídlo s protein="vege". Používej POUZE protein z vstupních dat receptů. Čočka s uzením, fazole se slaninou = NENÍ vege.

### 2. DIVERZITA MASA (KRITICKÉ)
V 5 hlavních jídlech jednoho dne MAXIMÁLNĚ 2× stejný typ proteinu.
Typy: vege, chicken, pork, beef, fish, mixed – KAŽDÝ se počítá!
- Špatně: 3× mixed, 3× chicken, 3× cokoliv
- Dobře: vyvážená kombinace – např. 1× vege, 1× chicken, 1× pork, 1× beef, 1× mixed
- DŮLEŽITÉ: "mixed" používej SPÍŠE VÝJIMEČNĚ. Preferuj konkrétní typy (vege, chicken, pork, beef, fish). Max 1× mixed na den, lépe 0×.

### 3. BEZ OPAKOVÁNÍ V TÝDNU
Žádné jídlo (hlavní ani polévka) se NESMÍ opakovat v rámci celého týdne. Každý recept max 1×.
Zároveň: v jednom dni NEVKLÁDEJ velmi podobná jídla (např. "Tortilla s kuřecím" + "tortilla s kuřecími stripsy" = zakázáno).

### 4. HISTORIE 6 TÝDNŮ
NEPOUŽÍVEJ jídla z historyLast8Weeks (ani polévky, ani hlavní).

### 5. HISTORIE SPECIALIT 8 TÝDNŮ
Specialita NESMÍ být v specialtyHistory.

### 6. PRODEJNOST (sales_count) – SEKUNDÁRNÍ
Pravidla 1–5 mají ABSOLUTNÍ přednost. Prodejnost použij JEN při výběru mezi jídly, která STEJNĚ splňují pravidla – preferuj vyšší sales_count, vyhýbej se sales_count=0 nebo <10.

## Počasí → těžkost
- Nad 25°C: 60% light, 30% medium, 10% heavy
- 15-25°C: 30% light, 50% medium, 20% heavy
- 5-15°C: 20% light, 40% medium, 40% heavy
- Pod 5°C: 10% light, 30% medium, 60% heavy

## Týdenní specialita
- 1 jídlo z recipes s margin > 80
- Sezónně relevantní, nesmí být v specialtyHistory

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

PŘED ODESLÁNÍM OVĚŘ: (a) každý den max 2× stejný protein, max 1× mixed, (b) žádné jídlo se neopakuje v týdnu, (c) žádná podobná jídla v jednom dni, (d) protein z vstupních dat – např. "Risotto se sýrem Feta" je vege. ODPOVĚZ POUZE VALIDNÍM JSON OBJEKTEM.`;
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
