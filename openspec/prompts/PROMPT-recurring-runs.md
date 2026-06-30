# Prompt de implementación — Capability `recurring-runs` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `recurring-runs` del proyecto RunClubs.es siguiendo
> **Spec-Driven Development con OpenSpec**. Léelo entero antes de escribir código.

---

## 1. Rol

Eres un **ingeniero full-stack senior** (Next.js + Prisma + PostgreSQL + TypeScript)
que trabaja siguiendo metodología **Spec-Driven Development** con el framework
**OpenSpec**. Escribes código y documentación en **español**. No tomas atajos:
completas en orden el ciclo de vida de OpenSpec (proposal → specs → design →
tasks → implementación → validación → archivado).

---

## 2. Contexto del proyecto y estado actual del repo

**RunClubs.es** es un directorio social de clubs de running y carreras grupales en
las 20 ciudades más importantes de España. El proyecto ya tiene implementadas y
**archivadas** dos capabilities:

1. **`design-system`** (`openspec/specs/design-system/spec.md`) — scaffold Next.js 16
   (App Router) + TypeScript + Tailwind CSS v3 + shadcn/ui (Radix) + `next/font`,
   ya en `app/`, `components/`, `lib/`.
2. **`data-model`** (`openspec/specs/data-model/spec.md`) — esquema Prisma + PostgreSQL
   completo y datos semilla. Concretamente, ya existen y **no debes recrear ni
   reestructurar**:
   - `prisma/schema.prisma` — modelos `User`, `City`, `Club`, `RunTypeTag`,
     `ClubType`, `ClubAward`, `ClubMember`, **`RecurringRun`**, **`Run`** (con
     `signupType`, `externalSignupUrl`, `organizerName`, `organizerRole`,
     `priceCents`), `RunType`, `RunAttendee`, `NewsletterSubscriber`, `Race`.
   - `lib/prisma.ts` — cliente Prisma singleton usando **driver adapter**
     (`@prisma/adapter-pg` + `pg.Pool`), exporta `prisma` (named) y default.
     Lanza error si `DATABASE_URL` no está definida.
   - `prisma/seed.ts` — siembra 20 ciudades, 11 tipos de carrera (`RunTypeTag`) y
     **20 clubs** ficticios, cada uno con sus `ClubType`, `ClubAward` (cuando
     aplica) y sus `RecurringRun`. Usa `tsx` (ver `package.json`).
   - `prisma/verify-seed.ts` — script de verificación por conteos vía Prisma Client
     (patrón que debes reutilizar para tu propia verificación, ver §7).
   - `types/index.ts` — tipos de dominio TypeScript, incluyendo `ClubDetail` con un
     campo **`runsSummary: string`** (p. ej. `"Cada miércoles y domingo"`) que
     **todavía no se calcula en ningún sitio** — es tu responsabilidad implementar
     esa lógica como utilidad reutilizable (ver §5).
   - `lib/utils.ts` — solo contiene `cn()` (helper de clases Tailwind). **No existe
     todavía una función `slugify`** — la vas a necesitar tú (ver §5).
   - No existe ningún fichero de cron (`app/api/cron/...`) ni `vercel.json`/`vercel.ts`.

El campo `RecurringRun.weekday` sigue la convención de `Date.prototype.getDay()`
de JavaScript: **0 = domingo, 1 = lunes, …, 6 = sábado**.

**Antes de escribir nada, lee:**
1. `PRD-runclubs-es.md` **§6.1** (`recurring-runs` — US-1, criterios de aceptación
   y reglas de negocio) y **§13** (Fase 2 del plan de entregas).
2. `openspec/ROADMAP-FUNCIONALIDADES.md` — entrada **`add-recurring-runs-generation`** (Fase 2).
3. `2-runclubs-es-documento-tecnico.md` **§11** (Lógica de carreras recurrentes) —
   contiene el algoritmo de referencia (`generateRuns`, `nextWeekday`, `slugify`) y
   la configuración de cron sugerida (`0 4 * * *`).
4. `openspec/specs/data-model/spec.md` — para conocer los requisitos ya vigentes
   del modelo de datos sobre los que vas a construir (no los contradigas).

---

## 3. Objetivo de este change

Implementar la capability **`recurring-runs`**: un job que genera automáticamente
instancias `Run` a partir de las `RecurringRun` activas de cada club, de forma
**idempotente**, para las próximas N semanas (N=20 por defecto), más un endpoint
HTTP protegido para disparar ese job desde un cron, y una utilidad reutilizable
para resumir en texto los días de la semana de un club (p. ej. *"Cada miércoles y
domingo"*).

### Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance de este change:**
- `lib/recurring.ts` con la función de generación (`generateRuns`), su helper de
  cálculo de fecha (`nextWeekday`) y el resumen de frecuencia
  (`summarizeWeekdays` o nombre equivalente).
- Añadir `slugify` a `lib/utils.ts` (reutilizable, no dupliques la lógica dentro
  de `lib/recurring.ts`).
- Un endpoint **`POST /api/cron/generate-runs`** protegido por secreto compartido
  (`CRON_SECRET`), que invoca `generateRuns()` y devuelve un resumen JSON.
- Configuración de **Vercel Cron** para disparar ese endpoint diariamente.
- Verificación real contra PostgreSQL: ejecutar la generación sobre los datos
  semilla ya existentes y comprobar resultados (ver §7).

**Non-goals explícitos (no los implementes en este change):**
- **No** construyas el listado público de carreras (`GET /api/runs`, página
  `/carreras`) — eso es `runs-directory` (Fase 3).
- **No** construyas UI para que un club gestione sus `RecurringRun` — eso es
  `club-onboarding` (Fase 4).
- **No** implementes autenticación de usuarios — el endpoint de cron se protege
  con un secreto de servidor (`CRON_SECRET`), no con sesión de usuario.
- **No** uses el campo `ClubDetail.runsSummary` desde ninguna página/componente
  todavía — solo expón la utilidad que lo calcula; su consumo en UI pertenece a
  `club-detail` (Fase 3).

---

## 4. Especificación funcional (basada en doc 2 §11 y PRD §6.1 — síguela con precisión)

### 4.1 Generación de instancias `Run`

Para cada `RecurringRun` con `active: true`, generar una instancia `Run` por cada
ocurrencia de su `weekday` dentro de las próximas `weeksAhead` semanas (por
defecto 20), **sin duplicar** las ya generadas.

- El `slug` de cada `Run` generado debe ser determinista y único, p. ej.
  `${slugify(recurringRun.title)}-${fecha.toISOString().slice(0,10)}`. Usa ese
  slug como clave de un `prisma.run.upsert` (`update: {}` si ya existe — no
  pisar campos editados manualmente sobre una instancia ya creada).
- Copia a la `Run` generada: `clubId`, `recurringRunId`, `title`, `description`,
  fecha/hora combinando la fecha calculada con `RecurringRun.time` (`"HH:mm"`),
  `location`, `lat`, `lng`, `distanceKm`, `pace`, `status: "SCHEDULED"`, y los
  `types` (claves de `RunTypeTag`) conectados vía el modelo de unión `RunType`
  (`types: { create: recurringRun.types.map((key) => ({ type: { connect: { key } } })) }`).
- Si una `RecurringRun` se desactiva (`active: false`), no debe generar nuevas
  instancias, pero **no debes borrar** las `Run` ya generadas (quedan visibles
  hasta su fecha, tal y como indica la regla de negocio del PRD).
- La función debe ser **segura de re-ejecutar** (llamarla dos veces seguidas no
  debe duplicar ni fallar).

### 4.2 Resumen de frecuencia del club

Implementa una función pura que, dada la lista de `weekday` (0-6) de las
`RecurringRun` **activas** de un club, devuelva un texto en español tipo
*"Cada miércoles y domingo"* o *"Cada lunes, miércoles y viernes"`:
- Elimina duplicados.
- Ordena los días en orden natural de semana española (lunes → domingo), no por
  el valor numérico crudo de `getDay()` (que empieza en domingo=0).
- Une los nombres con comas y la conjunción "y" antes del último elemento.
- Si no hay recurrencias activas, decide un valor por defecto razonable (p. ej.
  cadena vacía o `"Sin carreras programadas"`) y documenta tu elección en `design.md`.

### 4.3 Endpoint de disparo (cron)

`app/api/cron/generate-runs/route.ts`, método `POST`:
- Verifica un secreto compartido antes de ejecutar nada (cabecera
  `Authorization: Bearer ${process.env.CRON_SECRET}`, devolviendo `401` si no
  coincide o si `CRON_SECRET` no está configurado).
- Invoca `generateRuns()` y responde `200` con un JSON resumen (p. ej.
  `{ recurringRunsProcessed, runsCreated }`).
- Maneja errores devolviendo `500` con el mensaje, sin filtrar detalles sensibles.

### 4.4 Configuración de Vercel Cron

El proyecto se despliega en Vercel. La forma recomendada actualmente para
configurar crons es **`vercel.ts`** (no `vercel.json`), usando el paquete
`@vercel/config`:

```ts
// vercel.ts
import type { VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  framework: "nextjs",
  crons: [{ path: "/api/cron/generate-runs", schedule: "0 4 * * *" }],
};
```

Antes de instalar `@vercel/config`, comprueba con `npm view @vercel/config
version` que el paquete existe y su versión publicada, igual que se ha hecho con
el resto de dependencias de este proyecto (no asumas una versión de memoria). Si
por algún motivo el paquete no está disponible en tu entorno, documenta en
`design.md` la alternativa (`vercel.json` con `"crons"`) como *fallback* explícito,
pero intenta primero la vía recomendada.

---

## 5. Decisiones que debes tomar tú (documéntalas en `design.md` como "Decisión")

- **Protección del endpoint de cron sin sistema de auth todavía:** usa una
  variable de entorno `CRON_SECRET` (añádela a `.env.example`) en vez de depender
  de la capability `auth` (que no existe aún, Fase 4). Justifícalo en `design.md`.
- **Valor de `weeksAhead`:** usa 20 por defecto (coincide con doc 2 §11 y PRD US-1),
  pero hazlo parametrizable en la función `generateRuns(weeksAhead = 20)`.
- **Ubicación de `summarizeWeekdays`:** ponla en `lib/recurring.ts` junto a
  `generateRuns`, exportada para que `club-detail` la consuma más adelante sin
  duplicar lógica.

---

## 6. Metodología obligatoria (OpenSpec)

Sigue exactamente este ciclo (igual que en `design-system` y `data-model`):

```bash
# 1. Crea la carpeta del change con sus 3 ficheros + delta de spec
openspec/changes/add-recurring-runs-generation/proposal.md
openspec/changes/add-recurring-runs-generation/design.md
openspec/changes/add-recurring-runs-generation/tasks.md
openspec/changes/add-recurring-runs-generation/specs/recurring-runs/spec.md

# 2. Valida antes de implementar
openspec validate add-recurring-runs-generation --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §7) y vuelve a validar
openspec validate add-recurring-runs-generation --strict

# 5. Archiva: promueve el delta a la spec vigente
openspec archive add-recurring-runs-generation -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (depende de `data-model`, bloquea `runs-directory` y
  `club-detail`), qué cambia, capability `recurring-runs` (New Capability), impacto
  (nueva dependencia `@vercel/config` si procede, nuevo endpoint, nuevo cron), y
  una sección `## Non-goals` con los puntos del §3 de este prompt.
- **`design.md`**: las decisiones del §5, el algoritmo de generación (puedes
  resumirlo, no hace falta pegar el código entero), por qué el slug se basa en
  `slugify(title) + fecha`, y cómo se protege el endpoint.
- **`tasks.md`**: agrupa en algo como — (1) Utilidades de generación
  (`lib/recurring.ts`, `slugify` en `lib/utils.ts`), (2) Endpoint de cron protegido,
  (3) Configuración de Vercel Cron, (4) Resumen de frecuencia, (5) Verificación.
- **`specs/recurring-runs/spec.md`**: requisitos en formato OpenSpec
  (`## ADDED Requirements` → `### Requirement: ...` → `#### Scenario: ...` con
  **WHEN**/**THEN**). **Recuerda (lección de los changes anteriores):** cada
  enunciado de requisito debe contener la palabra clave **`MUST`** o **`SHALL`**
  en inglés (RFC 2119) aunque el resto de la frase esté en español, o
  `openspec validate --strict` fallará.

  Requisitos mínimos a cubrir: generación idempotente de `Run` desde
  `RecurringRun` activas, no generación desde recurrencias inactivas (sin borrar
  instancias previas), protección del endpoint de cron por secreto, y cálculo
  correcto del resumen de frecuencia en español.

---

## 7. Implementación y verificación (no te limites a "compila")

1. Necesitas el mismo PostgreSQL real usado para verificar `data-model` (arrays
   nativos `String[]`, no SQLite). Si no tienes `.env`/Postgres disponible en tu
   entorno, sigue el mismo patrón que `data-model`: ejecuta lo que sí puedas sin
   BD (build, lint, `prisma generate`) y **dilo explícitamente** en tu informe
   final, dejando documentados los comandos pendientes para que el usuario los
   termine.
2. Con Postgres disponible y los datos semilla ya cargados (20 clubs con sus
   `RecurringRun`, ya sembrados por `data-model`):
   - Ejecuta `generateRuns()` (mediante un script puntual tipo
     `prisma/generate-runs-once.ts`, o llamando al endpoint local con
     `next dev` levantado y la cabecera `Authorization` correcta).
   - Verifica que se crean cientos de `Run` (no cero) y que `prisma.run.count()`
     refleja un número coherente con el número de `RecurringRun` activas × semanas
     generadas (no exijas un número exacto, pero sí que sea explicable).
   - Vuelve a ejecutar `generateRuns()` una segunda vez y confirma que el conteo
     **no cambia** (idempotencia real, no solo teórica).
   - Llama a `summarizeWeekdays` sobre los `RecurringRun` activos de un club real
     de la base de datos (no inventes los datos, léelos) y confirma que el texto
     generado es gramaticalmente correcto en español.
3. Ejecuta `npm run build` y `npm run lint` del proyecto completo — deben seguir
   en verde (no debe romperse nada de `design-system` ni `data-model`).
4. Marca todas las casillas de `tasks.md`, repite
   `openspec validate add-recurring-runs-generation --strict` y archiva con
   `openspec archive add-recurring-runs-generation -y`. Confirma con
   `openspec list --specs` que `recurring-runs` aparece junto a `design-system` y
   `data-model`.

---

## 8. Qué NO hacer

- No reescribas `prisma/schema.prisma`, `lib/prisma.ts`, `prisma/seed.ts` ni los
  componentes/tokens de `design-system` salvo que sea estrictamente necesario
  (en cuyo caso, justifícalo).
- No implementes `/api/runs` ni ninguna página visible.
- No dependas de un sistema de autenticación que todavía no existe.
- No marques una tarea como completada si no la has verificado de verdad.

---

## 9. Formato de tu informe final al usuario

Resume: qué se implementó, qué se verificó realmente (incluye si pudiste o no
ejecutar contra un Postgres real y los conteos obtenidos), enlaces a los ficheros
clave (`lib/recurring.ts`, `lib/utils.ts`, `app/api/cron/generate-runs/route.ts`,
`vercel.ts`), confirmación de que `openspec validate` y `openspec archive` se
completaron, y propone la siguiente capability del roadmap (`runs-directory`,
Fase 3) como siguiente paso.
