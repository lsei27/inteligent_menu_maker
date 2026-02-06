"use client";

import { PROTEIN_LABELS, HEAVINESS_LABELS } from "@/lib/labels";
import type { MenuHistoryEntry } from "@/lib/types";

const PROTEIN_COLORS: Record<string, string> = {
  vege: "bg-emerald-100 text-emerald-800",
  chicken: "bg-orange-100 text-orange-800",
  pork: "bg-pink-100 text-pink-800",
  beef: "bg-red-100 text-red-800",
  fish: "bg-blue-100 text-blue-800",
  mixed: "bg-slate-100 text-slate-700",
};

interface HistoryDayCardProps {
  day: MenuHistoryEntry["days"][0];
  editable?: boolean;
  onSoupChange?: () => void;
  onDishChange?: (dishIndex: number) => () => void;
}

export function HistoryDayCard({
  day,
  editable = false,
  onSoupChange,
  onDishChange,
}: HistoryDayCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 border-b border-slate-100 pb-2 text-base font-semibold text-slate-800">
        {day.day_name}
        <span className="ml-2 text-sm font-normal text-slate-500">
          {day.date}
        </span>
      </h3>

      <div className="mb-3">
        <span className="text-sm text-slate-600">Polévka: </span>
        <span className="text-slate-800">{day.soup.name}</span>
        {editable && onSoupChange && (
          <button
            type="button"
            onClick={onSoupChange}
            className="ml-2 rounded border border-slate-300 px-2 py-0.5 text-xs hover:bg-slate-100"
          >
            Změnit
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {day.dishes.map((d, i) => (
          <div
            key={`${d.id}-${i}`}
            className="flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-1.5"
          >
            <span className="text-sm font-medium text-slate-800">{d.name}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-xs ${
                PROTEIN_COLORS[d.protein] ?? PROTEIN_COLORS.mixed
              }`}
            >
              {PROTEIN_LABELS[d.protein] ?? d.protein}
            </span>
            <span className="text-xs text-slate-500">
              {HEAVINESS_LABELS[d.heaviness]}
            </span>
            {editable && onDishChange && (
              <button
                type="button"
                onClick={onDishChange(i)}
                className="rounded border border-slate-300 px-1.5 py-0.5 text-xs hover:bg-slate-200"
              >
                Změnit
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
