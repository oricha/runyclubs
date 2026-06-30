# Prompt de implementación — Capability `runs-directory` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `runs-directory` del proyecto RunClubs.es siguiendo
> **Spec-Driven Development con OpenSpec**. Léelo entero antes de escribir código.

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
las 20 ciudades más importantes de España.

### Capabilities ya archivadas (no las reabras ni reestructures)

1. **`design-system`** (`openspec/specs/design-system/spec.md`) — scaffold Next.js 16
   (App Router) + TypeScript + Tailwind CSS v3 + shadcn/ui (Radix) + `next/font`.
   Ya existen y debes **reutilizar, no recrear**:
   - Primitivas en `components/ui/` (Button, Card, Dialog, Accordion, Input,
     Badge, Avatar, Toggle).
   - `components/common/Container.tsx`, `SectionLabel.tsx`, **`ViewToggle.tsx`**
     (componente controlado `{ value: "list"|"grid", onChange }` — no lee la URL
     por sí mismo, eso lo orquesta quien lo use).
   - `components/layout/Header.tsx` / `Footer.tsx` (ya montados en `app/layout.tsx`,
     no los toques).
   - `lib/i18n/es.ts` — el diccionario **ya tiene** las claves `filters.*`
     (`title`, `clearAll`, `resultsSummary`, `city`, `typeOfRun`, `pace`,
     `dayOfWeek`, `date`, `thisWeek`, `thisMonth`, `findRuns`, `searchRuns`) y
     `runsPage.*` (`title: "Próximas carreras"`, `subtitle`, `gridView`,
     `listView`, `cityCalendarsTitle/Text/Cta`). **Reutiliza estas claves, no
     hardcodees textos nuevos fuera del diccionario.**
   - `lib/run-types.ts` → `RUN_TYPES` (11 tipos con `id`/`emoji`/`label`).
   - `lib/cities.ts` → `CITY_DETAILS` (20 ciudades con `name`/`slug`/`region`) y `CITIES`.
   - `lib/utils.ts` → `cn()` y `slugify()`.

2. **`data-model`** (`openspec/specs/data-model/spec.md`) — esquema Prisma +
   PostgreSQL y seed. Ya existen y debes **reutilizar, no recrear**:
   - `prisma/schema.prisma` con el modelo `Run` (incluye `status`, `startAt`,
     `signupType`, `externalSignupUrl`, `organizerName`, `organizerRole`,
     `priceCents`, relación `types: RunType[]` hacia `RunTypeTag`).
   - `lib/prisma.ts` — cliente Prisma singleton (driver adapter `@prisma/adapter-pg`).
     Impórtalo como `import { prisma } from "@/lib/prisma"`.
   - `types/index.ts` — **ya define** `RunSummary`, `RunDetail` y `RunFilters`:
     ```ts
     export interface RunFilters {
       city?: string;
       types?: string[];
       pace?: Pace[];
       weekday?: number[];
       dateRange?: "week" | "month";
       q?: string;
     }
     export interface RunSummary {
       id: string; slug: string; title: string; startAt: string; location: string;
       club: { name: string; logoUrl?: string; slug: string };
       distanceKm?: number; pace?: string; types: RunTypeTag[]; attendeeCount: number;
       signupType: "internal" | "external"; externalSignupUrl?: string;
       organizerName?: string; organizerRole?: string; priceCents?: number | null;
     }
     ```
     **Usa estos tipos tal cual** como contrato de la capa de datos y de la API —
     no inventes tipos paralelos ni expongas tipos generados por Prisma directamente
     en la respuesta HTTP.

### Capability en curso (verifica su estado antes de empezar)

3. **`recurring-runs`** (change `add-recurring-runs-generation`) — **todavía no
   está archivada** en el momento de escribir este prompt (`openspec list`
   mostraba `0/9 tasks`). Es la responsable de poblar `Run` automáticamente desde
   `RecurringRun`. Antes de empezar tu trabajo:
   ```bash
   openspec list --specs   # ¿aparece "recurring-runs"?
   ```
   - **Si ya está archivada y hay `Run` reales en la base de datos:** úsalos
     directamente para verificar este change.
   - **Si todavía no está archivada:** no implementes tú la generación (no es tu
     alcance, ver §3). Para poder verificar de extremo a extremo, inserta un
     **puñado de `Run` de prueba** directamente vía Prisma Client en un script
     desechable (p. ej. `scripts/dev-seed-test-runs.ts`), apoyándote en los clubs
     y `RunTypeTag` ya sembrados por `data-model`. **No los añadas a
     `prisma/seed.ts`** (esa es la fuente de verdad de `data-model`, no la
     contamines) y dilo explícitamente en tu informe final, incluyendo que esos
     datos son temporales hasta que `recurring-runs` se complete.

**Antes de escribir nada, lee también:**
1. `PRD-runclubs-es.md` **§6.2** (`runs-directory` — US-2, US-3, criterios de
   aceptación y reglas de negocio) y **§13** (Fase 3 del plan de entregas).
2. `openspec/ROADMAP-FUNCIONALIDADES.md` — entrada **`add-runs-directory`** (Fase 3).
3. `1-runclubs-es-especificacion.md` **§6** (estructura de la página `/carreras`).
4. `2-runclubs-es-documento-tecnico.md` **§9.3-9.4** (código de referencia de
   `RunCard`, `DateBlock`, `TypeChip`), **§10** (handler de ejemplo de
   `GET /api/runs`) y **§12** (`useRunFilters`, `FilterAccordion`, filtros y
   búsqueda con estado en la URL).

---

## 3. Objetivo de este change

Implementar la capability **`runs-directory`**: la página **`/carreras`** con
filtros combinables (ciudad, tipo, ritmo, día de la semana, fecha), contador de
resultados, toggle lista/cuadrícula, y el endpoint **`GET /api/runs`** que la
sustenta.

### Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance de este change:**
- `lib/runs.ts` — función `getRuns(filters: RunFilters): Promise<{ count: number; items: RunSummary[] }>`,
  **única fuente de verdad** de la consulta Prisma + mapeo a `RunSummary`. Tanto la
  página (Server Component) como el endpoint HTTP deben llamar a esta misma
  función — no dupliques la lógica de filtrado en dos sitios.
- `GET /api/runs?city=&types=&pace=&weekday=&date=&q=` (`app/api/runs/route.ts`),
  delgado: parsea `searchParams`, llama a `getRuns`, devuelve
  `{ count, items }` como JSON.
- `app/carreras/page.tsx` — **Server Component** que lee `searchParams` (en Next.js
  16 el prop `searchParams` de una página es una **`Promise`** — recuerda hacer
  `await` antes de usarlo), construye un `RunFilters` a partir de ellos, llama a
  `getRuns()` **directamente** (sin fetch HTTP interno — es server-to-server) y
  renderiza.
- `hooks/useRunFilters.ts` — hook de cliente que sincroniza filtros con la URL
  (`useRouter`/`usePathname`/`useSearchParams` de `next/navigation`), con `toggle`
  para valores multi-selección y `clearAll`. El cambio de filtro debe navegar
  (`router.push`) para que el Server Component se vuelva a renderizar con los
  nuevos `searchParams`.
- Componentes de filtro: `components/filters/FilterSidebar.tsx`,
  `FilterAccordion.tsx` (puedes apoyarte en la primitiva `Accordion` de
  `components/ui/accordion.tsx` ya existente), `ResultsSummary.tsx`,
  `ClearAllButton.tsx`.
- Componentes de tarjeta: `components/cards/RunCard.tsx`, `RunCardGrid.tsx`,
  `DateBlock.tsx`, `TypeChip.tsx`, `AvatarStack.tsx`.
- Integración del `ViewToggle` ya existente: el parámetro de vista (`list`/`grid`)
  también vive en la URL (p. ej. `?view=grid`), con `list` como valor por defecto
  si no está presente. Este parámetro **no** forma parte de `RunFilters` (es un
  concern de presentación, no de consulta de datos) — gestiónalo aparte en la
  página/hook.
- Los enlaces de `RunCard` apuntan a `/carreras/[slug]` (la ficha de carrera).
  **Esa página todavía no existe** (la construirá la capability `run-detail`,
  también Fase 3 pero un change distinto) — es normal y esperado que ese enlace
  dé 404 por ahora; no la implementes tú.

**Non-goals explícitos (no los implementes en este change):**
- **No** implementes `/carreras/[slug]` (ficha de carrera) — capability `run-detail`.
- **No** implementes `/clubs` ni fichas de club — capabilities `clubs-directory`/`club-detail`.
- **No** conectes el modal de búsqueda global (`components/search/SearchModal.tsx`,
  hoy un shell visual de `design-system`) a `getRuns()` — eso es `global-search`.
  Puedes reutilizar `getRuns()` desde esa capability más adelante, pero no la
  conectes ahora.
- **No** implementes geolocalización ni orden por cercanía — capability `geolocation`.
- **No** generes ni gestiones `RecurringRun`/generación automática de `Run` — capability `recurring-runs`.
- **No** construyas paginación completa con controles de página — respeta el tope
  de 200 resultados por consulta (ver reglas de negocio) y, como mucho, muestra un
  aviso si se alcanza el límite; la paginación real queda fuera de alcance.

---

## 4. Especificación funcional (PRD §6.2 — síguela con precisión)

**US-2.** Como corredor, quiero filtrar carreras por ciudad, tipo, ritmo, día y
fecha para encontrar una que encaje con mi disponibilidad.
- **Given** estoy en `/carreras`
- **When** selecciono uno o varios filtros combinables
- **Then** la lista se actualiza, el contador de resultados se refleja y los
  filtros quedan codificados en la URL (compartible, indexable).

**US-3.** Como corredor, quiero alternar entre vista lista y cuadrícula.
- **Given** estoy en `/carreras`
- **When** pulso el `ViewToggle`
- **Then** el mismo conjunto de resultados se renderiza en el layout elegido sin
  perder los filtros activos.

### Reglas de negocio

- Solo se listan carreras con `status = SCHEDULED` y `startAt >= ahora`.
- Filtro de fecha (`dateRange`) admite `"week"` (esta semana) y `"month"` (este
  mes), además de ningún filtro de fecha (todas las futuras).
- Resultado máximo por consulta: **200** (`take: 200` en Prisma), ordenado por
  `startAt asc`.
- El filtro `q` (búsqueda libre) debe aplicar sobre título, ubicación y/o nombre
  del club, sin distinguir mayúsculas/minúsculas (`mode: "insensitive"` en Postgres).
- Los filtros son **combinables** (AND entre categorías; dentro de una misma
  categoría multi-valor como `types` o `weekday`, es OR / `in`).

---

## 5. Decisiones que debes tomar tú (documéntalas en `design.md` como "Decisión")

- **Mapeo de etiquetas de ritmo** (`ALL_PACES` → "Todos los ritmos", etc.): usa
  las claves ya existentes en `es.common` (`allPaces`, `beginner`, `intermediate`,
  `advanced`); decide dónde centralizar el `Record<Pace, string>` (p. ej. un
  pequeño helper en `lib/runs.ts` o `components/cards/RunCard.tsx`, según mejor
  encaje) sin duplicarlo en varios componentes.
- **Manejo de "sin resultados":** decide un estado vacío razonable (texto +
  CTA para borrar filtros) y documenta la decisión.
- **Estrategia de revalidación:** decide si la página usa `revalidate` (ISR) o
  `dynamic = "force-dynamic"` dado que depende de `searchParams`; justifica la
  elección (pista: con filtros vía query params que cambian por usuario, lo
  habitual en App Router es que la página sea dinámica por los `searchParams`,
  no que necesite ISR explícito — pero confírmalo tú mismo revisando el
  comportamiento real, no lo des por sentado).

---

## 6. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea la carpeta del change con sus 3 ficheros + delta de spec
openspec/changes/add-runs-directory/proposal.md
openspec/changes/add-runs-directory/design.md
openspec/changes/add-runs-directory/tasks.md
openspec/changes/add-runs-directory/specs/runs-directory/spec.md

# 2. Valida antes de implementar
openspec validate add-runs-directory --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §7) y vuelve a validar
openspec validate add-runs-directory --strict

# 5. Archiva: promueve el delta a la spec vigente
openspec archive add-runs-directory -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (depende de `data-model`; usa idealmente datos de
  `recurring-runs`, ver estado en §2; bloquea `global-search` y `city-pages` que
  reutilizarán `getRuns()`), qué cambia, capability `runs-directory`
  (New Capability), impacto, y una sección `## Non-goals` con los puntos del §3.
- **`design.md`**: las decisiones del §5, el contrato de `getRuns()`, por qué la
  página es Server Component y el filtrado vive en una sola función compartida
  con el endpoint, y el estado de `recurring-runs` en el momento de implementar
  (con qué datos verificaste).
- **`tasks.md`**: agrupa en algo como — (1) Capa de datos (`lib/runs.ts`),
  (2) Endpoint `GET /api/runs`, (3) Hook de filtros y estado en URL,
  (4) Componentes de filtro, (5) Componentes de tarjeta de carrera,
  (6) Página `/carreras`, (7) Verificación.
- **`specs/runs-directory/spec.md`**: formato OpenSpec
  (`## ADDED Requirements` → `### Requirement: ...` → `#### Scenario: ...` con
  **WHEN**/**THEN**). **Recuerda (lección de los changes anteriores):** cada
  enunciado de requisito debe contener la palabra clave **`MUST`** o **`SHALL`**
  en inglés (RFC 2119) aunque el resto de la frase esté en español, o
  `openspec validate --strict` fallará.

  Requisitos mínimos a cubrir: filtros combinables reflejados en la URL, contador
  de resultados correcto, alternancia lista/cuadrícula sin perder filtros, solo
  carreras futuras programadas, tope de 200 resultados.

---

## 7. Implementación y verificación (no te limites a "compila")

1. Asegúrate de tener PostgreSQL real disponible (mismo usado por `data-model`/
   `recurring-runs`; arrays nativos `String[]`, no SQLite). Si no lo tienes, sigue
   el mismo patrón que en changes anteriores: documenta qué no pudiste verificar
   y los comandos pendientes, en vez de fingir que todo funciona.
2. Con datos disponibles (reales de `recurring-runs` o tu fixture temporal del §2):
   - Levanta `next dev` y haz peticiones reales a `GET /api/runs` con distintas
     combinaciones de filtros (`curl` o equivalente): sin filtros, por ciudad,
     por tipo, por ritmo, por día, por `dateRange=week`, combinando varios a la
     vez, y con `q=`. Confirma que el conteo y los resultados son coherentes con
     lo que hay en la base de datos (compáralo con una consulta Prisma directa).
   - Abre `/carreras` en un navegador (usa el MCP de Playwright si está
     disponible) y verifica visualmente: listado inicial, aplicar/quitar filtros
     (la URL debe cambiar), `ResultsSummary` actualizado, `ClearAllButton`,
     alternar `ViewToggle` sin perder filtros, estado vacío si filtras hasta no
     dejar resultados, y que no haya errores ni warnings en la consola del
     navegador (revisa la consola explícitamente, no solo la carga visual).
   - Comprueba responsive (escritorio y móvil, p. ej. 1280px y 390px).
3. Ejecuta `npm run build` y `npm run lint` del proyecto completo — deben seguir
   en verde (no debe romperse nada de las capabilities anteriores).
4. Marca todas las casillas de `tasks.md`, repite
   `openspec validate add-runs-directory --strict` y archiva con
   `openspec archive add-runs-directory -y`. Confirma con `openspec list --specs`
   que `runs-directory` aparece junto a las capabilities anteriores.
5. Si creaste el script temporal de fixtures (§2), decide y documenta si lo
   eliminas al terminar o lo dejas señalado como temporal para quien implemente
   `recurring-runs`/`run-detail` después.

---

## 8. Qué NO hacer

- No reescribas `prisma/schema.prisma`, `lib/prisma.ts`, `types/index.ts` (salvo
  que sea estrictamente necesario y lo justifiques), ni los componentes/tokens de
  `design-system`.
- No implementes `/carreras/[slug]`, `/clubs`, búsqueda global ni geolocalización.
- No metas datos de prueba dentro de `prisma/seed.ts`.
- No marques una tarea como completada si no la has verificado de verdad.

---

## 9. Formato de tu informe final al usuario

Resume: qué se implementó, qué se verificó realmente (incluye si usaste datos
reales de `recurring-runs` o un fixture temporal, y por qué), enlaces a los
ficheros clave (`lib/runs.ts`, `app/api/runs/route.ts`, `app/carreras/page.tsx`,
`hooks/useRunFilters.ts`), confirmación de que `openspec validate` y
`openspec archive` se completaron, y propone la siguiente capability del roadmap
(`run-detail`, Fase 3) como siguiente paso.
