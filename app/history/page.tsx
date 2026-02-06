"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HistoryDayCard } from "@/components/HistoryDayCard";
import { SpecialtyCard } from "@/components/SpecialtyCard";
import { DishSelector } from "@/components/DishSelector";
import type {
  MenuHistoryEntry,
  MasterRecipe,
  MasterSoup,
  MenuDish,
} from "@/lib/types";

export default function HistoryPage() {
  const [history, setHistory] = useState<MenuHistoryEntry[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<MenuHistoryEntry | null>(null);
  const [recipes, setRecipes] = useState<MasterRecipe[]>([]);
  const [soups, setSoups] = useState<MasterSoup[]>([]);
  const [selectorState, setSelectorState] = useState<{
    open: boolean;
    title: string;
    isSoup: boolean;
    dayIndex: number;
    dishIndex?: number;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = () => {
    fetch("/api/get-history")
      .then((r) => r.json())
      .then((d) => setHistory(d.history ?? []))
      .catch(() => setHistory([]));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((d) => {
        setRecipes(d.recipes ?? []);
        setSoups(d.soups ?? []);
      })
      .catch(() => {});
  }, []);

  const formatDate = (s: string) => {
    try {
      return new Date(s).toLocaleDateString("cs-CZ", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return s;
    }
  };

  const startEdit = (entry: MenuHistoryEntry) => {
    setExpandedId(entry.id);
    setEditId(entry.id);
    setEditData(JSON.parse(JSON.stringify(entry)));
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData(null);
    setSelectorState(null);
  };

  const handleSave = async () => {
    if (!editData) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/update-menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editData.id,
          week_start: editData.week_start,
          week_end: editData.week_end,
          specialty: editData.specialty,
          days: editData.days.map((d) => ({
            date: d.date,
            day_name: d.day_name,
            soup: d.soup,
            dishes: d.dishes.map((x) => ({
              id: x.id,
              name: x.name,
              protein: x.protein,
              heaviness: x.heaviness,
              source: x.source ?? "master",
            })),
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chyba");
      loadHistory();
      cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepodařilo se uložit.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Opravdu smazat toto menu?")) return;
    setDeleting(id);
    setError(null);
    try {
      const res = await fetch(`/api/delete-menu?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chyba");
      loadHistory();
      if (expandedId === id) setExpandedId(null);
      if (editId === id) cancelEdit();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepodařilo se smazat.");
    } finally {
      setDeleting(null);
    }
  };

  const handleSoupChange = (dayIndex: number) => () => {
    const day = editData?.days[dayIndex];
    if (!day) return;
    setSelectorState({
      open: true,
      title: `${day.day_name} - Polévka`,
      isSoup: true,
      dayIndex,
    });
  };

  const handleDishChange = (dayIndex: number) => (dishIndex: number) => () => {
    const day = editData?.days[dayIndex];
    if (!day) return;
    setSelectorState({
      open: true,
      title: `${day.day_name} - ${day.dishes[dishIndex]?.name ?? "Jídlo"}`,
      isSoup: false,
      dayIndex,
      dishIndex,
    });
  };

  const handleSpecialtyChange = () => {
    setSelectorState({
      open: true,
      title: "Týdenní specialita",
      isSoup: false,
      dayIndex: -1,
    });
  };

  const handleSelectFromSelector = (item: {
    id: string;
    name: string;
    protein: MenuDish["protein"];
    heaviness: MenuDish["heaviness"];
    source: "master" | "custom";
  }) => {
    if (!editData) return;
    const state = selectorState!;
    setSelectorState(null);

    if (state.dayIndex === -1) {
      setEditData({
        ...editData,
        specialty: {
          id: item.id,
          name: item.name,
          source: item.source,
        },
      });
      return;
    }

    const newDays = [...editData.days];
    const day = { ...newDays[state.dayIndex] };

    if (state.isSoup) {
      day.soup = { id: item.id, name: item.name };
    } else if (state.dishIndex !== undefined) {
      const newDishes = [...day.dishes];
      newDishes[state.dishIndex] = {
        id: item.id,
        name: item.name,
        protein: item.protein,
        heaviness: item.heaviness,
        source: item.source,
      };
      day.dishes = newDishes;
    }
    newDays[state.dayIndex] = day;
    setEditData({ ...editData, days: newDays });
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/" className="text-amber-600 hover:underline">
            ← Úvod
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">
            Historie menu
          </h1>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-red-800">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-600">
            Zatím žádná historie menu.
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-4">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === entry.id ? null : entry.id)
                    }
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <span className="text-slate-400">
                      {expandedId === entry.id ? "▼" : "▶"}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">
                        {entry.week_start} – {entry.week_end}
                      </span>
                      <span className="ml-2 text-sm text-slate-500">
                        uloženo {formatDate(entry.created_at)}
                      </span>
                    </div>
                    <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-800">
                      {entry.specialty.name}
                    </span>
                  </button>
                  <div className="flex gap-2">
                    {editId !== entry.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => startEdit(entry)}
                          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
                        >
                          Upravit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry.id)}
                          disabled={deleting === entry.id}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          {deleting === entry.id ? "Mažu…" : "Smazat"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>

                {expandedId === entry.id && (
                  <div className="p-4">
                    {editId === entry.id && editData ? (
                      <div className="space-y-6">
                        <SpecialtyCard
                          name={editData.specialty.name}
                          onChangeClick={handleSpecialtyChange}
                        />
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                          {editData.days.map((day, i) => (
                            <HistoryDayCard
                              key={day.date}
                              day={day}
                              editable
                              onSoupChange={handleSoupChange(i)}
                              onDishChange={(di) => handleDishChange(i)(di)}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2 border-t border-slate-200 pt-4">
                          <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-lg bg-amber-600 px-6 py-2 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                          >
                            {saving ? "Ukládám…" : "Uložit změny"}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-lg border border-slate-300 px-6 py-2 hover:bg-slate-100"
                          >
                            Zrušit
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
                          <span className="text-sm font-medium text-amber-800">
                            Týdenní specialita:
                          </span>{" "}
                          <span className="font-semibold text-slate-800">
                            {entry.specialty.name}
                          </span>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                          {entry.days.map((day) => (
                            <HistoryDayCard key={day.date} day={day} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectorState?.open && editData && (
        <DishSelector
          title={selectorState.title}
          isSoup={selectorState.isSoup}
          recipes={recipes}
          soups={soups}
          currentProtein={
            selectorState.dishIndex !== undefined &&
            selectorState.dayIndex >= 0
              ? editData.days[selectorState.dayIndex]?.dishes[
                  selectorState.dishIndex
                ]?.protein
              : undefined
          }
          currentHeaviness={
            selectorState.dishIndex !== undefined &&
            selectorState.dayIndex >= 0
              ? editData.days[selectorState.dayIndex]?.dishes[
                  selectorState.dishIndex
                ]?.heaviness
              : undefined
          }
          onSelect={handleSelectFromSelector}
          onClose={() => setSelectorState(null)}
        />
      )}
    </main>
  );
}
