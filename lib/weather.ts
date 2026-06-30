export interface DayForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  precipProbability: number;
  weatherCode: number;
}

export interface WeatherData {
  currentTemp: number;
  currentWeatherCode: number;
  forecast: DayForecast[];
}

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    windspeed: number;
    weathercode: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };
}

const WMO_ICONS: Record<number, { emoji: string; label: string }> = {
  0: { emoji: "☀️", label: "Despejado" },
  1: { emoji: "🌤️", label: "Mayormente despejado" },
  2: { emoji: "⛅", label: "Parcialmente nublado" },
  3: { emoji: "☁️", label: "Nublado" },
  45: { emoji: "🌫️", label: "Niebla" },
  48: { emoji: "🌫️", label: "Niebla con escarcha" },
  51: { emoji: "🌦️", label: "Llovizna ligera" },
  53: { emoji: "🌦️", label: "Llovizna" },
  61: { emoji: "🌧️", label: "Lluvia ligera" },
  63: { emoji: "🌧️", label: "Lluvia" },
  65: { emoji: "🌧️", label: "Lluvia intensa" },
  71: { emoji: "🌨️", label: "Nieve ligera" },
  80: { emoji: "🌦️", label: "Chubascos ligeros" },
  81: { emoji: "🌧️", label: "Chubascos" },
  95: { emoji: "⛈️", label: "Tormenta" },
};

export function getWmoInfo(code: number): { emoji: string; label: string } {
  return WMO_ICONS[code] ?? { emoji: "🌡️", label: "Variable" };
}

export async function getWeatherByCity(
  lat: number,
  lng: number,
): Promise<WeatherData | null> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode",
    current_weather: "true",
    timezone: "Europe/Madrid",
    forecast_days: "7",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;

    const data = (await res.json()) as OpenMeteoResponse;
    const { current_weather: current, daily } = data;

    if (!current || !daily?.time?.length) return null;

    const forecast: DayForecast[] = daily.time.map((date, i) => ({
      date,
      maxTemp: Math.round(daily.temperature_2m_max[i]),
      minTemp: Math.round(daily.temperature_2m_min[i]),
      precipProbability: daily.precipitation_probability_max[i] ?? 0,
      weatherCode: daily.weathercode[i],
    }));

    return {
      currentTemp: Math.round(current.temperature),
      currentWeatherCode: current.weathercode,
      forecast,
    };
  } catch {
    return null;
  }
}
