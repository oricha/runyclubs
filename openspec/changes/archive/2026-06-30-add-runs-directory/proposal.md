## Why

RunClubs.es ya tiene clubs, recurrencias y generación automática de instancias `Run`
(`data-model`, `recurring-runs`), pero no existe la página pública ni el endpoint
para descubrir carreras con filtros. Sin `runs-directory` los corredores no pueden
buscar salidas por ciudad, tipo, ritmo o disponibilidad — bloqueando el valor central
del producto (US-2, US-3 del PRD §6.2).

Fase 3 del ROADMAP (`add-runs-directory`). Fuentes: PRD §6.2, doc 1 §6,
doc 2 §9.3–9.4, §10, §12.

## What Changes

- `lib/runs.ts`: función `getRuns(filters)` — única fuente de verdad para consulta
  Prisma y mapeo a `RunSummary`.
- `GET /api/runs`: endpoint delgado que parsea query params y delega en `getRuns`.
- `app/carreras/page.tsx`: Server Component con filtros vía `searchParams`, listado
  y toggle lista/cuadrícula (`view` en URL).
- `hooks/useRunFilters.ts`: sincronización de filtros con la URL (cliente).
- Componentes de filtro: `FilterSidebar`, `FilterAccordion`, `ResultsSummary`,
  `ClearAllButton`.
- Componentes de tarjeta: `RunCard`, `RunCardGrid`, `DateBlock`, `TypeChip`,
  `AvatarStack`.

## Capabilities

### New Capabilities

- `runs-directory`: página `/carreras` con filtros combinables en URL, contador de
  resultados, alternancia lista/cuadrícula y endpoint `GET /api/runs`.

### Modified Capabilities

_(ninguna — no se modifican requisitos de capabilities archivadas)_

## Impact

- Nuevos módulos en `lib/`, `app/carreras/`, `app/api/runs/`, `hooks/`, `components/filters/`, `components/cards/`.
- Reutiliza primitivas de `design-system`, tipos de `types/index.ts` y cliente Prisma existente.
- Desbloquea `global-search` y `city-pages`, que reutilizarán `getRuns()`.
- Bloquea parcialmente `run-detail` (enlaces desde tarjetas apuntan a `/carreras/[slug]`, aún no implementada).

## Non-goals

- **No** implementar `/carreras/[slug]` (`run-detail`).
- **No** implementar `/clubs` ni fichas de club.
- **No** conectar `SearchModal` a `getRuns()` (`global-search`).
- **No** geolocalización ni orden por cercanía.
- **No** generación de `RecurringRun` / instancias `Run`.
- **No** paginación completa con controles de página (tope 200 + aviso opcional).
