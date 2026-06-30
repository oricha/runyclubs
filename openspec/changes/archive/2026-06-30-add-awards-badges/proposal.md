## Why

El modelo `ClubAward` y los datos sembrados (`founders`, `top-club`) existen desde
`data-model`, pero ninguna superficie de UI renderiza las insignias. Esta capability
cierra esa brecha con un catálogo canónico y componentes reutilizables (US-14, PRD §6.9).

## What Changes

- `lib/awards.ts` — catálogo canónico y helper `resolveClubAwards` (incluye badge
  «Verificado» derivado de `Club.verified`).
- `components/ui/tooltip.tsx` — Radix Tooltip + `TooltipProvider` en `app/layout.tsx`.
- `components/club/AwardBadge.tsx` y `AwardStack.tsx` — render compacto y expandido.
- `types/index.ts` + `lib/runs.ts` — campo `verified` en `ClubSummary` (Opción A).
- `app/demo/awards/page.tsx` — demo visual (no hay `ClubCard` ni `club-detail` aún).
- `components/club/index.ts` — exports para integración futura.

## Capabilities

### New Capabilities

- `awards-badges`: catálogo, badges con tooltip y stack expandible para premios de club.

### Modified Capabilities

_(ninguna — no se alteran requisitos de capabilities archivadas)_

## Impact

- Nueva dependencia: `@radix-ui/react-tooltip`.
- Sin migración Prisma ni cambios en `ClubAward`.
- Integración en listado/ficha pendiente de `clubs-directory` y `club-detail`.

## Non-goals

- **No** crear `ClubCard.tsx` ni `app/clubs/[slug]/page.tsx`.
- **No** lógica de asignación de awards (`admin-panel`).
- **No** cambios al schema `ClubAward`.
- **No** awards adicionales en seed.
- **No** sistema de puntos, unlocks automáticos ni levels.

## Estado de integración esperado

Al implementar: **`ClubCard` y `club-detail` no existían**. Se creó `/demo/awards`;
`clubs-directory` integrará `<AwardStack variant="compact" />` en la esquina de la tarjeta;
`club-detail` usará modo expandido.
