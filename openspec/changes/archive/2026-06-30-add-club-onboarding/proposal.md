## Why

RunClubs.es necesita el primer flujo de captación self-service para que
organizadores publiquen su club sin intervención manual. Prerequisitos
`auth` y `membership-attendance` ya están archivados; este change habilita
US-13 (PRD §6.8) y desbloquea crecimiento orgánico del directorio.

Referencia: PRD §6.8, §14 (moderación); roadmap Fase 4.

## What Changes

- Wizard de 5 pasos en `/onboarding/club` (Client Component con estado local).
- Server Action `createClub` con transacción Prisma atómica.
- Creación de `Club`, `ClubType`, `RecurringRun`, `ClubMember` (OWNER).
- Generación de instancias `Run` vía `generateRuns()` tras crear el club.
- Pantalla de éxito inline con enlace al club y copiar URL.
- Sección `onboarding.*` en `lib/i18n/es.ts`.

## Decisión de moderación

**Publicación inmediata:** el club queda visible en `/clubs` con
`verified: false`. No hay cola de revisión en este change; `admin-panel`
añadirá moderación cuando sea necesario.

## Capabilities

### New Capabilities

- `club-onboarding`: wizard multi-paso para alta de clubs con recurrencias,
  slug automático, owner como `ClubMember OWNER` y generación de runs.

### Modified Capabilities

_(ninguna)_

## Impact

- Nuevas filas en `Club`, `RecurringRun`, `ClubType`, `ClubMember`, `Run`.
- Ruta protegida por middleware existente (`/onboarding/:path*`).
- Footer ya enlaza a `/onboarding/club` — verificar sin cambios.

## Non-goals

- **No** upload de imágenes (S3, Vercel Blob) — solo URL externa.
- **No** edición de club existente (`admin-panel`, `user-account`).
- **No** moderación previa a publicación.
- **No** wizard separado de recurrencias fuera del flujo de club.
- **No** campos `priceCents` ni `signupType` en el onboarding.
- **No** rutas `/onboarding/club/editar`.
