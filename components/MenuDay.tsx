"use client";

import { WeatherBadge } from "./WeatherBadge";
import { PROTEIN_LABELS, HEAVINESS_LABELS } from "@/lib/labels";
import type { MenuDay as MenuDayType } from "@/lib/types";

const PROTEIN_COLORS: Record<string, string> = {
  vege: "bg-emerald-100 text-emerald-800",
  chicken: "bg-orange-100 text-orange-800",
  pork: "bg-pink-100 text-pink-800",
  beef: "bg-red-100 text-red-800",
  fish: "bg-blue-100 text-blue-800",
  mixed: "bg-slate-100 text-slate-700",
};

interface MenuDayProps {
  day: MenuDayType;
  onSoupChange: () => void;
  onDishChange: (dishIndex: number) => () => void;
}

export function MenuDay({ day, onSoupChange, onDishChange }: MenuDayProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-slate-800">
          {day.day_name}
        </h3>
        <span className="text-sm text-slate-500">{day.date}</span>
        {day.weather && (
          <WeatherBadge weather={day.weather} compact />
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 p-2">
          <span className="font-medium">Polévka:</span>
          <span className="text-slate-700">{day.soup.name}</span>
          <button
            type="button"
            onClick={onSoupChange}
            className="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-100"
          >
            Změnit
          </button>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-600">
            Hlavní jídla:
          </span>
          {day.dishes.map((dish, i) => (
            <div
              key={`${dish.id}-${i}`}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 p-2"
            >
              <span className="flex-1 font-medium text-slate-800">
                {dish.name}
              </span>
              <span
                className={`rounded px-1.5 py-0.5 text-xs ${
                  PROTEIN_COLORS[dish.protein] ?? PROTEIN_COLORS.mixed
                }`}
              >
                {PROTEIN_LABELS[dish.protein] ?? dish.protein}
              </span>
              <span className="text-xs text-slate-500">
                {HEAVINESS_LABELS[dish.heaviness]}
              </span>
              <button
                type="button"
                onClick={onDishChange(i)}
                className="rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100"
              >
                Změnit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
