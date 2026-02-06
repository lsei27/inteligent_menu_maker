/**
 * Open-Meteo API client pro předpověď počasí
 */
import type { WeatherDay } from "./types";
import {
  getWorkdaysFromMonday,
  getNextWeekMonday,
  formatDateISO,
} from "./utils";

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=50.0755&longitude=14.4378&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Europe/Prague&forecast_days=14";

const WEATHER_CODE_MAP: Record<number, string> = {
  0: "clear",
  1: "clear",
  2: "cloudy",
  3: "cloudy",
  45: "fog",
  48: "fog",
  51: "rain",
  53: "rain",
  55: "rain",
  61: "rain",
  63: "rain",
  65: "rain",
  66: "rain",
  67: "rain",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  80: "rain",
  81: "rain",
  82: "rain",
  85: "snow",
  86: "snow",
  95: "storm",
  96: "storm",
  99: "storm",
};

function weatherCodeToCondition(code: number): string {
  return WEATHER_CODE_MAP[code] ?? "cloudy";
}

interface OpenMeteoResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weathercode: number[];
  };
}

/**
 * Vrátí počasí pro pracovní dny následujícího týdne (Po-Pá)
 */
export async function fetchWeatherForNextWeek(): Promise<WeatherDay[]> {
  const res = await fetch(OPEN_METEO_URL);
  if (!res.ok) {
    throw new Error("Nepodařilo se načíst předpověď počasí. Zkuste to později.");
  }
  const data = (await res.json()) as OpenMeteoResponse;
  const { time, temperature_2m_max, temperature_2m_min, weathercode } =
    data.daily;

  const workdays = getWorkdaysFromMonday(getNextWeekMonday());
  const targetDates = workdays.map((d) => formatDateISO(d));

  const result: WeatherDay[] = [];
  for (let i = 0; i < time.length; i++) {
    const date = time[i];
    if (targetDates.includes(date)) {
      result.push({
        date,
        temp_max: Math.round(temperature_2m_max[i] ?? 10),
        temp_min: Math.round(temperature_2m_min[i] ?? 5),
        weathercode: weathercode[i] ?? 2,
        condition: weatherCodeToCondition(weathercode[i] ?? 2),
      });
    }
  }
  return result;
}

/**
 * Fallback počasí při výpadku API
 */
export function getDefaultWeather(): WeatherDay[] {
  const workdays = getWorkdaysFromMonday(getNextWeekMonday());
  return workdays.map((d) => ({
    date: formatDateISO(d),
    temp_max: 10,
    temp_min: 5,
    weathercode: 2,
    condition: "cloudy",
  }));
}
