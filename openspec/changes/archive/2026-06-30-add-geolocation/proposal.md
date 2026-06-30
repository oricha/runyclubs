## Why

RunClubs.es necesita que los corredores descubran carreras cerca de su ubicación
(US-10, PRD §6.6). Depende de `data-model` (ciudades en seed) y `runs-directory`
(filtro de ciudad vía `useRunFilters`). En el repo actual **ningún registro tiene
coordenadas reales** a nivel de entidad (`City.lat`/`lng` en BD están vacíos);
la proximidad visible se implementa a **nivel de ciudad** con coordenadas estáticas
del doc 4 §9.

## What Changes

- Ampliar `lib/cities.ts` con `lat`/`lng` reales de las 20 ciudades españolas.
- `lib/geolocation.ts`: Haversine, `findNearestCity`, helper de resolución de
  coordenadas preparado para entidades futuras.
- `components/marketing/GeolocationCard.tsx`: botón «Usar mi ubicación» con
  estados inicial/cargando/error/éxito.
- Integración puntual en `RunsDirectoryClient.tsx`: `GeolocationCard` en sidebar,
  `onNearestCity` → `setSingle("city", city.slug)`.
- Claves i18n adicionales bajo `geo`.

## Capabilities

### New Capabilities

- `geolocation`: detección de ciudad más cercana vía `navigator.geolocation` y
  aplicación como filtro en `/carreras`.

### Modified Capabilities

_(ninguna — modificación mínima justificada de `RunsDirectoryClient.tsx`, archivo
de capability archivada `runs-directory`, solo para montar el componente)_

## Impact

- Nuevos: `lib/geolocation.ts`, `components/marketing/GeolocationCard.tsx`.
- Modificados: `lib/cities.ts`, `lib/i18n/es.ts`, `components/runs/RunsDirectoryClient.tsx`.
- Reutiliza `useRunFilters.setSingle("city", slug)` existente.
- Integración en `/clubs` **pendiente** de `clubs-directory` (no existe aún).

## Non-goals

- **No** reordenamiento punto-a-punto de carreras/clubs individuales.
- **No** reconstruir la home (`app/page.tsx`).
- **No** implementar `clubs-directory`.
- **No** geocodificación inversa ni persistencia de ubicación.
- **No** modificar `RunsDirectoryClient.tsx` más allá de integrar `GeolocationCard`.
