## Contexto

Capability Fase 3 que expone el directorio de carreras futuras programadas.
Depende de `data-model` (modelos Prisma, seed) y `recurring-runs` (población de `Run`).
Al implementar, `recurring-runs` **ya estaba archivada** — se verificó con datos
reales generados por `generateRuns()` (sin fixture temporal adicional).

## Contrato de `getRuns()`

```ts
getRuns(filters: RunFilters): Promise<{ count: number; items: RunSummary[] }>
```

- **Entrada:** `RunFilters` de `types/index.ts` (`city`, `types[]`, `pace[]`,
  `weekday[]`, `dateRange`, `q`).
- **Salida:** conteo y lista de `RunSummary` (no tipos Prisma crudos).
- **Reglas:**
  - `status = SCHEDULED`, `startAt >= now`.
  - `dateRange`: `"week"` → hasta +7 días; `"month"` → hasta +1 mes.
  - Filtros AND entre categorías; OR dentro de `types`, `pace`, `weekday`.
  - `q`: búsqueda insensible en `title`, `location`, `club.name`.
  - `pace`: filtra por `club.pace` (enum `Pace`), no por el string min/km de `Run.pace`.
  - `weekday`: post-filtro en memoria tras `take: 200` (mismo patrón que doc 2 §10).
  - Orden: `startAt asc`, `take: 200`.

## Arquitectura

- **Server Component** (`app/carreras/page.tsx`): `await searchParams`, construye
  `RunFilters`, llama `getRuns()` directamente (sin fetch HTTP interno).
- **API** (`app/api/runs/route.ts`): parsea `URLSearchParams`, llama `getRuns()`,
  devuelve JSON `{ count, items }`.
- **Cliente:** `useRunFilters` + componentes de filtro navegan con `router.push`
  para re-renderizar el Server Component.
- **`view`** (`list`|`grid`): parámetro de presentación en URL, fuera de `RunFilters`.

## Decisiones

### Decisión: Etiquetas de ritmo (`Pace` → texto)

Centralizar en `lib/runs.ts` como `PACE_LABELS: Record<Pace, string>` mapeando a
`es.common.allPaces`, `beginner`, `intermediate`, `advanced`. Exportar helper
`getPaceLabel(pace: Pace)` para componentes.

### Decisión: Estado vacío

Cuando `count === 0`, mostrar bloque centrado con título descriptivo, texto de
ayuda y botón «Borrar todo» (`es.filters.clearAll`) que invoca `clearAll()` del hook.
Claves añadidas en `runsPage.emptyTitle` y `runsPage.emptyText`.

### Decisión: Revalidación / dinamismo

La página **no** usa ISR explícito. Next.js 16 marca automáticamente como dinámica
cualquier página que lee `searchParams` — cada combinación de filtros se renderiza
en servidor con datos frescos. No se declara `revalidate` ni `force-dynamic`; el
comportamiento por defecto con `searchParams` es suficiente y correcto.

### Decisión: `ResultsSummary` en `/carreras`

Mostrar solo conteo de carreras con `es.home.runsCount` (`{count} carreras próximas`),
adaptado al contexto del listado (sin contador de clubs).

## Estado de `recurring-runs` al implementar

- Spec archivada en `openspec/specs/recurring-runs/spec.md`.
- Datos reales en PostgreSQL vía cron/generación manual de `generateRuns()`.
- No se creó script temporal de fixtures.
