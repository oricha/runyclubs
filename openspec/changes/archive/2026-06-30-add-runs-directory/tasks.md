## 1. Capa de datos

- [x] 1.1 Crear `lib/runs.ts` con `getRuns()`, `PACE_LABELS`, `getPaceLabel()` y mapeo a `RunSummary`
- [x] 1.2 Añadir claves i18n de estado vacío en `lib/i18n/es.ts` (`runsPage.emptyTitle`, `runsPage.emptyText`)

## 2. Endpoint GET /api/runs

- [x] 2.1 Crear `app/api/runs/route.ts` que parsea searchParams y delega en `getRuns()`

## 3. Hook de filtros y estado en URL

- [x] 3.1 Crear `hooks/useRunFilters.ts` con `toggle`, `clearAll`, `setView`, lectura de params

## 4. Componentes de filtro

- [x] 4.1 Crear `components/filters/FilterAccordion.tsx`
- [x] 4.2 Crear `components/filters/ClearAllButton.tsx`
- [x] 4.3 Crear `components/filters/ResultsSummary.tsx`
- [x] 4.4 Crear `components/filters/FilterSidebar.tsx`

## 5. Componentes de tarjeta de carrera

- [x] 5.1 Crear `components/cards/DateBlock.tsx`
- [x] 5.2 Crear `components/cards/TypeChip.tsx`
- [x] 5.3 Crear `components/cards/AvatarStack.tsx`
- [x] 5.4 Crear `components/cards/RunCard.tsx`
- [x] 5.5 Crear `components/cards/RunCardGrid.tsx`

## 6. Página /carreras

- [x] 6.1 Crear `app/carreras/page.tsx` (Server Component + cliente para filtros/vista)
- [x] 6.2 Crear componente cliente `RunsDirectoryClient.tsx` que orquesta filtros, toggle y listado

## 7. Verificación

- [x] 7.1 Probar `GET /api/runs` con distintas combinaciones de filtros (curl)
- [x] 7.2 Verificar `/carreras` en navegador (filtros, toggle, vacío, responsive)
- [x] 7.3 Ejecutar `npm run build` y `npm run lint`
- [x] 7.4 Validar y archivar change OpenSpec
