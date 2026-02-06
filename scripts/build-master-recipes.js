/**
 * Konvertuje recipe_list.xlsx do master_recipes.json
 * Mapuje strukturu podle specifikace aplikace.
 */
const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const BASE = path.join(__dirname, "..");
const RECIPE_FILE = path.join(BASE, "recipe_list.xlsx");

// Indikátory masa – pokud jsou v názvu, jídlo NENÍ vegetariánské
const MEAT_INDICATORS = /uzen|slanina|šunka|klobás|maso|řízek|bůček|vepř|hověz|kuř|krůt|ryb|losos|kapr|drůbež/i;

// Heuristiky pro protein – POŘADÍ DŮLEŽITÉ (maso před vege)
const PROTEIN_PATTERNS = [
  { regex: /kuř(e|ecí|etě|ec)|drůbež|krůt/i, value: "chicken" },
  {
    regex:
      /vepř|bůček|šunka|klobás|uzen|uzené|uzený|uzená|uzení|slanina/i,
    value: "pork",
  },
  { regex: /hověz|steak|guláš|svíčková|řízek hověz/i, value: "beef" },
  { regex: /ryb|losos|tresk|kapr|tilapi|pangasius/i, value: "fish" },
  {
    regex: /sýrový řízek|smažený sýr/i,
    value: "vege",
  },
  {
    regex: /řízek|holandský|vídeňský|smažený řízek/i,
    value: "pork",
  },
  {
    regex:
      /tvaroh|tofu|vege|vegetarián|karbanátky vege|plack|palačink|omlet/i,
    value: "vege",
  },
  {
    regex: /sýr.*salát|sýrová|mozzarella|ricotta/i,
    value: "vege",
  },
  {
    regex:
      /zelenin|špenát|houb|těstovin|noky|gnochi|rizoto/i,
    value: "vege",
  },
  {
    regex: /čočk|fazole/i,
    value: "vege",
  },
];

function inferProtein(name) {
  const n = String(name || "").toLowerCase();
  for (const { regex, value } of PROTEIN_PATTERNS) {
    if (regex.test(n)) return value;
  }
  return "mixed";
}

function inferProteinSafe(name) {
  const n = String(name || "").toLowerCase();
  if (MEAT_INDICATORS.test(n)) {
    for (const { regex, value } of PROTEIN_PATTERNS) {
      if (value !== "vege" && regex.test(n)) return value;
    }
    return "mixed";
  }
  return inferProtein(name);
}

// Heuristiky pro sezónnost
const SEASON_PATTERNS = [
  { regex: /gril|salát|lehk|svěží|rajčat|okurka|meloun/i, value: "summer" },
  { regex: /guláš|svíčková|pečen|zima|hork|tepl|svařen|punč/i, value: "winter" },
];

function inferSeason(name) {
  const n = String(name || "").toLowerCase();
  for (const { regex, value } of SEASON_PATTERNS) {
    if (regex.test(n)) return value;
  }
  return "all-year";
}

// Heuristiky pro těžkost
const HEAVINESS_PATTERNS = [
  { regex: /salát|polévka|lehk|zelenin|svěží/i, value: "light" },
  {
    regex:
      /guláš|svíčková|řízek|pečen|smažen|knedlík|omáčk|bůček|klobás|uzené/i,
    value: "heavy",
  },
];

function inferHeaviness(name, isSoup) {
  if (isSoup) return "light";
  const n = String(name || "").toLowerCase();
  for (const { regex, value } of HEAVINESS_PATTERNS) {
    if (regex.test(n)) return value;
  }
  return "medium";
}

function cleanName(name) {
  return String(name || "")
    .replace(/-s$/, "")
    .trim();
}

function main() {
  const wb = XLSX.readFile(RECIPE_FILE);
  const ws = wb.Sheets["Seznam kalkulací"];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

  const headers = rows[0];
  const idIdx = headers.indexOf("ID");
  const nameIdx = headers.indexOf("Název");
  const catIdx = headers.indexOf("Kategorie");
  const costIdx = headers.indexOf("Náklad porce bez DPH");
  const priceIdx = headers.indexOf("Prodej porce s DPH");
  const activeIdx = headers.indexOf("Aktivní");

  const recipes = [];
  const soups = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const id = row[idIdx];
    const name = row[nameIdx];
    const category = String(row[catIdx] || "");
    const cost = parseFloat(row[costIdx]) || 0;
    const price = parseFloat(row[priceIdx]) || 0;
    const active = row[activeIdx];

    if (!id || !name || active !== "X") continue;

    const isSoup = /polévk/i.test(category);
    const isLunchMenu = /obědové menu/i.test(category);

    if (!isSoup && !isLunchMenu) continue;

    const clean = cleanName(name);
    if (!clean) continue;

    const entry = {
      id: String(id),
      name: clean,
      category,
      cost: Math.round(cost * 100) / 100,
      price: Math.round(price),
      heaviness: inferHeaviness(name, isSoup),
      protein: inferProteinSafe(name),
      season: inferSeason(name),
    };

    if (isSoup) {
      soups.push({
        id: entry.id,
        name: entry.name,
        heaviness: entry.heaviness,
        season: entry.season,
      });
    } else {
      recipes.push(entry);
    }
  }

  const output = { recipes, soups };
  const outPath = path.join(BASE, "data", "master_recipes.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
  console.log(
    `Created ${outPath}: ${recipes.length} recipes, ${soups.length} soups`
  );
}

main();
