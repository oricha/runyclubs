# Prompt de implementación — Capability `clubs-directory` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `clubs-directory` del proyecto RunClubs.es siguiendo
> **Spec-Driven Development con OpenSpec**. Léelo entero antes de escribir código.
>
> **Aviso:** este repo tiene varios changes avanzando en paralelo. Las rutas y
> firmas citadas aquí son una **foto fija** tomada justo antes de escribir este
> prompt — antes de dar nada por sentado, vuelve a comprobar con `ls`/`cat` el
> estado real de los ficheros mencionados.

---

## 1. Rol

Eres un **ingeniero full-stack senior** (Next.js App Router + Prisma + PostgreSQL +
TypeScript) que trabaja siguiendo metodología **Spec-Driven Development** con el
framework **OpenSpec**. Escribes código y documentación en **español**. No tomas
atajos: completas en orden el ciclo de vida de OpenSpec (proposal → specs →
design → tasks → implementación → validación → archivado).

---

## 2. Contexto del proyecto y estado actual del repo

**RunClubs.es** es un directorio social de clubs de running y carreras grupales en
las 20 ciudades más importantes de España. Capabilities ya **archivadas** en este
momento: `design-system`, `data-model`, `recurring-runs`, `runs-directory`,
`run-detail` (`openspec list --specs` debe mostrar las cinco).

### Qué ya existe y debes reutilizar tal cual

- **`types/index.ts`** ya define:
  ```ts
  export interface ClubSummary {
    id: string; slug: string; name: string; city: string; logoUrl?: string;
    pace: Pace; frequency: number; types: RunTypeTag[];
    awards: { key: string; icon: string; label: string }[];
  }
  ```
  Úsalo tal cual para las tarjetas de club. **No** necesitas `ClubDetail` en este
  change (es de `club-detail`, otra capability).
- **`lib/pace-labels.ts`** → `PACE_LABELS`, `PACE_OPTIONS`, `getPaceLabel(pace)`.
- **`lib/cities.ts`** → `CITY_DETAILS` (20 ciudades), **`lib/run-types.ts`** →
  `RUN_TYPES` (11 tipos).
- **`components/ui/`** (primitivas shadcn/ui), **`components/common/`**
  (`Container`, `SectionLabel`, `ViewToggle` — componente controlado
  `{ value: "list"|"grid", onChange }`).
- **`components/filters/FilterAccordion.tsx`** y **`ClearAllButton.tsx`** son
  **genéricos y reutilizables tal cual** (no dependen de dominio de carreras).
- **`components/cards/AvatarStack.tsx`**, **`TypeChip.tsx`** son genéricos y
  reutilizables.
- **`lib/i18n/es.ts`** ya tiene `clubsPage.{title, subtitle, addClub}` y el helper
  `t(template, vars)` para interpolar `{variable}` — **úsalo**, no hardcodees
  textos nuevos fuera del diccionario.

### Qué existe pero es **específico de `runs-directory`** — no lo reutilices directamente

- **`hooks/useRunFilters.ts`** y **`components/filters/FilterSidebar.tsx`** están
  acoplados a los filtros de carreras (incluyen un acordeón de "Fecha" que no
  aplica a clubs, y el hook se llama explícitamente para ese dominio). **El
  ROADMAP original (`openspec/ROADMAP-FUNCIONALIDADES.md`, entrada
  `add-clubs-directory`) sugería "reutilización de `FilterSidebar`"** — esa
  sugerencia se escribió antes de que existiera código real; ahora que lo has
  inspeccionado, **no fuerces esa reutilización literal**. Construye tu propio
  `hooks/useClubFilters.ts` y `components/filters/ClubFilterSidebar.tsx`
  siguiendo el mismo patrón (puedes leer los ficheros existentes como
  referencia de estilo), y documenta esta desviación respecto al ROADMAP en
  `design.md`. No modifiques los ficheros de `runs-directory` (es una capability
  ya archivada; tocarla sin necesidad estricta rompe su contrato).
- **`lib/runs.ts`** tiene una función interna `mapClubToSummaryForRun` (no
  exportada) usada solo para anidar el club dentro de una `Run`. No la
  reutilices ni la dupliques — vas a construir tu propio mapeo en `lib/clubs.ts`
  (ver §3), con su propia consulta Prisma (no anidada dentro de una carrera).
  Esto es precisamente la decisión que se **difirió explícitamente** al
  implementar `run-detail` ("no crear `lib/clubs.ts` compartido todavía") — ahora
  te toca a ti crearlo, como la capa de datos canónica de clubs.

**Antes de escribir nada, lee también:**
1. `PRD-runclubs-es.md` **§6.4** (`clubs-directory` y `club-detail` — lee
   completo, pero **solo te corresponde US-7 y la regla de `?day=`**; US-8
   "Unirse al club", el truncado de descripción y "Más clubs cerca" son de
   `club-detail`, no de este change) y **§13** (Fase 3).
2. `openspec/ROADMAP-FUNCIONALIDADES.md` — entrada **`add-clubs-directory`** (Fase 3).
3. `1-runclubs-es-especificacion.md` **§6** (estructura de `/clubs`).
4. `2-runclubs-es-documento-tecnico.md` **§9.5** (código de referencia de
   `ClubCard`: logo, nombre, ciudad/frecuencia/ritmo con iconos, insignias).

---

## 3. Objetivo de este change

Implementar la capability **`clubs-directory`**: la página **`/clubs`** con
filtros combinables (ciudad, tipo, ritmo, día de la semana), contador de
resultados, toggle lista/cuadrícula, soporte para `?day=saturday|sunday`
(alimenta los enlaces "Clubs de los sábados/domingos" del footer), y el
endpoint **`GET /api/clubs`** que la sustenta.

### Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance de este change:**
- `types/index.ts`: añade (sin tocar lo existente) un tipo `ClubFilters`
  análogo a `RunFilters`:
  ```ts
  export interface ClubFilters {
    city?: string;
    types?: string[];
    pace?: Pace[];
    weekday?: number[];
    q?: string;
  }
  ```
- `lib/clubs.ts` — `getClubs(filters: ClubFilters): Promise<{ count: number; items: ClubSummary[] }>`,
  única fuente de verdad de la consulta Prisma + mapeo a `ClubSummary`, y
  `parseClubFilters(params)` análogo a `parseRunFilters`. Soporta:
  - `city` (slug exacto), `types` (alguno de los tipos del club), `pace` (`in`),
  - `weekday` (multi, 0-6) **y** un parámetro especial `day` con valores
    `"saturday"`/`"sunday"` que internamente mapeas a `weekday = 6`/`weekday = 0`
    respectivamente (documenta el mapeo en `design.md`),
  - `q` sobre `name` del club (insensible a mayúsculas).
  - Filtrar por `weekday` implica comprobar que el club tenga al menos una
    `RecurringRun` **activa** (`active: true`) con ese `weekday` — es una
    relación, no un campo directo del club.
- `GET /api/clubs?city=&types=&pace=&weekday=&day=&q=` (`app/api/clubs/route.ts`),
  delgado: parsea `searchParams`, llama a `getClubs`, devuelve `{ count, items }`.
- `app/clubs/page.tsx` — Server Component, lee `searchParams` (recuerda: en
  Next.js 16 es una `Promise`, hay que `await`-earlo), construye `ClubFilters`,
  llama a `getClubs()` directamente (sin fetch HTTP interno).
- `hooks/useClubFilters.ts` + `components/filters/ClubFilterSidebar.tsx` (ver §2).
- `components/cards/ClubCard.tsx` y `ClubCardGrid.tsx` (sigue la convención de
  nombres ya usada por `runs-directory`: variante de lista y variante de
  cuadrícula), basados en doc 2 §9.5: logo, nombre, ciudad, frecuencia
  (`"{n}x/semana"`, ya existe `es.common.perWeek`), ritmo (`getPaceLabel`),
  insignias (`AvatarStack`/iconos de `awards` con tooltip del `label`).
- Integración de `ViewToggle` (ya existente) con el parámetro `?view=` en la URL,
  igual que hizo `runs-directory` (puedes inspeccionar cómo lo resolvió el hook
  `useRunFilters` como referencia de patrón, sin importarlo).
- CTA "Añade tu club" enlazando a `/onboarding/club` (esa página no existe
  todavía — dará 404 hasta que `club-onboarding`, Fase 4, la construya; es
  esperado, no lo soluciones tú).
- Nuevas claves de i18n bajo `clubsPage` si te faltan (p. ej. estado vacío,
  mensaje de límite alcanzado) — mira cómo `runsPage` ya tiene
  `emptyTitle`/`emptyText`/`limitReached` y replica el mismo patrón para clubs.

**Non-goals explícitos (no los implementes en este change):**
- **No** implementes `/clubs/[slug]` (ficha de club) — capability `club-detail`.
- **No** implementes "Unirse al club" (US-8) — requiere `auth` y
  `membership-attendance` (Fase 4), igual que el botón "Apuntarse" se dejó
  presentacional en `run-detail`.
- **No** implementes el truncado "Leer más"/"Leer menos" de descripción larga —
  es de la ficha de club (`club-detail`), las tarjetas del listado no muestran
  descripción completa.
- **No** implementes "Más clubs cerca" — es de `club-detail`.
- **No** modifiques `hooks/useRunFilters.ts` ni `components/filters/FilterSidebar.tsx`
  (capability `runs-directory` ya archivada).
- **No** construyas paginación completa — respeta un tope razonable por consulta
  (usa el mismo `200` que `runs-directory`, documenta si cambias el número) con,
  como mucho, un aviso si se alcanza.

---

## 4. Especificación funcional (PRD §6.4, parte que corresponde a `clubs-directory`)

**US-7.** Como corredor nuevo en una ciudad, quiero ver todos los clubs locales y
sus metadatos clave (frecuencia, ritmo, tipos) de un vistazo.
- **Given** estoy en `/clubs` con filtro de ciudad aplicado
- **When** la lista carga
- **Then** cada tarjeta muestra logo, nombre, ciudad, frecuencia ("3x/semana"),
  ritmo e insignias si las tiene.

### Reglas de negocio (solo las que aplican a este change)

- `/clubs?day=saturday|sunday` filtra por presencia de recurrencia activa ese
  día (alimenta "Clubs de los sábados/domingos" del footer, ya enlazados desde
  `components/layout/Footer.tsx` a `/tipos/sabados`/`/tipos/domingos` —
  **revisa esos hrefs**: si el footer actual no apunta a `/clubs?day=...`,
  decide tú si lo corriges para que coincida con esta regla de negocio o si
  documentas la discrepancia como pendiente de otra capability; no lo dejes sin
  decidir).
- Los filtros son combinables entre categorías (AND), multi-valor dentro de cada
  categoría (OR / `in`).

---

## 5. Decisiones que debes tomar tú (documéntalas en `design.md` como "Decisión")

- **Mapeo `day` → `weekday`:** confirma y documenta `saturday → 6`, `sunday → 0`
  (coherente con la convención ya usada en `RecurringRun.weekday`:
  `Date.getDay()`, 0 = domingo).
- **Enlaces del footer a `?day=`:** decide qué hacer con
  `components/layout/Footer.tsx` (ver regla de negocio arriba) y documenta tu
  decisión, aunque sea "no lo toco, lo dejo para otra capability".
- **Tope de resultados:** confirma si usas 200 (como `runs-directory`) o un
  número distinto razonable para clubs (probablemente nunca habrá tantos), y justifícalo.
- **Estado vacío y mensaje de límite**, igual que tuvo que decidir `runs-directory`.

---

## 6. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea la carpeta del change con sus 3 ficheros + delta de spec
openspec/changes/add-clubs-directory/proposal.md
openspec/changes/add-clubs-directory/design.md
openspec/changes/add-clubs-directory/tasks.md
openspec/changes/add-clubs-directory/specs/clubs-directory/spec.md

# 2. Valida antes de implementar
openspec validate add-clubs-directory --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §7) y vuelve a validar
openspec validate add-clubs-directory --strict

# 5. Archiva: promueve el delta a la spec vigente
openspec archive add-clubs-directory -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (depende de `data-model`; es independiente de
  `runs-directory`/`run-detail` salvo por convenciones de patrón, no por código
  compartido directo; bloquea `club-detail` que reutilizará `lib/clubs.ts`), qué
  cambia, capability `clubs-directory` (New Capability), impacto, y una sección
  `## Non-goals` con los puntos del §3. Incluye explícitamente la desviación
  respecto al ROADMAP (no reutilización literal de `FilterSidebar`).
- **`design.md`**: las decisiones del §5, el contrato de `getClubs`/`getClubFilters`,
  por qué `lib/clubs.ts` y los hooks/componentes de clubs son independientes de
  los de `runs-directory` en vez de compartidos.
- **`tasks.md`**: agrupa en algo como — (1) Tipos y capa de datos
  (`ClubFilters`, `lib/clubs.ts`), (2) Endpoint `GET /api/clubs`,
  (3) Hook de filtros y estado en URL, (4) Componentes de filtro,
  (5) Componentes de tarjeta de club, (6) Página `/clubs`, (7) Verificación.
- **`specs/clubs-directory/spec.md`**: formato OpenSpec
  (`## ADDED Requirements` → `### Requirement: ...` → `#### Scenario: ...` con
  **WHEN**/**THEN**). **Recuerda (lección de los changes anteriores):** cada
  enunciado de requisito debe contener la palabra clave **`MUST`** o **`SHALL`**
  en inglés (RFC 2119) aunque el resto de la frase esté en español, o
  `openspec validate --strict` fallará.

  Requisitos mínimos a cubrir: filtros combinables reflejados en la URL
  (incluyendo `day=saturday|sunday`), contador de resultados correcto,
  alternancia lista/cuadrícula sin perder filtros, tarjetas con los metadatos
  mínimos de US-7.

---

## 7. Implementación y verificación (no te limites a "compila")

1. Confirma PostgreSQL real disponible (mismo `.env` que el resto de
   capabilities). Si no lo tienes, documenta qué no pudiste verificar.
2. Con los 20 clubs sembrados (`data-model`) y sus `RecurringRun`:
   - Haz peticiones reales a `GET /api/clubs` con combinaciones de filtros
     (sin filtros, por ciudad, por tipo, por ritmo, por `weekday`, por
     `day=saturday`, por `day=sunday`, combinando varios) y confirma que el
     conteo y los resultados son coherentes con una consulta Prisma directa de
     control.
   - Abre `/clubs` en un navegador (usa el MCP de Playwright si está
     disponible): listado inicial, aplicar/quitar filtros (la URL cambia),
     contador actualizado, `ClearAllButton`, alternar `ViewToggle` sin perder
     filtros, estado vacío si filtras hasta no dejar resultados, sin errores ni
     warnings en consola.
   - Comprueba responsive (1280px y ~390px).
   - Verifica específicamente que un club con `RecurringRun` los sábados aparece
     al filtrar por `?day=saturday` y uno sin recurrencia ese día no aparece.
3. Ejecuta `npm run build` y `npm run lint` del proyecto completo — deben seguir
   en verde (no debe romperse nada de las capabilities anteriores, especialmente
   `/carreras` de `runs-directory`).
4. Marca todas las casillas de `tasks.md`, repite
   `openspec validate add-clubs-directory --strict` y archiva con
   `openspec archive add-clubs-directory -y`. Confirma con `openspec list --specs`.

---

## 8. Qué NO hacer

- No modifiques `hooks/useRunFilters.ts`, `components/filters/FilterSidebar.tsx`
  ni ningún fichero de `runs-directory`/`run-detail` salvo necesidad estricta y
  justificada (p. ej. corregir un href roto del footer, si decides hacerlo).
- No implementes `/clubs/[slug]`, "Unirse al club", ni el truncado de descripción.
- No reescribas `prisma/schema.prisma`, `lib/prisma.ts`, ni los tipos ya
  existentes en `types/index.ts` (solo añade `ClubFilters`).
- No marques una tarea como completada si no la has verificado de verdad.

---

## 9. Formato de tu informe final al usuario

Resume: qué se implementó, qué se verificó realmente (incluye los conteos
obtenidos al filtrar por `day=saturday`/`day=sunday`), enlaces a los ficheros
clave (`lib/clubs.ts`, `app/api/clubs/route.ts`, `app/clubs/page.tsx`,
`hooks/useClubFilters.ts`), qué decidiste sobre los enlaces del footer,
confirmación de que `openspec validate` y `openspec archive` se completaron, y
propone la siguiente capability del roadmap (`club-detail`, Fase 3) como
siguiente paso.
