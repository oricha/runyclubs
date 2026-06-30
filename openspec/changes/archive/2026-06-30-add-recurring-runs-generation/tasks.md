## 1. Utilidades de generación

- [x] 1.1 Añadir `slugify` a `lib/utils.ts`
- [x] 1.2 Crear `lib/recurring.ts` con `nextWeekday`, `generateRuns`, `summarizeWeekdays`

## 2. Endpoint de cron protegido

- [x] 2.1 Crear `app/api/cron/generate-runs/route.ts` (POST + `CRON_SECRET`)
- [x] 2.2 Añadir `CRON_SECRET` a `.env.example`

## 3. Configuración Vercel Cron

- [x] 3.1 Instalar `@vercel/config@0.5.5` y crear `vercel.ts`

## 4. Verificación

- [x] 4.1 Script `prisma/verify-recurring-runs.ts` (generación + idempotencia + summarizeWeekdays)
- [x] 4.2 Ejecutar verificación contra Postgres: 693 runs creadas, idempotencia OK, resumen OK
- [x] 4.3 `npm run build` y `npm run lint` en verde
- [x] 4.4 `openspec validate add-recurring-runs-generation --strict` y archivar
