# PROMPT: Implementar capability `weather-widget`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Tailwind CSS v3.4.19**.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
lib/cities.ts               — CityInfo { lat, lng, name, slug, region }
                              CITY_DETAILS array (20 ciudades con coords reales)
                              getCityBySlug(slug): CityInfo | undefined
lib/i18n/es.ts              — para añadir claves weather.*
app/layout.tsx              — estructura del layout global
```

---

## Estado actual del repo

No existe ningún componente de clima ni código de integración con API de tiempo.

`lib/cities.ts` ya tiene coordenadas reales para las 20 ciudades (lat/lng en `CityInfo`). El componente de clima recibirá la ciudad como prop y usará esas coordenadas para llamar a la API.

---

## API de clima: Open-Meteo

Usa **Open-Meteo** (https://open-meteo.com). Es gratuita, sin API key, perfecta para este caso:

**Endpoint de previsión:**
```
https://api.open-meteo.com/v1/forecast
  ?latitude={lat}
  &longitude={lng}
  &daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode
  &current_weather=true
  &timezone=Europe%2FMadrid
  &forecast_days=7
```

**Respuesta (estructura simplificada):**
```typescript
interface OpenMeteoResponse {
  current_weather: {
    temperature: number;    // °C
    windspeed: number;      // km/h
    weathercode: number;    // WMO code
  };
  daily: {
    time: string[];                          // ["2026-07-01", ...]
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weathercode: number[];
  };
}
```

**Códigos WMO de clima (weathercode) → emoji/texto:**
```typescript
// Mapping mínimo suficiente:
const WMO_ICONS: Record<number, { emoji: string; label: string }> = {
  0:  { emoji: "☀️", label: "Despejado" },
  1:  { emoji: "🌤️", label: "Mayormente despejado" },
  2:  { emoji: "⛅", label: "Parcialmente nublado" },
  3:  { emoji: "☁️", label: "Nublado" },
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
// Para códigos no mapeados: { emoji: "🌡️", label: "Variable" }
function getWmoInfo(code: number) {
  return WMO_ICONS[code] ?? { emoji: "🌡️", label: "Variable" };
}
```

---

## Qué DEBES implementar

### 1. Función de datos `lib/weather.ts`

```typescript
export interface DayForecast {
  date: string;          // "2026-07-01"
  maxTemp: number;
  minTemp: number;
  precipProbability: number;  // 0-100
  weatherCode: number;
}

export interface WeatherData {
  currentTemp: number;
  currentWeatherCode: number;
  forecast: DayForecast[];  // 7 días incluyendo hoy
}

export async function getWeatherByCity(
  lat: number,
  lng: number
): Promise<WeatherData | null>;
```

**MUST usar `fetch` con `next: { revalidate: 3600 }` (cache de 1 hora):**
```typescript
const res = await fetch(url, { next: { revalidate: 3600 } });
```

**MUST retornar `null` si la fetch falla** (catch → return null), para que el componente pueda mostrar un estado de error graceful.

### 2. Componente `components/weather/WeatherWidget.tsx`

**Server Component** (sin `"use client"`). Acepta `{ lat: number; lng: number; cityName: string }`.

```
WeatherWidget
├── Si WeatherData es null → mensaje "Clima no disponible" (muted, sin error visual agresivo)
├── Cabecera: emoji clima actual + temperatura actual + nombre ciudad
│   └── Ejemplo: "☀️ 28°C · Madrid"
└── Grid 7 días (scroll horizontal en mobile):
    ├── Día de la semana abreviado (Lun, Mar, ...)
    ├── Emoji de condición
    ├── Máx / Mín en °C
    └── % probabilidad de lluvia (si > 20%, mostrar en color warning/amber)
```

**Formato días de la semana:**
```typescript
const dayName = new Intl.DateTimeFormat("es-ES", { weekday: "short" })
  .format(new Date(day.date));
```

**Estilo:**
- Card con `border border-border rounded-xl p-4`
- Temperatura actual: `text-2xl font-bold`
- Grid días: `grid grid-cols-7 gap-1 text-xs text-center mt-3`
- % lluvia ≥ 20%: `text-amber-600` (o clase Tailwind equivalente)
- % lluvia ≥ 60%: `text-blue-600`

### 3. Componente `components/weather/WeatherWidgetSkeleton.tsx`

Para usar mientras carga (Suspense fallback):
```typescript
export function WeatherWidgetSkeleton() {
  return (
    <div className="rounded-xl border border-border p-4 animate-pulse">
      <div className="h-6 w-32 bg-muted rounded mb-3" />
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded" />
        ))}
      </div>
    </div>
  );
}
```

### 4. Claves i18n en `lib/i18n/es.ts`

```typescript
weather: {
  unavailable: "Clima no disponible",
  currentTemp: "Temperatura actual",
  rainChance: "Prob. lluvia",
  days: {
    mon: "Lun", tue: "Mar", wed: "Mié",
    thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom",
  },
},
```

### 5. Demo de integración

Si no existe aún `app/ciudades/[ciudad]/page.tsx` (comprueba antes), crea una página de demo en `app/demo/weather/page.tsx` para verificación visual:

```typescript
import { Suspense } from "react";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { WeatherWidgetSkeleton } from "@/components/weather/WeatherWidgetSkeleton";
import { CITY_DETAILS } from "@/lib/cities";

export default function WeatherDemoPage() {
  const madrid = CITY_DETAILS.find((c) => c.slug === "madrid")!;
  return (
    <main className="container py-8 max-w-sm">
      <h1 className="text-2xl font-bold mb-6">Demo Clima</h1>
      <Suspense fallback={<WeatherWidgetSkeleton />}>
        <WeatherWidget lat={madrid.lat} lng={madrid.lng} cityName={madrid.name} />
      </Suspense>
    </main>
  );
}
```

Si `app/ciudades/[ciudad]/page.tsx` ya existe (lo crea el agente `city-pages`), integra `WeatherWidget` allí directamente.

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Alertas de clima o push notifications
- Clima por geolocalización del usuario (eso usa `components/marketing/GeolocationCard.tsx`)
- Histórico de datos meteorológicos
- Unidades Fahrenheit (siempre Celsius)
- Búsqueda manual de ciudad en el widget (la ciudad viene como prop desde la página)

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| API | Open-Meteo (gratuita, sin API key) |
| Cache | `fetch` con `revalidate: 3600` (1 hora) |
| Render | Server Component (no "use client") |
| Error handling | `null` → mensaje graceful (no throw) |
| Temperaturas | Siempre Celsius |
| Días | 7 (incluyendo hoy) |

---

## Verificación

- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `app/demo/weather/page.tsx` o `app/ciudades/madrid/page.tsx` muestra el widget
- [ ] El widget muestra temperatura actual y 7 días
- [ ] % lluvia ≥ 20% aparece en color amber
- [ ] Si la API falla → se muestra "Clima no disponible" sin romper la página
- [ ] Skeleton visible durante la carga (Suspense boundary)
- [ ] La respuesta está cacheada 1 hora (header `Cache-Control` en devtools o `revalidate` visible en código)
