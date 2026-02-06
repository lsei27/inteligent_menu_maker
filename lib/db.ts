/**
 * Databázové operace - Supabase
 */
import { supabase } from "./supabase";
import type { MenuHistoryEntry, CustomDish } from "./types";

export async function getMenuHistory(limit = 12): Promise<MenuHistoryEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("menu_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[db] getMenuHistory:", error);
    return [];
  }
  return (data ?? []) as MenuHistoryEntry[];
}

export async function getHistoryForGeneration(): Promise<MenuHistoryEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("menu_history")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) {
    console.error("[db] getHistoryForGeneration:", error);
    return [];
  }
  return (data ?? []) as MenuHistoryEntry[];
}

export async function insertMenuEntry(
  entry: Omit<MenuHistoryEntry, "id" | "created_at">
): Promise<{ id: string } | null> {
  if (!supabase) return null;
  const row = {
    week_start: entry.week_start,
    week_end: entry.week_end,
    specialty: entry.specialty,
    days: entry.days,
  };
  const { data, error } = await supabase
    .from("menu_history")
    .insert(row)
    .select("id")
    .single();
  if (error) {
    console.error("[db] insertMenuEntry:", error);
    return null;
  }
  return { id: (data as { id: string }).id };
}

export async function updateMenuEntry(
  id: string,
  data: {
    week_start: string;
    week_end: string;
    specialty: MenuHistoryEntry["specialty"];
    days: MenuHistoryEntry["days"];
  }
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("menu_history")
    .update({
      week_start: data.week_start,
      week_end: data.week_end,
      specialty: data.specialty,
      days: data.days,
    })
    .eq("id", id);
  if (error) {
    console.error("[db] updateMenuEntry:", error);
    return false;
  }
  return true;
}

export async function deleteMenuEntry(id: string): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase
    .from("menu_history")
    .delete()
    .eq("id", id);
  if (error) {
    console.error("[db] deleteMenuEntry:", error);
    return false;
  }
  return true;
}

export async function getCustomDishes(): Promise<CustomDish[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("custom_dishes")
    .select("id, name, protein, heaviness, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[db] getCustomDishes:", error);
    return [];
  }
  return (data ?? []) as CustomDish[];
}

export async function insertCustomDishes(
  dishes: CustomDish[]
): Promise<void> {
  if (!supabase || dishes.length === 0) return;
  const rows = dishes.map((d) => ({
    id: d.id,
    name: d.name,
    protein: d.protein,
    heaviness: d.heaviness,
    created_at: d.created_at,
  }));
  const { error } = await supabase.from("custom_dishes").upsert(rows, {
    onConflict: "id",
    ignoreDuplicates: true,
  });
  if (error) {
    console.error("[db] insertCustomDishes:", error);
  }
}
