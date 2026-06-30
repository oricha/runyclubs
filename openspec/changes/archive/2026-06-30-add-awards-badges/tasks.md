## 1. Catálogo

- [x] 1.1 Crear `lib/awards.ts` con `AWARD_CATALOG`, `getAwardDefinition`, `resolveClubAwards`

## 2. Tooltip

- [x] 2.1 Instalar `@radix-ui/react-tooltip@1.2.11`
- [x] 2.2 Crear `components/ui/tooltip.tsx`
- [x] 2.3 Añadir `TooltipProvider` en `app/layout.tsx`

## 3. Componentes

- [x] 3.1 `components/club/AwardBadge.tsx`
- [x] 3.2 `components/club/AwardStack.tsx`
- [x] 3.3 `components/club/index.ts` — exports

## 4. Verified (Opción A)

- [x] 4.1 `verified?: boolean` en `ClubSummary` y mapeo en `lib/runs.ts`

## 5. Integración / demo

- [x] 5.1 Página `app/demo/awards/page.tsx` (ClubCard y club-detail no existían)
- [x] 5.2 i18n `common.hideAwards`

## 6. Verificación

- [x] 6.1 Query SQL awards en BD, demo visual, build/lint
- [x] 6.2 `openspec validate add-awards-badges --strict` y archivar
