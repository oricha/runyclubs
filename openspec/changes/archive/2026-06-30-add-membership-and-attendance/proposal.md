## Why

Las fichas de carrera (`run-detail`) y club (`club-detail`) dejaron los botones
«Apuntarse» y «Unirse al club» como shells presentacionales deshabilitados. Con
`auth` ya archivado, este change activa la membresía y asistencia real en BD,
prerequisito de Fase 4 para `club-onboarding` y `user-account`.

Referencia: PRD §6.3 (US-4) y §6.4 (US-8 parcial); roadmap Fase 4.

## What Changes

- `lib/actions/attendance.ts` — cuatro Server Actions: `joinRun`, `leaveRun`,
  `joinClub`, `leaveClub` con upsert/deleteMany e idempotencia.
- `components/run/JoinRunButton.tsx` — reescritura con sesión, toggle join/leave
  y redirección a `/acceso` sin sesión.
- `components/club/JoinClubButton.tsx` — componente con firma final (integración
  en ficha de club si `club-detail` existe).
- `app/carreras/[slug]/page.tsx` — `auth()`, query `isAttending`, props al botón.
- Clave i18n `clubDetail.isMember` para estado «Miembro» tras unirse.

## Capabilities

### New Capabilities

- `membership-attendance`: apuntarse/desapuntarse de carreras internas y
  unirse/salir de clubs con sesión Auth.js; redirección a login si no hay sesión.

### Modified Capabilities

_(ninguna — no se alteran requisitos de capabilities archivadas)_

## Impact

- Escrituras en tablas `RunAttendee` y `ClubMember` (modelos ya existentes).
- Revalidación de rutas `/carreras/[slug]` y `/clubs/[slug]` tras cada acción.
- Sin cambios en middleware ni Route Handlers nuevos.

## Non-goals

- **No** gestión de roles `OWNER`/`ADMIN` en clubs (`club-onboarding`, `admin-panel`).
- **No** notificaciones por email al unirse.
- **No** paginación de miembros ni lista completa de asistentes.
- **No** implementar `/cuenta` ni perfil de usuario.
- **No** modificar `middleware.ts` — las fichas son públicas; la auth la hace la Server Action.
- **No** Route Handlers (`/api/runs/[slug]/join`).

## Dependencias

- **Requiere:** `auth` (archivado) — sesión con `session.user.id`.
- **Integración club:** `app/clubs/[slug]/page.tsx` no existía al implementar;
  `JoinClubButton` queda listo para integración por `club-detail`.
