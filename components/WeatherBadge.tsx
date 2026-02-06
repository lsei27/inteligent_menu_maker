"use client";

const CONDITION_ICONS: Record<string, string> = {
  clear: "☀️",
  cloudy: "☁️",
  rain: "🌧️",
  snow: "❄️",
  fog: "🌫️",
  storm: "⛈️",
};

interface WeatherBadgeProps {
  weather?: {
    temp_max: number;
    temp_min: number;
    condition: string;
  };
  date?: string;
  dayName?: string;
  compact?: boolean;
}

export function WeatherBadge({
  weather,
  date,
  dayName,
  compact = false,
}: WeatherBadgeProps) {
  if (!weather) return null;
  const icon = CONDITION_ICONS[weather.condition] ?? "☁️";
  if (compact) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-sm"
        title={`${weather.temp_min}–${weather.temp_max}°C, ${weather.condition}`}
      >
        <span>{icon}</span>
        <span>{weather.temp_min}–{weather.temp_max}°C</span>
      </span>
    );
  }
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      {dayName && (
        <div className="text-sm font-medium text-slate-600">{dayName}</div>
      )}
      {date && (
        <div className="text-xs text-slate-500">{date}</div>
      )}
      <div className="mt-1 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        <span className="text-sm">
          {weather.temp_min}–{weather.temp_max}°C
        </span>
      </div>
    </div>
  );
}
