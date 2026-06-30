## Why

RunClubs.es necesita landing pages por ciudad para SEO y descubrimiento local de clubs,
carreras y competiciones.

## What Changes

- `app/ciudades/[ciudad]/page.tsx` — página estática por slug con ISR.
- `components/city/*` — toggle calendario/lista, clubs, FAQ.
- `components/common/AdCard.tsx` — placeholder publicitario.
- `lib/city-page.ts` — helpers FAQ y mapping de runs.
- Claves i18n `cityPage.*`.

## Capabilities

### New Capabilities

- `city-pages`: páginas `/ciudades/[ciudad]` con clubs, runs, races, clima y FAQ.

### Modified Capabilities

_(ninguna)_

## Impact

- Lecturas Prisma por ciudad (clubs verificados, runs, races).
- Integración con `WeatherWidget` en sidebar.

## Non-goals

- Filtros avanzados, mapas, contenido editorial, rutas de running, ads reales.
