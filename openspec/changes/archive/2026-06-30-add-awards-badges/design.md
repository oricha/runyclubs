## Contexto

Capability presentacional de Fase 4. Depende de `data-model` (tabla `ClubAward`).
No crea páginas de producto nuevas salvo demo de verificación.

## Catálogo

Fuente única: `lib/awards.ts` (`AWARD_CATALOG`: founders, top-club, verified).

## Decisiones

### Tooltip: Opción A — Radix Tooltip

Instalado `@radix-ui/react-tooltip@1.2.11`. Mejor accesibilidad y estilo coherente
con el resto de primitivos shadcn/Radix del proyecto. `TooltipProvider` en
`app/layout.tsx` con `delayDuration={300}`.

### Badge «Verificado»: Opción A — campo `Club.verified`

Se deriva de `club.verified`, no de un registro `ClubAward`. Helper
`resolveClubAwards(awards, verified?)` inyecta la definición del catálogo cuando
`verified === true`. Cambios:

- `types/index.ts` — `verified?: boolean` en `ClubSummary`
- `lib/runs.ts` — `mapClubToSummaryForRun` mapea `verified: club.verified`

`lib/clubs.ts` no existe aún; se actualizará cuando exista `clubs-directory`.

### Estado de integración

| Superficie | Estado al implementar | Acción |
|---|---|---|
| `ClubCard.tsx` | No existe | Pendiente `clubs-directory` |
| `app/clubs/[slug]/page.tsx` | No existe | Pendiente `club-detail` |
| `app/demo/awards/page.tsx` | Creada | Verificación visual |

### Posición en tarjeta (futuro)

Documentado para `clubs-directory`: esquina superior derecha (`absolute right-3 top-3`)
dentro de tarjeta `relative`. En mobile misma posición — iconos compactos no
ocupan espacio del contenido principal.

### Fallback graceful

Si `award.key` no está en `AWARD_CATALOG`, `AwardBadge` usa `icon` y `label` del
prop; tooltip muestra `label` y opcionalmente `description` vacía.

## Componentes

- **AwardBadge** — atómico, `size` sm/md, `showLabel`, tooltip con label + description.
- **AwardStack** — `variant: "compact" | "expanded"`; compact = fila de iconos;
  expanded = toggle «Ver premios del club» con `<button>` accesible.
