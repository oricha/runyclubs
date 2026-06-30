import { getWmoInfo, getWeatherByCity } from "@/lib/weather";
import { es } from "@/lib/i18n/es";
import { cn } from "@/lib/utils";

function formatDayName(dateStr: string): string {
  return new Intl.DateTimeFormat("es-ES", { weekday: "short" })
    .format(new Date(`${dateStr}T12:00:00`))
    .replace(".", "");
}

function precipClass(probability: number): string {
  if (probability >= 60) return "text-blue-600";
  if (probability >= 20) return "text-amber-600";
  return "text-muted-foreground";
}

export async function WeatherWidget({
  lat,
  lng,
  cityName,
}: {
  lat: number;
  lng: number;
  cityName: string;
}) {
  const weather = await getWeatherByCity(lat, lng);

  if (!weather) {
    return (
      <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
        {es.weather.unavailable}
      </div>
    );
  }

  const current = getWmoInfo(weather.currentWeatherCode);

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl" aria-hidden>
          {current.emoji}
        </span>
        <p className="text-2xl font-bold">{weather.currentTemp}°C</p>
        <span className="text-muted-foreground">· {cityName}</span>
      </div>
      <p className="sr-only">
        {es.weather.currentTemp}: {weather.currentTemp}°C, {current.label}
      </p>

      <div className="mt-3 overflow-x-auto">
        <div className="grid min-w-[280px] grid-cols-7 gap-1 text-center text-xs sm:min-w-0">
          {weather.forecast.map((day) => {
            const info = getWmoInfo(day.weatherCode);
            return (
              <div key={day.date} className="flex flex-col items-center gap-1 py-1">
                <span className="font-medium capitalize text-muted-foreground">
                  {formatDayName(day.date)}
                </span>
                <span className="text-base" aria-hidden>
                  {info.emoji}
                </span>
                <span className="leading-tight">
                  {day.maxTemp}° / {day.minTemp}°
                </span>
                {day.precipProbability >= 20 ? (
                  <span className={cn("text-[10px]", precipClass(day.precipProbability))}>
                    {day.precipProbability}%
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
