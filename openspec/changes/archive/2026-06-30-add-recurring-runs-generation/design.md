## Decisiones

### Protección del cron sin `auth` (Fase 4)

El endpoint `POST /api/cron/generate-runs` se protege con `CRON_SECRET` en la
cabecera `Authorization: Bearer <secreto>`. No existe NextAuth todavía; Vercel Cron
envía el secreto configurado en el proyecto. Si `CRON_SECRET` no está definido, el
endpoint responde `401` sin ejecutar la generación.

### `weeksAhead` parametrizable (default 20)

Coincide con PRD US-1 y doc 2 §11. La firma es `generateRuns(weeksAhead = 20)` para
permitir pruebas con menos semanas sin cambiar la lógica de producción.

### Resumen de frecuencia (`summarizeWeekdays`)

Ubicada en `lib/recurring.ts`, exportada para `club-detail` (Fase 3).

- Entrada: lista de `weekday` (0–6, convención `Date.getDay()`).
- Elimina duplicados.
- Ordena lunes → domingo (1, 2, 3, 4, 5, 6, 0), no por valor numérico crudo.
- Formato: `"Cada miércoles y domingo"` / `"Cada lunes, miércoles y viernes"`.
- **Sin recurrencias activas:** devuelve `"Sin carreras programadas"` (cadena explícita
  para distinguir de club sin datos vs. error).

## Algoritmo de generación

1. Cargar `RecurringRun` con `active: true`.
2. Para cada recurrencia y cada semana `w` en `[0, weeksAhead)`:
   - Calcular fecha con `nextWeekday(today, weekday, w)`.
   - Combinar con `time` (`HH:mm`).
   - Omitir si la fecha/hora es anterior a `now`.
   - Slug determinista: `${slugify(title)}-${fecha ISO YYYY-MM-DD}`.
   - `prisma.run.upsert({ where: { slug }, update: {}, create: { ... } })` — no pisa
     instancias ya existentes (idempotencia).
3. Copiar campos de la recurrencia y conectar `RunType` por claves en `recurringRun.types`.
4. Recurrencias con `active: false` no entran en el bucle; las `Run` ya creadas no se borran.

## Slug basado en título + fecha

Garantiza unicidad por ocurrencia y estabilidad entre ejecuciones del cron. `slugify`
normaliza acentos y caracteres no alfanuméricos (español).

## Vercel Cron

Configuración en `vercel.ts` con `@vercel/config@0.5.5`:

```ts
crons: [{ path: "/api/cron/generate-runs", schedule: "0 4 * * *" }]
```

**Fallback** si `@vercel/config` no estuviera disponible: `vercel.json` con
`"crons": [{ "path": "/api/cron/generate-runs", "schedule": "0 4 * * *" }]`.

## Verificación local

```bash
# Con seed y Postgres (puerto 5433 si Docker local de data-model)
npm run db:verify-recurring

# O disparo manual del endpoint (next dev + CRON_SECRET)
curl -X POST http://localhost:3000/api/cron/generate-runs \
  -H "Authorization: Bearer $CRON_SECRET"
```
