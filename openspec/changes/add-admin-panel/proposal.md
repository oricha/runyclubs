## Why

RunClubs.es necesita un panel interno para que superadmins gestionen clubs (alta, baja,
asignación de owner) con trazabilidad en auditoría.

## What Changes

- Migración Prisma: `User.isSuperAdmin`, modelo `AdminAuditLog`.
- Sesión Auth.js con `isSuperAdmin`.
- Middleware protege `/admin/:path*`.
- `app/admin/page.tsx` y Server Actions en `lib/actions/admin.ts`.

## Capabilities

### New Capabilities

- `admin-panel`: panel `/admin` para superadmins con gestión de clubs y log de auditoría.

### Modified Capabilities

- `auth`: sesión MUST incluir `isSuperAdmin`.

## Impact

- Escrituras en `Club.verified`, `Club.ownerId`, `ClubMember`, `AdminAuditLog`.
- Ruta oculta sin enlaces en nav pública.

## Non-goals

- Gestión de usuarios, carreras, métricas, moderation queue, edición completa de clubs.
