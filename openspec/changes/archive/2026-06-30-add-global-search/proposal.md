## Why

RunClubs.es ya tiene el shell visual del modal de búsqueda global (⌘K) en
`design-system` y la consulta de carreras con búsqueda libre en `lib/runs.ts`
(`runs-directory`), pero el modal no consulta datos reales. Sin `global-search`
los usuarios no pueden descubrir clubs ni carreras desde cualquier página con un
atajo de teclado — requisito US-9 del PRD §6.5, Fase 3 del ROADMAP.

Depende de `data-model` (PostgreSQL), reutiliza `getRuns()` de `runs-directory` y
depende parcialmente de `clubs-directory` para datos de club (con plan B de
consulta mínima propia si esa capability aún no está lista).

## What Changes

- `lib/search.ts`: `searchAll(query)` que combina carreras (`getRuns`) y clubs
  (consulta mínima o `lib/clubs.ts` si existe), mapeados a `SearchResultItem[]`.
- `GET /api/search?q=`: endpoint delgado que delega en `searchAll`.
- Completar `components/search/SearchModal.tsx`: debounce 200 ms, cancelación de
  peticiones obsoletas, estados de UI y navegación al hacer clic.

## Capabilities

### New Capabilities

- `global-search`: búsqueda en vivo desde el modal ⌘K con resultados mixtos de
  carreras y clubs etiquetados por tipo, vía `GET /api/search`.

### Modified Capabilities

_(ninguna — no se modifican requisitos de capabilities archivadas)_

## Impact

- Nuevos módulos: `lib/search.ts`, `app/api/search/route.ts`.
- Modificación acotada de `components/search/SearchModal.tsx`.
- Reutiliza `getRuns()` de `lib/runs.ts`, primitivas de `design-system` y tipos
  existentes.
- Enlaces a `/clubs/[slug]` darán 404 hasta `club-detail` — esperado.

## Non-goals

- **No** implementar `clubs-directory` ni `club-detail` completos.
- **No** construir página de resultados standalone (`/buscar`).
- **No** ranking avanzado, tolerancia a errores tipográficos ni búsqueda fonética.
- **No** navegación por teclado entre resultados (mejora opcional).
- **No** reescribir el atajo ⌘K/Ctrl+K ni el montaje en `Header.tsx`.
