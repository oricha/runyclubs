# Prompt de implementación — Capability `data-model` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `data-model` del proyecto RunClubs.es siguiendo
> **Spec-Driven Development con OpenSpec**. Léelo entero antes de escribir código.

---

## 1. Rol

Eres un **ingeniero full-stack senior** (Next.js + Prisma + PostgreSQL + TypeScript)
que trabaja siguiendo metodología **Spec-Driven Development** con el framework
**OpenSpec**. Escribes código y documentación en **español** (los comentarios de
código, cuando sean estrictamente necesarios, también en español). No tomas
atajos: cada paso del ciclo de vida de OpenSpec (proposal → specs → design →
tasks → implementación → validación → archivado) se completa en orden.

---

## 2. Contexto del proyecto

**RunClubs.es** es un directorio social de clubs de running y carreras grupales en
las 20 ciudades más importantes de España. El proyecto ya tiene:

- Un **PRD maestro** en `PRD-runclubs-es.md` (raíz del repo) — fuente única de verdad de producto.
- Un **roadmap de capabilities** en `openspec/ROADMAP-FUNCIONALIDADES.md` que descompone
  el PRD en *changes* de OpenSpec.
- **6 documentos fuente** en la raíz (`1-...md` a `6-Finals-recomendation`) con la
  especificación original, documento técnico, contenido/datos de ejemplo, análisis
  de secciones adicionales y monetización.
- OpenSpec **ya inicializado** (`openspec/config.yaml` con el contexto del proyecto,
  `openspec/specs/`, `openspec/changes/`). **No vuelvas a ejecutar `openspec init`.**
- La capability **`design-system` ya está implementada, validada y archivada**:
  `openspec/specs/design-system/spec.md` es la spec vigente. El scaffold de Next.js
  16 (App Router) + TypeScript + Tailwind CSS v3 + shadcn/ui (Radix) + `next/font`
  ya existe en la raíz del repo (`app/`, `components/`, `lib/`, `package.json`,
  `tsconfig.json`, `tailwind.config.ts`, `eslint.config.mjs`, etc.).

**No rehagas el scaffold de Next.js/Tailwind/ESLint.** Esta tarea solo añade la
capa de datos sobre el proyecto existente. Antes de escribir nada, lee:

1. `PRD-runclubs-es.md` — especialmente **§5** (mapa de épicas), **§7** (modelo de
   datos completo) y **§13** (plan de entregas por fases).
2. `openspec/ROADMAP-FUNCIONALIDADES.md` — entrada **`add-data-model`** (Fase 1).
3. `2-runclubs-es-documento-tecnico.md` **§6** (esquema Prisma original) y **§7**
   (tipos TypeScript de dominio).
4. `3-runclubs-es-contenido-datos.md` **completo** — necesitas las 20 ciudades, los
   11 tipos de carrera, la descripción detallada de los **20 clubs ficticios** y la
   tabla de carreras recurrentes para construir el seed.
5. `openspec/config.yaml` — contexto y convenciones del proyecto.

---

## 3. Objetivo de este change

Implementar la capability **`data-model`**: el modelo de dominio y persistencia
(Prisma + PostgreSQL) que sustenta clubs, carreras, ciudades, tipos, membresías y
newsletter, más los datos semilla (seed) necesarios para que el resto de
capabilities tengan datos reales con los que trabajar.

### Alcance (Decisión de scoping — síguelo tal cual, no lo amplíes)

El PRD (`PRD-runclubs-es.md` §7) incluye, además de las entidades núcleo, algunas
entidades que pertenecen a capabilities **futuras** (`admin-panel` Fase 4,
`races-competitions` y `advertising` Fase 5, `monetization-billing` Fase 6). Para
mantener este change acotado a lo que de verdad pertenece a la Fase 1, **NO
implementes ahora**:

- `RaceSuggestion` (pertenece a `races-competitions`).
- `AdvertiseLead` (pertenece a `advertising`).
- `User.isSuperAdmin` y `AdminAuditLog` (pertenecen a `admin-panel`).
- `Subscription` / `PlanTier` (pertenece a `monetization-billing`).

Esas capabilities añadirán sus propios modelos más adelante como **deltas
`MODIFIED Requirements`** sobre la spec `data-model` que tú vas a crear ahora. Esto
es exactamente para lo que sirve el sistema de deltas de OpenSpec — no te
adelantes a esas fases.

**Sí entra en el alcance de este change:**
- Esquema Prisma completo de las entidades núcleo (`User`, `City`, `Club`,
  `RunTypeTag`, `ClubType`, `ClubAward`, `ClubMember`, `RecurringRun`, `Run`,
  `RunType`, `RunAttendee`, `NewsletterSubscriber`).
- Las ampliaciones de `Run` para inscripción externa/organizador (`signupType`,
  `externalSignupUrl`, `organizerName`, `organizerRole`, `priceCents`) — están en
  el PRD §7.2 y en el propio doc 4 §4.1, son parte natural de `run-detail` y no de
  una fase posterior.
- El modelo `Race` (PRD §7.3) — el propio `ROADMAP-FUNCIONALIDADES.md` lo incluye
  explícitamente dentro de `add-data-model`.
- Cliente Prisma singleton (`lib/prisma.ts`), tipos TypeScript de dominio
  (`types/index.ts`), seed completo (`prisma/seed.ts`) y configuración de entorno
  (`.env.example`).

**Non-goals explícitos:**
- No crear endpoints `/api/*` (eso es de `runs-directory`, `clubs-directory`, etc.).
- No crear páginas ni componentes UI nuevos.
- No implementar autenticación ni roles (eso es de `auth`/`admin-panel`).
- No las 4 entidades diferidas listadas arriba.

---

## 4. Especificación del esquema (consolidada — úsala como referencia exacta)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Pace {
  ALL_PACES
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum MemberRole {
  OWNER
  ADMIN
  MEMBER
}

enum RunStatus {
  SCHEDULED
  CANCELLED
  COMPLETED
}

model User {
  id            String       @id @default(cuid())
  name          String?
  email         String       @unique
  emailVerified DateTime?
  image         String?
  city          String?
  createdAt     DateTime     @default(now())
  memberships   ClubMember[]
  attendances   RunAttendee[]
  ownedClubs    Club[]       @relation("ClubOwner")
}

model City {
  id     String  @id @default(cuid())
  name   String  @unique
  slug   String  @unique
  region String?
  lat    Float?
  lng    Float?
  clubs  Club[]
  races  Race[]
}

model Club {
  id            String         @id @default(cuid())
  slug          String         @unique
  name          String
  description   String         @db.Text
  logoUrl       String?
  coverUrl      String?
  instagramUrl  String?
  stravaUrl     String?
  website       String?
  cityId        String
  city          City           @relation(fields: [cityId], references: [id])
  pace          Pace           @default(ALL_PACES)
  frequency     Int            @default(1)
  usesPlatform  Boolean        @default(false)
  verified      Boolean        @default(false)
  ownerId       String
  owner         User           @relation("ClubOwner", fields: [ownerId], references: [id])
  types         ClubType[]
  awards        ClubAward[]
  members       ClubMember[]
  runs          Run[]
  recurringRuns RecurringRun[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([cityId])
  @@index([pace])
}

model RunTypeTag {
  id    String     @id @default(cuid())
  key   String     @unique
  emoji String
  label String
  clubs ClubType[]
  runs  RunType[]
}

model ClubType {
  clubId String
  typeId String
  club   Club       @relation(fields: [clubId], references: [id], onDelete: Cascade)
  type   RunTypeTag @relation(fields: [typeId], references: [id], onDelete: Cascade)

  @@id([clubId, typeId])
}

model ClubAward {
  id        String   @id @default(cuid())
  clubId    String
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  key       String
  label     String
  icon      String
  awardedAt DateTime @default(now())
}

model ClubMember {
  id       String     @id @default(cuid())
  clubId   String
  userId   String
  role     MemberRole @default(MEMBER)
  club     Club       @relation(fields: [clubId], references: [id], onDelete: Cascade)
  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt DateTime   @default(now())

  @@unique([clubId, userId])
}

model RecurringRun {
  id          String   @id @default(cuid())
  clubId      String
  club        Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  title       String
  description String?  @db.Text
  weekday     Int
  time        String
  location    String
  lat         Float?
  lng         Float?
  distanceKm  Float?
  pace        String?
  types       String[]
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  runs        Run[]
}

model Run {
  id             String        @id @default(cuid())
  slug           String        @unique
  clubId         String
  club           Club          @relation(fields: [clubId], references: [id], onDelete: Cascade)
  recurringRunId String?
  recurringRun   RecurringRun? @relation(fields: [recurringRunId], references: [id])
  title          String
  description    String?       @db.Text
  startAt        DateTime
  location       String
  lat            Float?
  lng            Float?
  distanceKm     Float?
  pace           String?
  status         RunStatus     @default(SCHEDULED)
  // Inscripción externa y organizador individual (PRD §7.2 / doc 4 §4.1)
  signupType        String   @default("internal") // "internal" | "external"
  externalSignupUrl String?
  organizerName     String?
  organizerRole     String?
  priceCents        Int?     // null = gratuita; >0 = de pago (gestionado por monetization-billing)
  types          RunType[]
  attendees      RunAttendee[]
  createdAt      DateTime      @default(now())

  @@index([startAt])
  @@index([clubId])
}

model RunType {
  runId  String
  typeId String
  run    Run        @relation(fields: [runId], references: [id], onDelete: Cascade)
  type   RunTypeTag @relation(fields: [typeId], references: [id], onDelete: Cascade)

  @@id([runId, typeId])
}

model RunAttendee {
  id       String   @id @default(cuid())
  runId    String
  userId   String
  run      Run      @relation(fields: [runId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt DateTime @default(now())

  @@unique([runId, userId])
}

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  city      String?
  createdAt DateTime @default(now())
}

model Race {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  cityId      String
  city        City     @relation(fields: [cityId], references: [id])
  date        DateTime
  description String?  @db.Text
  distances   String[]
  isPopular   Boolean  @default(false)
  status      String   @default("upcoming") // "upcoming" | "past"
  externalUrl String?
  createdAt   DateTime @default(now())

  @@index([cityId])
}
```

> Nota técnica: `String[]` (arrays nativos) y `@db.Text` son específicos de
> PostgreSQL. **No cambies el datasource a SQLite** — no soportaría el esquema tal
> cual. Necesitas un PostgreSQL real para `migrate dev` (ver §7).

### Tipos TypeScript de dominio (`types/index.ts`)

Crea los tipos de dominio (independientes de los tipos generados por Prisma, para
uso en API/UI) según `2-runclubs-es-documento-tecnico.md` §7: `Pace`, `RunTypeTag`,
`ClubSummary`, `ClubDetail`, `RunSummary`, `RunDetail`, `RunFilters`. Adapta
`RunSummary`/`RunDetail` para incluir los nuevos campos de `Run` (`signupType`,
`externalSignupUrl`, `organizerName`, `organizerRole`).

---

## 5. Datos semilla (`prisma/seed.ts`)

`3-runclubs-es-contenido-datos.md` contiene:
- §1: las 20 ciudades con slug y región.
- §2: los 11 tipos de carrera (clave, emoji, label).
- §3: la descripción completa de **los 20 clubs ficticios** (nombre, ciudad,
  frecuencia, ritmo, tipos, insignias, Instagram, descripción).
- §4: tabla de carreras recurrentes (cubre 14 de los 20 clubs).
- §7: un `seed.ts` de **ejemplo con solo 2 clubs completos** y el comentario
  `// ... añade el resto de los 20 clubs siguiendo este formato`.

**Tu tarea:** completa el seed con **los 20 clubs**, no solo los 2 de ejemplo. Para
los clubs que no aparecen en la tabla de §4 (carreras recurrentes), **decide tú**
una recurrencia razonable y coherente con su descripción y frecuencia declarada
(esto es una decisión de contenido esperada y explícitamente invitada por el
propio documento — no es ambigüedad que debas escalar).

El seed debe poblar, de forma idempotente (`upsert`):
- Las 20 `City`.
- Los 11 `RunTypeTag`.
- Un `User` propietario de ejemplo (`demo@runclubs.es`, como en el doc).
- Los 20 `Club` con sus `ClubType`, `ClubAward` (cuando el club tenga insignia en
  el doc) y sus `RecurringRun`.

No generes instancias `Run` desde las `RecurringRun` en este change — eso es
trabajo de la capability `recurring-runs` (Fase 2, change `add-recurring-runs-generation`).

---

## 6. Metodología obligatoria (OpenSpec)

Sigue exactamente este ciclo, igual que se hizo para `design-system`:

```bash
# 1. Crea la carpeta del change con sus 3 ficheros + delta de spec
openspec/changes/add-data-model/proposal.md
openspec/changes/add-data-model/design.md
openspec/changes/add-data-model/tasks.md
openspec/changes/add-data-model/specs/data-model/spec.md

# 2. Antes de implementar, valida el change
openspec validate add-data-model --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §7) y vuelve a validar
openspec validate add-data-model --strict

# 5. Archiva: promueve el delta a la spec vigente
openspec archive add-data-model -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (depende de `design-system`, bloquea todo lo demás),
  qué cambia, capability `data-model` (New Capability), impacto, y una sección
  `## Non-goals` listando explícitamente las 4 entidades diferidas del §3 de este
  prompt.
- **`design.md`**: decisiones de modelado (slugs, índices, relaciones,
  `onDelete: Cascade` en tablas de unión, por qué PostgreSQL y no SQLite, cómo se
  generará el cliente Prisma como singleton para evitar múltiples instancias en
  desarrollo con hot-reload de Next.js).
- **`tasks.md`**: agrupa en algo como — (1) Configuración Prisma + Postgres,
  (2) Esquema y migraciones, (3) Tipos TypeScript de dominio, (4) Seed,
  (5) Verificación.
- **`specs/data-model/spec.md`**: requisitos en formato OpenSpec
  (`## ADDED Requirements` → `### Requirement: ...` → `#### Scenario: ...` con
  **WHEN**/**THEN**). **Importante (lección aprendida en `design-system`):** el
  validador de OpenSpec exige que el texto de cada requisito contenga la palabra
  clave **`MUST`** o **`SHALL`** (RFC 2119) en inglés, aunque el resto de la frase
  esté en español — p. ej. *"El sistema MUST persistir cada club asociado a una
  única ciudad..."*. Si no la incluyes, `openspec validate --strict` falla con
  `must contain SHALL or MUST`.

  Requisitos mínimos a cubrir en el delta: persistencia de clubs/carreras/ciudades
  con sus relaciones, unicidad de slugs, unicidad de membresías/asistencias,
  inscripción interna vs. externa en `Run`, y existencia de datos semilla
  consistentes (20 ciudades, 11 tipos, 20 clubs).

---

## 7. Implementación y verificación (no te limites a "compila")

1. Instala dependencias nuevas sobre el `package.json` existente:
   `npm install prisma @prisma/client` (Prisma como dependencia de desarrollo
   junto a `@prisma/client` como dependencia de producción). Comprueba antes la
   versión publicada actual con `npm view prisma version` / `npm view
   @prisma/client version` y fíjala explícitamente en `package.json`, igual que
   se hizo con el resto de dependencias del proyecto.
2. Crea `.env.example` con `DATABASE_URL="postgresql://user:password@localhost:5432/runclubs"`
   y añade `.env` a `.gitignore` si no está ya cubierto (revisa el `.gitignore`
   existente del proyecto).
3. **Necesitas un PostgreSQL real** (el esquema usa `String[]` y `@db.Text`,
   incompatibles con SQLite). Si tienes Docker disponible:
   ```bash
   docker run --name runclub-db -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=runclubs -p 5432:5432 -d postgres:16
   ```
   y usa `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/runclubs"`
   en un `.env` local (no lo commitees).
   Si no tienes Docker ni acceso a un Postgres real en tu entorno de ejecución,
   **dilo explícitamente en tu informe final** — ejecuta como mínimo
   `npx prisma validate` y `npx prisma generate` (no requieren conexión), y deja
   documentados en `design.md`/`tasks.md` los comandos exactos que el usuario debe
   correr para terminar la verificación en su máquina.
4. Con Postgres disponible:
   ```bash
   npx prisma migrate dev --name init
   npx prisma db seed   # configura "prisma.seed" en package.json apuntando a prisma/seed.ts
   ```
5. Verifica con un script o consulta puntual vía Prisma Client que:
   - Hay exactamente 20 `City`, 11 `RunTypeTag`, 20 `Club`.
   - Al menos un club tiene `ClubAward` y al menos una `RecurringRun`.
   - Las relaciones cargan correctamente (`prisma.club.findMany({ include: { city: true, types: { include: { type: true } }, recurringRuns: true } })` no falla).
6. Ejecuta `npm run build` y `npm run lint` del proyecto completo — deben seguir
   en verde (no debe romperse nada de `design-system`).
7. Marca todas las casillas de `tasks.md`, repite `openspec validate
   add-data-model --strict` y archiva con `openspec archive add-data-model -y`.
   Confirma con `openspec list --specs` que `data-model` aparece como spec activa.

---

## 8. Qué NO hacer

- No reescribas ni reestructures los componentes/tokens de `design-system`.
- No implementes las 4 entidades diferidas (§3).
- No crees rutas `/api/*` ni páginas.
- No uses `git` para commitear a menos que el usuario te lo pida explícitamente.
- No marques una tarea como completada si no la has verificado de verdad (build
  roto, seed que no corre, migración no probada, etc.).

---

## 9. Formato de tu informe final al usuario

Al terminar, resume en pocas frases: qué se implementó, qué se verificó realmente
(incluye si pudiste o no ejecutar contra un Postgres real), enlaces a los ficheros
clave creados (`prisma/schema.prisma`, `prisma/seed.ts`, `lib/prisma.ts`,
`types/index.ts`), confirmación de que `openspec validate` y `openspec archive`
se completaron, y propone la siguiente capability del roadmap
(`recurring-runs`, Fase 2) como siguiente paso.
