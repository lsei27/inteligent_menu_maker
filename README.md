# Generátor menu

Webová aplikace pro inteligentní generování týdenního poledního menu restaurace pomocí AI (Google Gemini).

## Funkce

- **AI generování** – menu na základě počasí, historie a pravidel
- **Úpravy kuchařem** – změna polévky, jídel nebo speciality
- **Vlastní jídla** – přidání jídel mimo master list
- **Export PDF** – tisková podoba menu
- **Historie** – přehled předchozích týdnů

## Technologie

- Next.js 14 (App Router)
- Tailwind CSS
- Google Gemini API
- Open-Meteo API (počasí)
- jspdf (PDF export)
- **Supabase** – databáze pro historii menu a vlastní jídla

## Rychlý start

```bash
# Instalace
npm install

# Nastavení
cp .env.local.example .env.local
# Doplň: GEMINI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

# 1. Vytvoř tabulky v Supabase – spusť SQL z supabase/schema.sql v SQL Editoru
# 2. (Volitelné) Migruj existující data: npm run migrate-to-supabase

# Vývoj
npm run dev
```

Otevři http://localhost:3000

## Skripty

| Příkaz | Popis |
|--------|-------|
| `npm run dev` | Vývojový server |
| `npm run build` | Production build |
| `npm run start` | Spuštění production |
| `npm run build-recipes` | Regenerace `data/master_recipes.json` z Excelu |
| `npm run migrate-to-supabase` | Migrace dat z JSON do Supabase |

## Datové zdroje

- `data/master_recipes.json` – recepty a polévky (generováno z Excelu, zůstává lokálně)
- **Supabase** – historie menu (`menu_history`), vlastní jídla (`custom_dishes`)

## Deployment (Vercel)

```bash
vercel
```

Nastav env proměnné v Vercel dashboardu: `GEMINI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
