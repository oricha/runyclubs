# Prompt de implementación — Capability `run-detail` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `run-detail` del proyecto RunClubs.es siguiendo
> **Spec-Driven Development con OpenSpec**. Léelo entero antes de escribir código.
>
> **Aviso:** este repo tiene varios changes avanzando en paralelo. Las rutas y
> firmas citadas aquí son una **foto fija** tomada justo antes de escribir este
> prompt — antes de dar nada por sentado, vuelve a comprobar con `ls`/`cat` el
> estado real de los ficheros mencionados, no asumas que siguen exactamente igual.

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

1. **`design-system`** — scaffold Next.js 16 + Tailwind v3 + shadcn/ui. Primitivas
   en `components/ui/`, `components/common/` (`Container`, `SectionLabel`),
   `lib/i18n/es.ts` (incluye un helper `t(template, vars)` para interpolar
   `{variable}` — **úsalo** en vez de `.replace()` manual), `lib/utils.ts`
   (`cn`, `slugify`).
2. **`data-model`** — `prisma/schema.prisma`, `lib/prisma.ts` (cliente singleton),
   `types/index.ts` con los tipos de dominio. Para esta capability te importan
   especialmente:
   ```ts
   export interface ClubSummary {
     id: string; slug: string; name: string; city: string; logoUrl?: string;
     pace: Pace; frequency: number; types: RunTypeTag[];
     awards: { key: string; icon: string; label: string }[];
   }
   export interface RunDetail extends RunSummary {
     description?: string;
     attendeeAvatars: string[];
     club: ClubSummary & { name: string; logoUrl?: string; slug: string };
   }
   ```
   `RunDetail` **ya está definido** en `types/index.ts` — no lo dupliques ni lo
   rediseñes, complétalo.
3. **`recurring-runs`** — genera `Run` reales desde `RecurringRun` vía cron
   (`vercel.ts` con `@vercel/config`, `app/api/cron/generate-runs/route.ts`). Si
   el `.env` local con `DATABASE_URL` sigue presente y la generación ya se
   verificó, **debería haber `Run` reales en la base de datos** — confírmalo tú
   mismo antes de asumirlo (consulta `prisma.run.count()`).

### Capability en curso (`add-runs-directory`) — compártela, no la dupliques

En el momento de escribir este prompt, `runs-directory` está en marcha (no
archivada todavía) pero ya ha producido piezas que **debes reutilizar tal cual**:

- **`lib/runs.ts`** exporta `getRuns(filters: RunFilters)` y
  `parseRunFilters(params)`. Su `where` ya filtra por `status: "SCHEDULED"`,
  `startAt >= now`, ciudad/tipo/ritmo/búsqueda libre, con `take: 200` y
  `orderBy: { startAt: "asc" }`. **Reutilízalo** para construir "Más carreras en
  [ciudad]" en vez de escribir una consulta Prisma paralela: puedes llamar
  `getRuns({ city: cityDelClub })` y filtrar/recortar el resultado en memoria
  excluyendo la carrera actual.
- **`lib/pace-labels.ts`** exporta `PACE_LABELS` y `getPaceLabel(pace)` — úsalo
  para mostrar el ritmo en la ficha, no reinventes el mapeo.
- **`components/cards/`** ya tiene `DateBlock.tsx`, `TypeChip.tsx`,
  `AvatarStack.tsx`, y probablemente ya `RunCard.tsx`/`RunCardGrid.tsx` (recibe
  un `RunSummary`). Si existen, reutilízalos (o una variante compacta) para las
  secciones de recomendaciones; si todavía no existen cuando empieces, construye
  tu propia lista compacta autocontenida sin bloquearte esperando a que
  `runs-directory` termine.
- `app/api/runs/route.ts` ya existe (`GET /api/runs`). No lo toques.
- La página `/carreras` (listado) puede no estar terminada todavía — el enlace
  "Todas las carreras" puede dar 404 hasta que `runs-directory` se archive. Es
  esperado, no lo arregles tú.

**Antes de escribir nada, lee también:**
1. `PRD-runclubs-es.md` **§6.3** (`run-detail` — US-4, US-5, US-6, reglas de
   negocio) y **§13** (Fase 3 del plan de entregas).
2. `openspec/ROADMAP-FUNCIONALIDADES.md` — entrada **`add-run-detail`** (Fase 3).
3. `1-runclubs-es-especificacion.md` **§6** (estructura de la ficha de carrera).
4. `4-runclubs-es-analisis-completo-nuevas-secciones.md` **§4** (inscripción
   externa, organizador individual, "More runs in city", "Runs around the same
   date") y **§11** (queries de recomendaciones cruzadas — ejemplos con `subDays`/
   `addDays`, que debes reimplementar con aritmética nativa de `Date`, **sin**
   añadir `date-fns` u otra dependencia nueva salvo que lo justifiques en `design.md`).

---

## 3. Objetivo de este change

Implementar la capability **`run-detail`**: la página **`/carreras/[slug]`** con
cabecera, organizador (club + persona individual si aplica), descripción,
asistentes, sidebar con acción de inscripción (interna o externa), compartir,
metadatos (fecha/hora/ubicación/distancia/ritmo), y dos secciones de
recomendaciones cruzadas.

### Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance de este change:**
- `getRunBySlug(slug: string): Promise<RunDetail | null>` en `lib/runs.ts` (amplía
  el fichero existente, no lo sustituyas).
- `getRunsAroundDate(date: Date, excludeRunId: string, take = 3)` en `lib/runs.ts`
  — carreras de cualquier ciudad en ±3 días respecto a una fecha dada.
- `app/carreras/[slug]/page.tsx` — Server Component. Si `getRunBySlug` devuelve
  `null`, llama a `notFound()` de `next/navigation` (usa el 404 genérico de Next
  por ahora; la variante específica "Carrera no encontrada" con copy propio es
  de la capability `error-pages`, Fase 5 — no la construyas aquí).
- Componentes: `RunHeader`, `RunMeta` (FECHA/HORA/UBICACIÓN/DISTANCIA/RITMO, con
  `es.runDetail.notKnownYet` cuando falte un dato), `HostedByCard` (club +
  `OrganizerCard` si hay `organizerName`), `JoinRunButton`, `ExternalSignupButton`,
  `ShareRunButton`, `MoreRunsInCity`, `RunsAroundDate`.
- JSON-LD `Event` embebido en la página (`<script type="application/ld+json">`).
- Nuevas claves de i18n bajo `runDetail` en `lib/i18n/es.ts` para lo que falte
  (ver §5) — añádelas, no las hardcodees fuera del diccionario.

**Non-goals explícitos (no los implementes en este change):**
- **No** implementes la lógica real de "Apuntarse" (inscripción interna). No
  existe todavía `auth` (Fase 4), así que **no hay sesión de usuario real**. El
  botón `JoinRunButton` debe ser **presentacional**: visible cuando
  `signupType === "internal"`, pero sin `onClick` que llame a un endpoint real
  (puedes dejarlo deshabilitado o con un comentario explícito en el código
  indicando que `POST /api/runs/[slug]/join` lo añade `membership-attendance`,
  Fase 4, una vez exista `auth`). El botón **`ExternalSignupButton` sí debe ser
  100% funcional** (abre `externalSignupUrl` en pestaña nueva) porque no depende
  de autenticación.
- **No** implementes `ShareRunButton` con backend — usa la Web Share API del
  navegador (`navigator.share`) con fallback a copiar el enlace al portapapeles;
  es puramente cliente.
- **No** construyas la página `/carreras` (listado) ni `RunCard`/`RunCardGrid` si
  no existen ya (ver §2) — eso es `runs-directory`.
- **No** construyas `/clubs/[slug]` (ficha de club) — eso es `club-detail`.
- **No** construyas la variante de 404 "Carrera no encontrada" con copy propio —
  eso es `error-pages` (Fase 5); usa el `notFound()` estándar de Next por ahora.

---

## 4. Especificación funcional (PRD §6.3 — síguela con precisión)

**US-4.** Como corredor, quiero apuntarme a una carrera con un clic si la
inscripción es interna.
- **Given** tengo sesión iniciada y la carrera tiene `signupType = internal`
- **When** pulso "Apuntarse"
- **Then** se crea un `RunAttendee`, el contador de asistentes se incrementa y mi
  avatar aparece en la lista de apuntados.
- ⚠️ **No implementes el comportamiento real de este escenario** — no hay `auth`
  todavía (ver Non-goals). Construye solo la UI.

**US-5.** Como corredor, quiero ser dirigido a un enlace externo si el club
gestiona sus inscripciones fuera de la plataforma.
- **Given** la carrera tiene `signupType = external` y `externalSignupUrl` definida
- **When** veo la ficha de carrera
- **Then** el botón primario muestra "Inscribirse externamente" con icono de
  enlace externo y el texto "La inscripción se gestiona fuera de RunClubs.es", y
  al pulsarlo se abre `externalSignupUrl` en una pestaña nueva.
- ✅ **Este escenario sí debes implementarlo completo.**

**US-6.** Como corredor indeciso, quiero ver carreras parecidas para descubrir
alternativas.
- **Given** estoy en la ficha de una carrera
- **When** llego al final de la página
- **Then** veo "Más carreras en [ciudad]" (misma ciudad, fecha futura, máx. 3) y
  "Carreras cerca de esta fecha" (±3 días, cualquier ciudad, máx. 3).

### Reglas de negocio

- Si existe `organizerName`, se muestra junto al club en "ORGANIZADO POR" con su
  `organizerRole`.
- La URL de la ficha es canónica: `/carreras/[slug]` (para "Compartir carrera").
- "Más carreras en [ciudad]" excluye la carrera actual y solo incluye futuras.
- "Carreras cerca de esta fecha" excluye la carrera actual, es ±3 días sobre
  `startAt` de la carrera vista, de cualquier ciudad.

---

## 5. Decisiones que debes tomar tú (documéntalas en `design.md` como "Decisión")

- **Claves de i18n que faltan** en `es.runDetail` (revisa el fichero actual antes
  de añadir, no dupliques claves existentes como `joinRun`/`shareRun`/`notKnownYet`):
  necesitarás al menos algo equivalente a "Inscribirse externamente", "La
  inscripción se gestiona fuera de RunClubs.es", el título de "Más carreras en
  {city}" y "Carreras cerca de esta fecha". Sigue la convención existente
  (objeto anidado, interpolación `{variable}` vía el helper `t()`).
- **Mapeo de club a `ClubSummary`** dentro de `getRunBySlug`: constrúyelo
  embebido en `lib/runs.ts` (tu propia función de mapeo local, p. ej.
  `mapClubToSummaryForRun`), **sin crear `lib/clubs.ts`** — esa abstracción
  compartida la decidirán las capabilities `clubs-directory`/`club-detail` cuando
  construyan su propia capa de datos. No te adelantes a esa decisión.
- **`attendeeAvatars` vacío:** como no hay `membership-attendance` todavía, lo
  normal es que `RunAttendee` esté vacío o casi vacío en los datos actuales.
  `AvatarStack` (ya existe) debe manejar `count = 0` con elegancia (compruébalo,
  no asumas que ya lo hace).
- **Revalidación/estrategia de renderizado** de la página dinámica por `slug`:
  decide y justifica (ISR con `revalidate`, o dinámica sin caché) igual que se
  pide en el resto de capabilities de directorio/ficha.

---

## 6. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea la carpeta del change con sus 3 ficheros + delta de spec
openspec/changes/add-run-detail/proposal.md
openspec/changes/add-run-detail/design.md
openspec/changes/add-run-detail/tasks.md
openspec/changes/add-run-detail/specs/run-detail/spec.md

# 2. Valida antes de implementar
openspec validate add-run-detail --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §7) y vuelve a validar
openspec validate add-run-detail --strict

# 5. Archiva: promueve el delta a la spec vigente
openspec archive add-run-detail -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (depende de `data-model` y reutiliza `lib/runs.ts`
  de `runs-directory`; bloquea `membership-attendance` que añadirá la lógica real
  de "Apuntarse"), qué cambia, capability `run-detail` (New Capability), impacto,
  y una sección `## Non-goals` con los puntos del §3.
- **`design.md`**: las decisiones del §5, el contrato de `getRunBySlug`/
  `getRunsAroundDate`, por qué `JoinRunButton` es presentacional, y el estado de
  `runs-directory` en el momento de implementar (qué reutilizaste de verdad).
- **`tasks.md`**: agrupa en algo como — (1) Capa de datos
  (`getRunBySlug`, `getRunsAroundDate`), (2) i18n nuevas claves, (3) Componentes
  de cabecera/meta/organizador, (4) Acciones (join UI / external signup / share),
  (5) Recomendaciones cruzadas, (6) Página + JSON-LD + `notFound()`,
  (7) Verificación.
- **`specs/run-detail/spec.md`**: formato OpenSpec (`## ADDED Requirements` →
  `### Requirement: ...` → `#### Scenario: ...` con **WHEN**/**THEN**).
  **Recuerda (lección de los changes anteriores):** cada enunciado de requisito
  debe contener la palabra clave **`MUST`** o **`SHALL`** en inglés (RFC 2119)
  aunque el resto de la frase esté en español, o `openspec validate --strict` fallará.

  Requisitos mínimos a cubrir: inscripción externa funcional con apertura en
  pestaña nueva, botón de inscripción interna presentacional (sin acción real),
  carrera no encontrada usa `notFound()`, recomendaciones "más en la ciudad" y
  "cerca de la fecha" con los límites/exclusiones correctos.

---

## 7. Implementación y verificación (no te limites a "compila")

1. Confirma que tienes PostgreSQL real disponible (mismo `.env`/base que el resto
   de capabilities; arrays nativos `String[]`, no SQLite). Si no lo tienes,
   documenta qué no pudiste verificar en vez de fingir que funciona.
2. Con datos reales (de `recurring-runs`, confirma con `prisma.run.count()`):
   - Toma el `slug` de una `Run` real y carga `/carreras/[slug]` en un navegador
     (usa el MCP de Playwright si está disponible). Verifica visualmente: título,
     "ORGANIZADO POR" (con organizador individual si esa carrera lo tiene),
     "SOBRE ESTA CARRERA", metadatos (fecha/hora/ubicación/distancia/ritmo),
     asistentes, botón de inscripción correcto según `signupType`, "Más carreras
     en [ciudad]" y "Carreras cerca de esta fecha" con datos reales y sin incluir
     la propia carrera.
   - Prueba específicamente una `Run` con `signupType = "external"` (si no hay
     ninguna en los datos semilla, créala tú con un script puntual de Prisma para
     poder probar el escenario, y dilo en tu informe) y confirma que el botón
     abre `externalSignupUrl` en pestaña nueva.
   - Visita una ruta de carrera inexistente (slug inventado) y confirma que
     dispara el 404 (`notFound()`), no un error 500.
   - Revisa la consola del navegador: cero errores/warnings.
   - Comprueba responsive (1280px y ~390px) y que el JSON-LD `Event` está presente
     en el HTML (inspecciona el `<script type="application/ld+json">`).
3. Ejecuta `npm run build` y `npm run lint` del proyecto completo — deben seguir
   en verde.
4. Marca todas las casillas de `tasks.md`, repite
   `openspec validate add-run-detail --strict` y archiva con
   `openspec archive add-run-detail -y`. Confirma con `openspec list --specs` que
   `run-detail` aparece junto a las capabilities anteriores.

---

## 8. Qué NO hacer

- No reescribas `prisma/schema.prisma`, `lib/prisma.ts`, `types/index.ts` (salvo
  necesidad estricta y justificada), ni los componentes de `design-system`.
- No dupliques `getRuns`/`parseRunFilters`/`PACE_LABELS` — reutilízalos.
- No implementes lógica real de unión a carrera (requiere `auth`).
- No construyas `/clubs/[slug]`, `/carreras` (listado), ni la 404 específica de carrera.
- No marques una tarea como completada si no la has verificado de verdad.

---

## 9. Formato de tu informe final al usuario

Resume: qué se implementó, qué se verificó realmente (incluye si probaste tanto
inscripción interna como externa, y con qué datos), enlaces a los ficheros clave
(`lib/runs.ts` ampliado, `app/carreras/[slug]/page.tsx`, componentes nuevos en
`components/run/`), confirmación de que `openspec validate` y `openspec archive`
se completaron, y propone la siguiente capability del roadmap
(`clubs-directory`, Fase 3) como siguiente paso.
