## Why

RunClubs.es necesita persistencia de dominio antes de construir directorios, fichas,
autenticación o cron de recurrencias. El PRD (§7) y los documentos técnicos (doc 2 §6-7,
doc 3 §7) definen el modelo de clubs, carreras, ciudades, tipos y newsletter. Sin esta
capability, ningún change posterior puede leer ni escribir datos reales.

Depende de `design-system` (scaffold Next.js ya existente) y **bloquea** prácticamente
todo el roadmap (Fase 2 en adelante).

Fase 1 (Base) del ROADMAP. Fuentes: PRD §7, doc 2 §6-7, doc 3 completo, doc 4 §12.

## What Changes

- Esquema Prisma + PostgreSQL: enums (`Pace`, `MemberRole`, `RunStatus`) y modelos
  `User`, `City`, `Club`, `RunTypeTag`, `ClubType`, `ClubAward`, `ClubMember`,
  `RecurringRun`, `Run` (con campos de inscripción externa/organizador), `RunType`,
  `RunAttendee`, `NewsletterSubscriber`, `Race`.
- Cliente Prisma singleton (`lib/prisma.ts`).
- Tipos TypeScript de dominio (`types/index.ts`) según doc 2 §7.
- Seed idempotente (`prisma/seed.ts`): 20 ciudades, 11 tipos, 20 clubs ficticios con
  tipos, insignias y carreras recurrentes.
- Configuración de entorno (`.env.example`, `prisma.seed` en `package.json`).

## Capabilities

### New Capabilities
- `data-model`: modelo de dominio y persistencia (Prisma + PostgreSQL) con datos
  semilla consistentes para desarrollo y pruebas de capabilities posteriores.

## Impact

- Añade dependencias `prisma` (dev) y `@prisma/client` (prod), más `tsx` para el seed.
- Requiere PostgreSQL real (arrays nativos `String[]`, campos `@db.Text`).
- No modifica UI ni rutas existentes de `design-system`.
- Prerequisito de `recurring-runs`, directorios, auth, newsletter, etc.

## Non-goals

- **No** implementar `RaceSuggestion` (capability `races-competitions`, Fase 5).
- **No** implementar `AdvertiseLead` (capability `advertising`, Fase 5).
- **No** implementar `User.isSuperAdmin` ni `AdminAuditLog` (capability `admin-panel`, Fase 4).
- **No** implementar `Subscription` / `PlanTier` (capability `monetization-billing`, Fase 6).
- **No** crear endpoints `/api/*`, páginas UI ni autenticación.
- **No** generar instancias `Run` desde `RecurringRun` (capability `recurring-runs`, Fase 2).
