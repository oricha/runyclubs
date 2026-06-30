## ADDED Requirements

### Requirement: Generación idempotente de instancias Run
El sistema MUST generar instancias `Run` a partir de cada `RecurringRun` activa para
las próximas N semanas (N=20 por defecto), sin duplicar ocurrencias ya persistidas.

#### Scenario: Primera ejecución crea instancias futuras
- **WHEN** se invoca `generateRuns()` con recurrencias activas en la base de datos
- **THEN** el sistema MUST crear una instancia `Run` por cada ocurrencia de `weekday`
  dentro del horizonte configurado, con slug `${slugify(title)}-YYYY-MM-DD`

#### Scenario: Segunda ejecución no duplica
- **WHEN** se invoca `generateRuns()` dos veces seguidas sin cambiar recurrencias
- **THEN** el conteo total de `Run` MUST permanecer igual y MUST NOT producir errores

#### Scenario: Upsert no pisa instancias existentes
- **WHEN** ya existe una `Run` con el slug calculado para una fecha
- **THEN** el sistema MUST ejecutar `upsert` con `update: {}` y MUST NOT modificar
  campos de la instancia existente

### Requirement: Campos copiados desde RecurringRun
Cada `Run` generada MUST heredar los datos operativos de su `RecurringRun` origen.

#### Scenario: Datos y tipos copiados
- **WHEN** se crea una instancia desde una recurrencia con título, hora, ubicación y tipos
- **THEN** la `Run` MUST incluir `clubId`, `recurringRunId`, `title`, `description`,
  `startAt` (fecha + `time`), `location`, coordenadas, `distanceKm`, `pace`,
  `status: SCHEDULED` y relaciones `RunType` conectadas por clave de `RunTypeTag`

### Requirement: Recurrencias inactivas no generan nuevas instancias
El sistema MUST omitir `RecurringRun` con `active: false` al generar, sin eliminar
instancias `Run` ya creadas.

#### Scenario: Recurrencia desactivada
- **WHEN** una `RecurringRun` pasa a `active: false`
- **THEN** nuevas ejecuciones de `generateRuns()` MUST NOT crear más instancias para
  esa recurrencia, pero las `Run` futuras ya generadas MUST permanecer en la base

### Requirement: Endpoint de cron protegido por secreto
El endpoint `POST /api/cron/generate-runs` MUST exigir `Authorization: Bearer
${CRON_SECRET}` antes de ejecutar la generación.

#### Scenario: Secreto válido
- **WHEN** la petición incluye la cabecera `Authorization` con el valor correcto de `CRON_SECRET`
- **THEN** el endpoint MUST invocar `generateRuns()` y responder `200` con un JSON
  resumen (`recurringRunsProcessed`, `runsCreated`)

#### Scenario: Secreto ausente o incorrecto
- **WHEN** falta la cabecera, el valor no coincide o `CRON_SECRET` no está configurado
- **THEN** el endpoint MUST responder `401` sin ejecutar la generación

### Requirement: Disparo programado en Vercel
El despliegue MUST configurar un cron diario que invoque el endpoint de generación.

#### Scenario: Cron diario configurado
- **WHEN** el proyecto se despliega en Vercel con la configuración del change
- **THEN** MUST existir un cron con schedule `0 4 * * *` apuntando a
  `/api/cron/generate-runs`

### Requirement: Resumen de frecuencia en español
El sistema MUST exponer una función pura que traduzca los `weekday` de recurrencias
activas a un texto legible en español.

#### Scenario: Varios días de la semana
- **WHEN** un club tiene recurrencias activas los miércoles (3) y domingos (0)
- **THEN** `summarizeWeekdays` MUST devolver un texto equivalente a
  `"Cada miércoles y domingo"`, con días ordenados lunes → domingo

#### Scenario: Sin recurrencias activas
- **WHEN** la lista de weekdays activos está vacía
- **THEN** la función MUST devolver `"Sin carreras programadas"`
