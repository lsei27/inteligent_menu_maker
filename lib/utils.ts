/**
 * Pomocné funkce pro práci s daty a datumy
 */

const DAY_NAMES = [
  "Neděle",
  "Pondělí",
  "Úterý",
  "Středa",
  "Čtvrtek",
  "Pátek",
  "Sobota",
];

/** Vrátí pondělí následujícího týdne */
export function getNextWeekMonday(): Date {
  const now = new Date();
  const day = now.getDay();
  const daysUntilNextMonday = day === 0 ? 1 : day === 6 ? 2 : 8 - day;
  const next = new Date(now);
  next.setDate(now.getDate() + daysUntilNextMonday);
  next.setHours(0, 0, 0, 0);
  return next;
}

/** Pracovní dny (Po-Pá) od daného pondělí */
export function getWorkdaysFromMonday(monday: Date): Date[] {
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

export function formatDateISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function getDayName(d: Date): string {
  return DAY_NAMES[d.getDay()];
}

/** Počet dní od "dnes" do začátku forecastu pro next week */
export function getForecastOffsetForNextWeek(): number {
  const now = new Date();
  const day = now.getDay();
  const daysUntilNextMonday = day === 0 ? 1 : day === 6 ? 2 : 8 - day;
  return daysUntilNextMonday;
}

/** Načte JSON ze souboru (Node.js) */
export async function readJsonFile<T>(filePath: string): Promise<T> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ""));
  const content = await fs.readFile(fullPath, "utf-8");
  return JSON.parse(content) as T;
}

/** Zapíše JSON do souboru */
export async function writeJsonFile(
  filePath: string,
  data: unknown
): Promise<void> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const fullPath = path.join(process.cwd(), filePath.replace(/^\//, ""));
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, JSON.stringify(data, null, 2), "utf-8");
}

export function getSeasonFromMonth(month: number): "summer" | "winter" | "all-year" {
  if (month >= 5 && month <= 8) return "summer";
  if (month >= 11 || month <= 2) return "winter";
  return "all-year";
}
