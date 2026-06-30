## Contexto

Capability Fase 3 que conecta el modal de búsqueda global (shell de
`design-system`) con datos reales de carreras y clubs. Depende de `data-model`,
`runs-directory` (`getRuns`) y parcialmente de `clubs-directory`.

## Estado de `clubs-directory` al implementar

- `openspec list --specs` **no** incluye `clubs-directory` (aún no archivada).
- `lib/clubs.ts` **no existe**.
- **Decisión:** consulta Prisma mínima en `lib/search.ts` (`searchClubsMinimal`),
  acotada a `id`, `slug`, `name`, `logoUrl` y `city.name`. Candidata a
  consolidarse con `getClubs()` cuando se complete `clubs-directory`; fuera del
  alcance de este change.

## Contrato de `searchAll()`

```ts
export interface SearchResultItem {
  id: string;
  kind: "carrera" | "club";
  title: string;
  subtitle?: string;
  href: string;
}

searchAll(query: string): Promise<SearchResultItem[]>
```

- **Entrada:** texto de búsqueda (ya recortado y validado por el endpoint).
- **Salida:** hasta 10 items (5 carreras + 5 clubs).
- **Carreras:** `getRuns({ q: query })`, primeros 5 items; `subtitle` = fecha
  formateada (`es-ES`); `href` = `/carreras/[slug]`.
- **Clubs:** `searchClubsMinimal(query)`, primeros 5; `subtitle` = nombre de
  ciudad; `href` = `/clubs/[slug]`.
- **Orden:** carreras primero, luego clubs (consistente, sin ranking cruzado).

## Decisiones

### Decisión: Umbral mínimo de caracteres

2 caracteres. Consultas de 0–1 carácter no disparan búsqueda (ni en API ni en
cliente) para evitar ruido y consultas innecesarias.

### Decisión: Límite de resultados

5 carreras + 5 clubs = máximo 10 items totales.

### Decisión: Ubicación de `SearchResultItem`

En `types/search.ts` — tipo compartido entre API, capa de datos y cliente del
modal; `lib/search.ts` solo contiene lógica de servidor.

### Decisión: Cancelación de peticiones obsoletas

`AbortController` en el `useEffect` de búsqueda del `SearchModal`. Cada cambio
debounced aborta la petición anterior; el `fetch` pasa `signal` y los errores
`AbortError` se ignoran. Alternativa de bandera numérica descartada: `AbortController`
es nativo, integra bien con `fetch` y cancela la petición HTTP de verdad.

### Decisión: Navegación por teclado

No implementada en este change (non-goal / mejora opcional del PRD).

## Arquitectura

- **API** (`app/api/search/route.ts`): si `q` vacío o < 2 chars → `{ items: [] }`
  sin tocar BD; si no, `searchAll(trimmed)`.
- **Cliente** (`SearchModal`): debounce 200 ms → `fetch('/api/search?q=...')`
  con `AbortController`; estados vacío / cargando / sin resultados / resultados;
  clic en resultado → `router.push(href)` + `onOpenChange(false)`.
