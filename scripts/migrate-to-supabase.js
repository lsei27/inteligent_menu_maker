/**
 * Migruje data z JSON souborů do Supabase.
 * Spusť: node scripts/migrate-to-supabase.js
 * Načte .env.local automaticky.
 */
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Chybí env. Spusť s: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/migrate-to-supabase.js"
    );
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const dataDir = path.join(__dirname, "..", "data");

  const menuPath = path.join(dataDir, "menu_history.json");
  if (fs.existsSync(menuPath)) {
    const { history } = JSON.parse(fs.readFileSync(menuPath, "utf-8"));
    if (history?.length > 0) {
      const { data, error } = await supabase
        .from("menu_history")
        .insert(
          history.map((e) => ({
            id: e.id,
            week_start: e.week_start,
            week_end: e.week_end,
            created_at: e.created_at,
            specialty: e.specialty,
            days: e.days,
          }))
        );
      if (error) {
        console.error("menu_history:", error);
      } else {
        console.log(`Migrováno ${history.length} záznamů do menu_history`);
      }
    }
  }

  const customPath = path.join(dataDir, "custom_dishes.json");
  if (fs.existsSync(customPath)) {
    const { dishes } = JSON.parse(fs.readFileSync(customPath, "utf-8"));
    if (dishes?.length > 0) {
      const { error } = await supabase.from("custom_dishes").upsert(
        dishes.map((d) => ({
          id: d.id,
          name: d.name,
          protein: d.protein,
          heaviness: d.heaviness,
          created_at: d.created_at,
        })),
        { onConflict: "id" }
      );
      if (error) {
        console.error("custom_dishes:", error);
      } else {
        console.log(`Migrováno ${dishes.length} záznamů do custom_dishes`);
      }
    }
  }

  console.log("Migrace dokončena.");
}

main().catch(console.error);
