"use client";

interface SpecialtyCardProps {
  name: string;
  reason?: string;
  onChangeClick: () => void;
}

export function SpecialtyCard({
  name,
  reason,
  onChangeClick,
}: SpecialtyCardProps) {
  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-wide text-amber-800">
            Týdenní specialita
          </h3>
          <p className="mt-1 text-lg font-semibold text-slate-800">{name}</p>
          {reason && (
            <p className="mt-0.5 text-sm text-slate-600">{reason}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onChangeClick}
          className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-800 hover:bg-amber-50"
        >
          Změnit
        </button>
      </div>
    </div>
  );
}
