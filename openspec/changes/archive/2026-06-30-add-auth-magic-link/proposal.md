## Why

RunClubs.es necesita autenticación sin contraseña (magic link + Google OAuth) como
prerequisito de Fase 4: `membership-attendance`, `club-onboarding`, `user-account`
y `admin-panel` dependen de sesiones de usuario identificadas.

El modelo `User` ya existe en `data-model` con relaciones a clubs y carreras; este
change añade las tablas estándar de Auth.js sin alterar campos existentes.

## What Changes

- Migración Prisma: modelos `Account`, `Session`, `VerificationToken` + relaciones en `User`.
- `auth.ts` — configuración Auth.js v5 con PrismaAdapter, Google y Resend.
- `app/api/auth/[...nextauth]/route.ts` — route handler App Router.
- `app/acceso/page.tsx` (+ `/acceso/verificar`) — login magic link + Google con `next`/`callbackUrl`.
- `middleware.ts` — protección de `/cuenta` y `/onboarding`.
- `Header` — avatar/iniciales con sesión, enlace a `/acceso` sin sesión.
- `types/next-auth.d.ts`, `.env.example`, claves i18n `auth.*`.

## Capabilities

### New Capabilities

- `auth`: autenticación magic link (Resend) + Google OAuth, sesiones en BD, middleware y UI de acceso.

### Modified Capabilities

_(ninguna — no se modifican requisitos de capabilities archivadas)_

## Impact

- Nuevas tablas en PostgreSQL (sin borrar datos de `User`, `Club`, `Run`).
- Refactor mínimo de `Header` (Server Component + `HeaderClient`).
- Rutas públicas (`/`, `/carreras`, etc.) sin cambios de acceso.

## Non-goals

- **No** implementar `/cuenta` (`user-account`).
- **No** botones funcionales «Unirse» / «Apuntarse» (`membership-attendance`).
- **No** wizard `/onboarding/club` (`club-onboarding`).
- **No** panel admin ni roles superadmin.
- **No** recuperación de contraseña ni email de bienvenida.
