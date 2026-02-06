"use client";

import { useState, useMemo } from "react";
import { PROTEIN_LABELS, HEAVINESS_LABELS } from "@/lib/labels";
import type { MasterRecipe, MasterSoup, ProteinType, HeavinessType } from "@/lib/types";

const PROTEIN_OPTIONS: ProteinType[] = [
  "vege",
  "chicken",
  "pork",
  "beef",
  "fish",
  "mixed",
];
const HEAVINESS_OPTIONS: HeavinessType[] = ["light", "medium", "heavy"];

interface DishSelectorProps {
  title: string;
  isSoup: boolean;
  recipes: MasterRecipe[];
  soups: MasterSoup[];
  currentProtein?: ProteinType;
  currentHeaviness?: HeavinessType;
  onSelect: (item: {
    id: string;
    name: string;
    protein: ProteinType;
    heaviness: HeavinessType;
    source: "master" | "custom";
  }) => void;
  onClose: () => void;
}

export function DishSelector({
  title,
  isSoup,
  recipes,
  soups,
  currentProtein,
  currentHeaviness,
  onSelect,
  onClose,
}: DishSelectorProps) {
  const [search, setSearch] = useState("");
  const [customName, setCustomName] = useState("");
  const [customProtein, setCustomProtein] = useState<ProteinType>("mixed");
  const [customHeaviness, setCustomHeaviness] = useState<HeavinessType>("medium");

  const list = isSoup ? soups : recipes;
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return list;
    return list.filter((item) =>
      item.name.toLowerCase().includes(q)
    );
  }, [list, search]);

  const recommended = useMemo(() => {
    if (isSoup) return filtered.slice(0, 8);
    return filtered.filter(
      (r) =>
        "protein" in r &&
        r.protein === currentProtein &&
        r.heaviness === currentHeaviness
    ).slice(0, 6);
  }, [filtered, isSoup, currentProtein, currentHeaviness]);

  const handleSelectMaster = (item: MasterRecipe | MasterSoup) => {
    const r = item as MasterRecipe;
    onSelect({
      id: item.id,
      name: item.name,
      protein: "protein" in r ? r.protein : "mixed",
      heaviness: item.heaviness,
      source: "master",
    });
  };

  const handleAddCustom = () => {
    const name = customName.trim();
    if (!name) return;
    onSelect({
      id: `custom_${Date.now()}`,
      name,
      protein: isSoup ? "mixed" : customProtein,
      heaviness: isSoup ? "light" : customHeaviness,
      source: "custom",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-lg font-semibold">Změnit: {title}</h2>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          <input
            type="text"
            placeholder="Hledat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />

          {!isSoup && recommended.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-slate-600">
                Doporučené alternativy
              </h3>
              <ul className="space-y-1">
                {recommended.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectMaster(item)}
                      className="w-full rounded px-3 py-2 text-left hover:bg-slate-100"
                    >
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-600">
              {isSoup ? "Polévky" : "Všechna jídla"}
            </h3>
            <ul className="max-h-48 space-y-1 overflow-y-auto">
              {filtered.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectMaster(item)}
                    className="w-full rounded px-3 py-2 text-left hover:bg-slate-100"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3">
            <h3 className="mb-2 text-sm font-medium text-amber-800">
              Přidat vlastní jídlo
            </h3>
            {!isSoup && (
              <>
                <input
                  type="text"
                  placeholder="Název jídla"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="mb-2 w-full rounded border border-amber-200 px-3 py-2"
                />
                <div className="mb-2 flex gap-2">
                  <select
                    value={customProtein}
                    onChange={(e) =>
                      setCustomProtein(e.target.value as ProteinType)
                    }
                    className="rounded border border-amber-200 px-2 py-1"
                  >
                    {PROTEIN_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {PROTEIN_LABELS[p]}
                      </option>
                    ))}
                  </select>
                  <select
                    value={customHeaviness}
                    onChange={(e) =>
                      setCustomHeaviness(e.target.value as HeavinessType)
                    }
                    className="rounded border border-amber-200 px-2 py-1"
                  >
                    {HEAVINESS_OPTIONS.map((h) => (
                      <option key={h} value={h}>
                        {HEAVINESS_LABELS[h]}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            {isSoup && (
              <input
                type="text"
                placeholder="Název polévky"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mb-2 w-full rounded border border-amber-200 px-3 py-2"
              />
            )}
            <button
              type="button"
              onClick={handleAddCustom}
              disabled={!customName.trim()}
              className="rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
            >
              Přidat
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-4 py-2 hover:bg-slate-50"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
