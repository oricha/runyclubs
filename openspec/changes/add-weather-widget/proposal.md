## Why

Las páginas de ciudad y demos necesitan previsión meteorológica para contextualizar
carreras al aire libre, sin depender de API keys de pago.

## What Changes

- `lib/weather.ts` — fetch Open-Meteo con cache 1h y mapping WMO.
- `components/weather/WeatherWidget.tsx` — Server Component de 7 días.
- `components/weather/WeatherWidgetSkeleton.tsx` — fallback Suspense.
- `app/demo/weather/page.tsx` — demo visual.
- Claves i18n `weather.*`.

## Capabilities

### New Capabilities

- `weather-widget`: widget de clima por coordenadas de ciudad vía Open-Meteo.

### Modified Capabilities

_(ninguna)_

## Impact

- Peticiones HTTP a `api.open-meteo.com` cacheadas 1 hora por Next.js fetch.

## Non-goals

- Alertas, geolocalización, histórico, Fahrenheit, búsqueda de ciudad en widget.
