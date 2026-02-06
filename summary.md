# Generátor menu – Shrnutí projektu

## Přehled
Fullstack webová aplikace pro generování týdenního poledního menu restaurace pomocí AI (Google Gemini), s integrací počasí a pravidel pro vyvážené menu.

## Struktura projektu

```
/app
  page.tsx              # Úvodní stránka
  generate/page.tsx     # Vygenerované menu + úpravy
  history/page.tsx      # Historie menu (přehledný layout, editace, mazání)
  layout.tsx
  globals.css
  /api
    generate-menu/route.ts   # Generování menu (Gemini + počasí)
    save-menu/route.ts       # Uložení schváleného menu
    get-history/route.ts     # Načtení historie
    update-menu/route.ts     # PATCH – úprava záznamu v historii
    delete-menu/route.ts     # DELETE – smazání záznamu
    export-pdf/route.ts      # Export PDF
    recipes/route.ts         # Seznam receptů pro DishSelector
/components
  MenuDay.tsx           # Karta jednoho dne menu
  DishSelector.tsx      # Modal pro výběr/změnu jídla
  WeatherBadge.tsx      # Zobrazení počasí
  SpecialtyCard.tsx     # Karta týdenní speciality
  HistoryDayCard.tsx    # Karta dne v historii (read/edit)
/lib
  gemini.ts             # Gemini client a prompt
  weather.ts            # Open-Meteo API
  pdf.ts                # Generování PDF (jspdf)
  utils.ts              # Pomocné funkce
  types.ts              # TypeScript typy
/data
  master_recipes.json   # Recepty + sales_count (recipe_list + export_recipe_sales)
/supabase
  schema.sql            # SQL pro vytvoření tabulek
/scripts
  build-master-recipes.js  # recipe_list.xlsx + export_recipe_sales.xlsx (sloupec Porcí) → JSON
  migrate-to-supabase.js   # Migrace JSON → Supabase
```

## Technický stack
- Next.js 14 (App Router)
- Tailwind CSS
- Google Gemini API (gemini-1.5-pro)
- Open-Meteo API (počasí)
- jspdf (PDF export)
- **Supabase** – historie menu, vlastní jídla (PostgreSQL)

## Spuštění

```bash
# 1. Nainstaluj závislosti
npm install

# 2. Nastav env
cp .env.local.example .env.local
# Doplň: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# 3. Vytvoř tabulky v Supabase (SQL Editor) – spusť supabase/schema.sql

# 4. Spusť dev server
npm run dev
```

Aplikace běží na http://localhost:3000

## Regenerace master_recipes.json

Při změně Excel souborů (`recipe_list.xlsx` nebo `export_recipe_sales.xlsx`):

```bash
npm run build-recipes
```

Prodejnost (`sales_count` z export_recipe_sales, sloupec Porcí) ovlivňuje výběr jídel – Gemini preferuje populárnější jídla a vyhýbá se těm s nulovým či velmi nízkým prodejem.

## Vercel deployment

- `vercel` pro deploy
- Nastav env: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

## CWE / Bezpečnost
- Žádný user input v SQL (pouze JSON)
- Gemini API key v env, ne v kódu
- Open-Meteo: bez API key, veřejné API
- Validace vstupů na API route save-menu
