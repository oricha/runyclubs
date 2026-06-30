## Contexto

Panel interno PRD §7.6–7.7. Acceso por `isSuperAdmin` en User. Baja soft via
`verified = false`. Auditoría append-only en `AdminAuditLog`.

## Decisiones

| Decisión | Elección |
|---|---|
| Rol superadmin | `isSuperAdmin: Boolean` en User |
| Acceso | `/admin` + guard en página; sin enlace en UI |
| Baja club | `verified = false` |
| Alta club | `verified = false` hasta revisión |
| Confirmación baja | `window.confirm` |
| Session | `isSuperAdmin` en callback session |

## Server Actions

- `disableClub` / `enableClub` — toggle `verified` + audit log
- `assignClubOwner` — transaction owner + ClubMember OWNER + audit
- `createClubAsAdmin` — club mínimo + ClubMember OWNER + audit + `generateRuns()`

## UI

Tabla clubs, formulario alta, log últimas 50 entradas. Client components pequeños
con `useState` + async actions.
