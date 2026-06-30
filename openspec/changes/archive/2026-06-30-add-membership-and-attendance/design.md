## Contexto

Capability Fase 4 que conecta los stubs de `run-detail` (y futuro `club-detail`)
con persistencia real. Depende de `auth` archivado. Los modelos `RunAttendee` y
`ClubMember` ya existen en `data-model`; no hay migración.

## Estado de integración club-detail

Al implementar, **`app/clubs/[slug]/page.tsx` no existía** (capability
`club-detail` pendiente). Se creó `JoinClubButton` con la firma final y comentario
de integración; la página de club la conectará cuando exista.

## Decisiones

### Decisión: Pasar slug a Server Actions con `bind(null, slug)`

Se usa `action.bind(null, runSlug)` / `action.bind(null, clubSlug)` en los
formularios. Es más legible que `<input type="hidden">`, evita duplicar el slug
en el DOM y TypeScript valida el argumento en la firma de la acción.

### Decisión: Estado visual del botón de club tras unirse

Texto **«Miembro ✓»** con variante `outline` (análogo a «Voy» en carreras).
Clave i18n: `clubDetail.isMember: "Miembro ✓"`.

### Decisión: Loading state

Durante `useFormStatus().pending` se muestra **«…»** en ambos botones (sin
spinner). Consistente y minimalista; el formulario se deshabilita.

### Decisión: Auth en Server Action, no en middleware

Las rutas `/carreras/*` y `/clubs/*` permanecen públicas. Si no hay sesión,
cada acción hace `redirect("/acceso?next=/<tipo>/<slug>")`. El botón sin sesión
es un `<a href>` directo (no `<Link>`) para preservar `?next=` en cualquier entorno.

### Decisión: Idempotencia

- **Join:** `upsert` con `update: {}` — pulsar dos veces no duplica filas.
- **Leave:** `deleteMany` — tolerante si la fila ya no existe.

### Decisión: `isAttending` / `isMember` en la página, no en `getRunBySlug`

Son contexto de sesión, no datos del recurso. El tipo `RunDetail` no cambia.

### Decisión: Refresco del contador sin estado cliente

Tras join/leave, `revalidatePath` invalida la ficha; `RunAttendees` y contadores
de miembros se re-renderizan desde el Server Component. Sin `useOptimistic`.

## Flujo run-detail

```
page.tsx → auth() + isAttending query
         → JoinRunButton(runSlug, userId, isAttending)
              !userId → <a href="/acceso?next=...">
              userId + !isAttending → form joinRun.bind(null, slug)
              userId + isAttending → form leaveRun.bind(null, slug)
         → Server Action → upsert/deleteMany → revalidatePath
```

## Flujo club-detail (pendiente integración)

Mismo patrón con `joinClub` / `leaveClub` y `ClubMember` con rol `MEMBER` por defecto.
