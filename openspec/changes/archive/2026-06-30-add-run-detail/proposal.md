## Why

RunClubs.es ya lista carreras en `/carreras` (`runs-directory`) con enlaces a
`/carreras/[slug]`, pero esas fichas devuelven 404. Sin `run-detail` el corredor
no puede ver detalle, metadatos, inscripción (interna o externa) ni descubrir
alternativas (US-4, US-5, US-6 del PRD §6.3).

Fase 3 del ROADMAP (`add-run-detail`). Fuentes: PRD §6.3, doc 1 §6, doc 4 §4 y §11.

## What Changes

- Ampliar `lib/runs.ts` con `getRunBySlug()` y `getRunsAroundDate()`.
- Página `app/carreras/[slug]/page.tsx` (Server Component + `notFound()`).
- Componentes en `components/run/`: cabecera, metadatos, organizador, acciones
  (join presentacional, external signup funcional, share), recomendaciones.
- JSON-LD `Event` embebido en la ficha.
- Nuevas claves i18n bajo `runDetail`.

## Capabilities

### New Capabilities

- `run-detail`: ficha de carrera en `/carreras/[slug]` con inscripción externa
  funcional, join presentacional, metadatos, asistentes y recomendaciones cruzadas.

### Modified Capabilities

_(ninguna)_

## Impact

- Extiende `lib/runs.ts` (reutiliza mapeos y `getRuns` para "Más en ciudad").
- Reutiliza `RunCard`, `DateBlock`, `TypeChip`, `AvatarStack`, `PACE_LABELS`.
- Desbloquea flujo completo listado → ficha; prepara `membership-attendance` (Fase 4).

## Non-goals

- **No** lógica real de "Apuntarse" (`auth` / `membership-attendance`, Fase 4).
- **No** backend para compartir (solo Web Share API + clipboard).
- **No** `/clubs/[slug]`, `/carreras` (listado), ni 404 específica de carrera.
- **No** crear `lib/clubs.ts`.
