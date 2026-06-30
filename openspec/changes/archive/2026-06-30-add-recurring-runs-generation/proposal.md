## Why

RunClubs.es ya tiene clubs con `RecurringRun` sembradas (`data-model`), pero sin
instancias `Run` futuras no hay carreras que mostrar en directorios ni fichas.
La generación automática idempotente desbloquea `runs-directory`, `run-detail` y
el campo `runsSummary` de `club-detail`.

Depende de **`data-model`** (modelos `RecurringRun`/`Run` y seed) y **bloquea**
capabilities de Fase 3 que listan o detallan carreras.

Fase 2 (Recurrencias) del ROADMAP. Fuentes: PRD §6.1, doc 2 §11, ROADMAP
`add-recurring-runs-generation`.

## What Changes

- `lib/recurring.ts`: `generateRuns(weeksAhead = 20)`, `nextWeekday`, `summarizeWeekdays`.
- `slugify` en `lib/utils.ts` (reutilizable).
- Endpoint `POST /api/cron/generate-runs` protegido por `CRON_SECRET`.
- `vercel.ts` con cron diario `0 4 * * *` vía `@vercel/config`.
- Scripts de verificación y variable `CRON_SECRET` en `.env.example`.

## Capabilities

### New Capabilities
- `recurring-runs`: generación idempotente de instancias `Run` desde `RecurringRun`
  activas, disparo vía cron y utilidad de resumen de frecuencia en español.

## Impact

- Nueva dependencia `@vercel/config` (configuración de cron en Vercel).
- Nuevo endpoint API bajo `app/api/cron/` (sin UI).
- Población masiva de tabla `Run` en bases con seed cargado (~36 recurrentes × 20 semanas).
- No modifica esquema Prisma ni componentes de `design-system`.

## Non-goals

- **No** implementar `GET /api/runs` ni página `/carreras` (`runs-directory`, Fase 3).
- **No** construir UI de gestión de `RecurringRun` (`club-onboarding`, Fase 4).
- **No** usar autenticación de usuario; solo secreto de servidor `CRON_SECRET`.
- **No** consumir `runsSummary` desde páginas/componentes (`club-detail`, Fase 3).
