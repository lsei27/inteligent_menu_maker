"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MenuDay } from "@/components/MenuDay";
import { SpecialtyCard } from "@/components/SpecialtyCard";
import { WeatherBadge } from "@/components/WeatherBadge";
import { DishSelector } from "@/components/DishSelector";
import type {
  MasterRecipe,
  MasterSoup,
  MenuDay as MenuDayType,
} from "@/lib/types";

interface GeneratedMenuState {
  week_start: string;
  week_end: string;
  specialty: { id: string; name: string; reason?: string; source: string };
  days: MenuDayType[];
}

export default function GeneratePage() {
  const router = useRouter();
  const [menu, setMenu] = useState<GeneratedMenuState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<MasterRecipe[]>([]);
  const [soups, setSoups] = useState<MasterSoup[]>([]);
  const [selectorState, setSelectorState] = useState<{
    open: boolean;
    title: string;
    isSoup: boolean;
    dayIndex: number;
    dishIndex?: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/recipes")
      .then((r) => r.json())
      .then((d) => {
        setRecipes(d.recipes ?? []);
        setSoups(d.soups ?? []);
      })
      .catch(() => {});
  }, []);

  const generateMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-menu", { method: "POST" });
      let data: { error?: string };
      try {
        data = await res.json();
      } catch {
        throw new Error(`Server vrátil neplatnou odpověď (${res.status})`);
      }
      if (!res.ok) throw new Error(data.error ?? "Chyba při generování");
      setMenu(data as GeneratedMenuState);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nepodařilo se vygenerovat menu.");
    } finally {
      setLoading(false);
    }
  };

  const handleSoupChange = (dayIndex: number) => () => {
    const day = menu?.days[dayIndex];
    if (!day) return;
    setSelectorState({
      open: true,
      title: `${day.day_name} - Polévka`,
      isSoup: true,
      dayIndex,
    });
  };

  const handleDishChange = (dayIndex: number) => (dishIndex: number) => () => {
    const day = menu?.days[dayIndex];
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
    protein: "vege" | "chicken" | "pork" | "beef" | "fish" | "mixed";
    heaviness: "light" | "medium" | "heavy";
    source: "master" | "custom";
  }) => {
    if (!menu) return;
    const state = selectorState!;
    setSelectorState(null);

    if (state.dayIndex === -1) {
      setMenu({
        ...menu,
        specialty: {
          ...menu.specialty,
          id: item.id,
          name: item.name,
          source: item.source,
        },
      });
      return;
    }

    const newDays = [...menu.days];
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
    setMenu({ ...menu, days: newDays });
  };

  const handleRegenerate = () => {
    generateMenu();
  };

  const handleApproveAndExport = async () => {
    if (!menu) return;
    try {
      await fetch("/api/save-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_start: menu.week_start,
          week_end: menu.week_end,
          specialty: {
            id: menu.specialty.id,
            name: menu.specialty.name,
            source: menu.specialty.source,
          },
          days: menu.days.map((d) => ({
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
      const pdfRes = await fetch("/api/export-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });
      if (!pdfRes.ok) {
        const err = await pdfRes.json().catch(() => ({}));
        throw new Error(err.error ?? "Export PDF selhal");
      }
      const blob = await pdfRes.blob();
      if (blob.type !== "application/pdf") {
        throw new Error("Server vrátil neplatná data místo PDF");
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `menu-${menu.week_start}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      router.push("/history");
    } catch {
      setError("Nepodařilo se uložit nebo exportovat.");
    }
  };

  if (!menu && !loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="mx-auto max-w-2xl text-center">
          <img
            src="/logo-s.svg"
            alt="Sou100 logo"
            className="mx-auto mb-6 h-20 w-auto"
          />
          <h1 className="mb-6 text-2xl font-bold text-slate-800">
            Vygenerovat menu
          </h1>
          {error && (
            <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={generateMenu}
            disabled={loading}
            className="rounded-xl bg-amber-600 px-8 py-4 text-lg font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "Generuji menu... (10–15 s)" : "Vygenerovat menu na příští týden"}
          </button>
          <div className="mt-6">
            <Link href="/" className="text-amber-600 hover:underline">
              ← Zpět na úvod
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent mx-auto" />
          <p className="text-lg text-slate-600">Generuji menu... (10–15 s)</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col items-center">
          <img
            src="/logo-s.svg"
            alt="Sou100 logo"
            className="mb-4 h-16 w-auto"
          />
          <div className="flex w-full items-center justify-between">
            <Link href="/" className="text-amber-600 hover:underline">
              ← Úvod
            </Link>
            <h1 className="text-xl font-bold text-slate-800">
              Menu {menu!.week_start} – {menu!.week_end}
            </h1>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-800">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {menu!.days.map((d) => (
            <WeatherBadge
              key={d.date}
              weather={d.weather}
              date={d.date}
              dayName={d.day_name}
            />
          ))}
        </div>

        <div className="mb-6">
          <SpecialtyCard
            name={menu!.specialty.name}
            reason={menu!.specialty.reason}
            onChangeClick={handleSpecialtyChange}
          />
        </div>

        <div className="space-y-6">
          {menu!.days.map((day, i) => (
            <MenuDay
              key={day.date}
              day={day}
              onSoupChange={handleSoupChange(i)}
              onDishChange={handleDishChange(i)}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-4 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={handleRegenerate}
            className="rounded-lg border border-slate-300 px-6 py-2 hover:bg-slate-100"
          >
            Regenerovat celé menu
          </button>
          <button
            type="button"
            onClick={handleApproveAndExport}
            className="rounded-lg bg-amber-600 px-6 py-2 font-semibold text-white hover:bg-amber-700"
          >
            Schválit a exportovat PDF
          </button>
        </div>
      </div>

      {selectorState?.open && (
        <DishSelector
          title={selectorState.title}
          isSoup={selectorState.isSoup}
          recipes={recipes}
          soups={soups}
          currentProtein={
            selectorState.dishIndex !== undefined &&
            selectorState.dayIndex >= 0
              ? menu?.days[selectorState.dayIndex]?.dishes[selectorState.dishIndex]
                  ?.protein
              : undefined
          }
          currentHeaviness={
            selectorState.dishIndex !== undefined &&
            selectorState.dayIndex >= 0
              ? menu?.days[selectorState.dayIndex]?.dishes[selectorState.dishIndex]
                  ?.heaviness
              : undefined
          }
          onSelect={handleSelectFromSelector}
          onClose={() => setSelectorState(null)}
        />
      )}
    </main>
  );
}
