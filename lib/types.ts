/**
 * Datové typy pro aplikaci Generátor menu
 */

export type ProteinType = "vege" | "chicken" | "pork" | "beef" | "fish" | "mixed";
export type HeavinessType = "light" | "medium" | "heavy";
export type SeasonType = "summer" | "winter" | "all-year";

export interface MasterRecipe {
  id: string;
  name: string;
  category?: string;
  cost?: number;
  price?: number;
  heaviness: HeavinessType;
  protein: ProteinType;
  season: SeasonType;
  /** Počet prodaných porcí za období (z export_recipe_sales.xlsx) */
  sales_count?: number;
}

export interface MasterSoup {
  id: string;
  name: string;
  heaviness: HeavinessType;
  season: SeasonType;
  /** Počet prodaných porcí za období (z export_recipe_sales.xlsx) */
  sales_count?: number;
}

export interface WeatherDay {
  date: string;
  temp_max: number;
  temp_min: number;
  weathercode: number;
  condition: string;
}

export interface MenuDish {
  id: string;
  name: string;
  protein: ProteinType;
  heaviness: HeavinessType;
  source?: "master" | "custom";
}

export interface MenuSoup {
  id: string;
  name: string;
}

export interface Specialty {
  id: string | null;
  name: string;
  reason?: string;
  source?: "master" | "custom";
}

export interface MenuDay {
  date: string;
  day_name: string;
  weather?: {
    temp_max: number;
    temp_min: number;
    condition: string;
  };
  soup: MenuSoup;
  dishes: MenuDish[];
  reasoning?: string;
}

export interface GeneratedMenu {
  specialty: Specialty;
  days: MenuDay[];
}

export interface MenuHistoryEntry {
  id: string;
  week_start: string;
  week_end: string;
  created_at: string;
  specialty: { id: string; name: string; source: "master" | "custom" };
  days: Array<{
    date: string;
    day_name: string;
    weather?: { temp_max: number; temp_min: number; condition: string };
    soup: MenuSoup;
    dishes: MenuDish[];
  }>;
}

export interface CustomDish {
  id: string;
  name: string;
  protein: ProteinType;
  heaviness: HeavinessType;
  created_at: string;
}
