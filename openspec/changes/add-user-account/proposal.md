## Why

La ruta `/cuenta` está protegida por middleware pero no existe la página. Los usuarios
autenticados necesitan ver sus clubs, carreras apuntadas y editar nombre y ciudad.

## What Changes

- `app/cuenta/page.tsx` — dashboard de cuenta con clubs y carreras.
- `lib/actions/account.ts` — Server Actions `updateUserName` y `updateUserCity`.
- Componentes en `components/account/` — cabecera editable, tarjetas de club y carrera.
- Claves i18n `account.*` en `lib/i18n/es.ts`.

## Capabilities

### New Capabilities

- `user-account`: página `/cuenta` con perfil editable, clubs y carreras del usuario.

### Modified Capabilities

_(ninguna)_

## Impact

- Lecturas de `ClubMember` y `RunAttendee` por usuario autenticado.
- Escrituras en `User.name` y `User.city`.

## Non-goals

- Password, magic links, borrado de cuenta, panel admin, notificaciones, billing, avatar upload.
