## Contexto

Capability Fase 3 que completa el flujo listado → ficha. Depende de `data-model`,
`recurring-runs` y reutiliza `lib/runs.ts` de `runs-directory` (ya archivada).

## Contratos

### `getRunBySlug(slug: string): Promise<RunDetail | null>`

- Busca `Run` con `slug`, `status: SCHEDULED`, `startAt >= now`.
- Incluye club (ciudad, tipos, insignias), tipos de carrera, asistentes con avatar.
- Mapea a `RunDetail` usando `mapClubToSummaryForRun` local (sin `lib/clubs.ts`).

### `getRunsAroundDate(date, excludeRunId, take = 3): Promise<RunSummary[]>`

- Ventana ±3 días con aritmética nativa de `Date` (sin `date-fns`).
- `status: SCHEDULED`, excluye `excludeRunId`, orden `startAt asc`, `take`.

### "Más carreras en [ciudad]"

- `getRuns({ city: citySlug })` → filtra `id !== current`, `.slice(0, 3)`.

## Decisiones

### Decisión: Claves i18n nuevas

Añadir en `runDetail`: `externalSignup`, `externalSignupNote`, `moreRunsInCity`,
`runsAroundDate`, `organizerRole` (fallback genérico). Reutilizar existentes:
`joinRun`, `shareRun`, `notKnownYet`, `hostedBy`, etc. Interpolación vía `t()`.

### Decisión: `JoinRunButton` presentacional

Visible si `signupType === "internal"`. Sin `onClick` real; botón deshabilitado
con `title` indicando que requiere auth (Fase 4). Comentario en código apuntando
a `POST /api/runs/[slug]/join`.

### Decisión: `attendeeAvatars` vacío

`AvatarStack` ya retorna `null` con `count <= 0`. En ficha, si hay avatars reales
se muestran; si no, texto con `runnersGoing` usando count 0 o mensaje elegante.

### Decisión: Renderizado dinámico

Página dinámica por `slug` (parámetro de ruta). No ISR: cada visita obtiene datos
frescos de asistentes y estado de inscripción. Equivalente a otras fichas del proyecto.

### Decisión: Reutilización de `runs-directory`

- `getRuns()` para recomendaciones por ciudad.
- `RunCard` para listas compactas de recomendaciones.
- `PACE_LABELS` / `getPaceLabel` para ritmo del club en metadatos si aplica.

## Datos de prueba externa

Si no hay `Run` con `signupType: external` en seed, script puntual
`scripts/dev-patch-external-run.ts` actualiza una carrera existente (temporal, no en seed).
