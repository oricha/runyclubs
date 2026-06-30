## Contexto

Capability Fase 4. Conecta auth existente con datos de membresía y asistencia ya
modelados en Prisma. Ruta `/cuenta` protegida por middleware + guard en Server Component.

## Decisiones

| Decisión | Elección |
|---|---|
| Auth guard | Middleware + `auth()` + `redirect('/acceso')` en página |
| Edición nombre | Client inline + Server Action (sin `useFormState`) |
| Ciudad usuario | Slug de `CITY_DETAILS` en `User.city` |
| Roles visibles | Badge solo OWNER (`Fundador`) y ADMIN (`Admin`) |
| Carreras | Split futuras/pasadas por `startAt` vs `now()` |
| Avatar | Imagen OAuth o iniciales en círculo `bg-muted` |

## Server Actions

`updateUserName(name)` — trim, 2–80 chars, `revalidatePath('/cuenta')`.  
`updateUserCity(city)` — slug o `null`, `revalidatePath('/cuenta')`.

## Componentes

- `AccountHeader` (client): avatar, nombre editable, selector ciudad.
- `ClubMembershipCard` (server): logo/iniciales, rol, link a club.
- `RunAttendanceCard` (server): fecha, club, badge Próxima/Pasada, link a carrera.
