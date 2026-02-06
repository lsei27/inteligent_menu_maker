/**
 * Určení báze jídla z názvu receptu – pro pravidla rozmanitosti týdenního menu.
 * Vychází z historických dat restaurace Sousto (sousto_menu_komplet.md):
 * stejná báze (noky, risotto, tortilla...) se v týdnu objevuje max 1×.
 */
const BASE_PATTERNS: Array<{ pattern: RegExp; base: string }> = [
  { pattern: /\b(gnocchi|noky|nok[yu])\b/i, base: "noky" },
  { pattern: /\bpenne\b/i, base: "penne" },
  { pattern: /\bspaghetti\b/i, base: "spaghetti" },
  { pattern: /\btagliatelle\b/i, base: "tagliatelle" },
  { pattern: /\blasagne\b/i, base: "lasagne" },
  { pattern: /\brisotto\b/i, base: "risotto" },
  { pattern: /\btortilla\b/i, base: "tortilla" },
  { pattern: /\bburger\b/i, base: "burger" },
  { pattern: /\bkuskus\b/i, base: "kuskus" },
  { pattern: /\bhalušk[ye]\b/i, base: "halušky" },
  { pattern: /\bpiroh[y]?\b/i, base: "pirohy" },
  { pattern: /\b(strapačky|cmunda)\b/i, base: "strapačky" },
  { pattern: /\bzapečené těstoviny\b/i, base: "zapečené těstoviny" },
  { pattern: /\b(minestrone|minestrón)\b/i, base: "minestrone" },
];

/**
 * Vrátí bázi jídla z názvu receptu. Pokud není rozpoznána, vrátí null.
 * Použij pro pravidlo: každá báze max 1× za týden (noky, risotto, tortilla...).
 */
export function getDishBase(name: string): string | null {
  const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  for (const { pattern, base } of BASE_PATTERNS) {
    if (pattern.test(normalized) || pattern.test(name)) return base;
  }
  return null;
}
