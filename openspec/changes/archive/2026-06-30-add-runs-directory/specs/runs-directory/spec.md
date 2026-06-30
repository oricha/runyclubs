## ADDED Requirements

### Requirement: Consulta unificada de carreras futuras
El sistema MUST exponer `getRuns(filters: RunFilters)` en `lib/runs.ts` como única
fuente de verdad para listar carreras, mapeando resultados Prisma a `RunSummary[]`.

#### Scenario: Solo carreras programadas futuras
- **WHEN** se invoca `getRuns({})` sin filtros
- **THEN** el sistema MUST devolver únicamente carreras con `status = SCHEDULED` y
  `startAt >= now`, ordenadas por `startAt` ascendente

#### Scenario: Tope de 200 resultados
- **WHEN** existen más de 200 carreras que cumplen los filtros
- **THEN** el sistema MUST devolver como máximo 200 items y `count` MUST reflejar
  el número de items devueltos (≤ 200)

### Requirement: Filtros combinables en la consulta
`getRuns` MUST soportar filtros combinables (AND entre categorías, OR dentro de
multi-valor) según `RunFilters`.

#### Scenario: Filtro por ciudad
- **WHEN** se pasa `city: "madrid"`
- **THEN** solo MUST incluirse carreras cuyo club pertenece a una `City` con slug `madrid`

#### Scenario: Filtro por tipo de carrera
- **WHEN** se pasan `types: ["social", "trail"]`
- **THEN** MUST incluirse carreras que tengan al menos uno de esos tipos (OR)

#### Scenario: Filtro por ritmo del club
- **WHEN** se pasan `pace: ["BEGINNER", "INTERMEDIATE"]`
- **THEN** MUST incluirse carreras cuyo club tenga `pace` en ese conjunto

#### Scenario: Filtro por día de la semana
- **WHEN** se pasan `weekday: [0, 6]` (domingo y sábado)
- **THEN** MUST incluirse solo carreras cuyo `startAt` cae en esos días

#### Scenario: Filtro por rango de fecha
- **WHEN** se pasa `dateRange: "week"`
- **THEN** MUST incluirse solo carreras con `startAt` dentro de los próximos 7 días
- **WHEN** se pasa `dateRange: "month"`
- **THEN** MUST incluirse solo carreras con `startAt` dentro del mes en curso (+30 días)

#### Scenario: Búsqueda libre
- **WHEN** se pasa `q: "retiro"`
- **THEN** MUST incluirse carreras cuyo título, ubicación o nombre del club contenga
  el término sin distinguir mayúsculas/minúsculas

### Requirement: Endpoint GET /api/runs
El endpoint `GET /api/runs` MUST parsear query params (`city`, `types`, `pace`,
`weekday`, `date`, `q`) y MUST delegar en `getRuns`, devolviendo JSON
`{ count, items }`.

#### Scenario: Petición sin filtros
- **WHEN** se realiza `GET /api/runs`
- **THEN** MUST responder `200` con `{ count, items }` donde cada item cumple el
  contrato `RunSummary`

#### Scenario: Petición con filtros múltiples
- **WHEN** se realiza `GET /api/runs?city=madrid&types=social&pace=BEGINNER`
- **THEN** MUST aplicar todos los filtros combinados y MUST devolver resultados coherentes

### Requirement: Página /carreras con filtros en URL
La página `/carreras` MUST ser un Server Component que lee `searchParams`, construye
`RunFilters`, llama `getRuns()` y renderiza el listado con filtros sincronizados
en la URL.

#### Scenario: Filtros reflejados en la URL
- **WHEN** el usuario selecciona un filtro en la barra lateral
- **THEN** la URL MUST actualizarse con el query param correspondiente y el listado
  MUST re-renderizarse con los nuevos resultados

#### Scenario: Contador de resultados
- **WHEN** se aplican filtros
- **THEN** la UI MUST mostrar un resumen con el número de carreras encontradas

#### Scenario: Borrar todos los filtros
- **WHEN** el usuario pulsa «Borrar todo»
- **THEN** MUST eliminarse todos los query params de filtro y MUST mostrarse el
  listado completo de carreras futuras

#### Scenario: Estado sin resultados
- **WHEN** ninguna carrera cumple los filtros activos
- **THEN** MUST mostrarse un estado vacío con opción para borrar filtros

### Requirement: Alternancia lista y cuadrícula
La página `/carreras` MUST permitir alternar entre vista lista y cuadrícula sin
perder los filtros activos.

#### Scenario: Cambio de vista
- **WHEN** el usuario pulsa el `ViewToggle` para cambiar a cuadrícula
- **THEN** la URL MUST incluir `view=grid`, los filtros MUST permanecer intactos y
  el mismo conjunto de resultados MUST renderizarse en layout de cuadrícula

#### Scenario: Vista por defecto
- **WHEN** no hay param `view` en la URL
- **THEN** MUST mostrarse la vista lista

### Requirement: Enlaces a ficha de carrera
Cada tarjeta de carrera MUST enlazar a `/carreras/[slug]` de la carrera correspondiente.

#### Scenario: Enlace desde tarjeta
- **WHEN** se renderiza un `RunCard` o `RunCardGrid` con slug `retiro-morning-2026-07-01`
- **THEN** el enlace MUST apuntar a `/carreras/retiro-morning-2026-07-01`
