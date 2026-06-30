## Decisiones de modelado

### PostgreSQL obligatorio (no SQLite)

El esquema usa `String[]` en `RecurringRun.types` y `Race.distances`, además de
`@db.Text` en descripciones largas. SQLite no soporta estos tipos tal cual. El
datasource MUST permanecer en `postgresql`.

Para desarrollo local se recomienda Docker:

```bash
docker run --name runclub-db -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=runclubs -p 5432:5432 -d postgres:16
```

`DATABASE_URL="postgresql://postgres:postgres@localhost:5432/runclubs"`

### Slugs como identificadores públicos

- `City.slug`, `Club.slug`, `Run.slug`, `Race.slug`: únicos, URL-safe, en español
  (ej. `retiro-morning-crew`, `san-sebastian`).
- `RunTypeTag.key`: clave estable en inglés kebab (`social`, `long-run`) para filtros
  e i18n; el label visible está en español.

### Índices y relaciones

- `@@index([cityId])` y `@@index([pace])` en `Club` para filtros de directorio.
- `@@index([startAt])` y `@@index([clubId])` en `Run` para listados cronológicos.
- `@@index([cityId])` en `Race` para páginas de ciudad/competiciones.
- `onDelete: Cascade` en tablas de unión (`ClubType`, `ClubMember`, `RunType`,
  `RunAttendee`) y entidades hijas (`ClubAward`, `RecurringRun`) para evitar huérfanos.

### Campos ampliados en `Run` (Fase 1, no diferidos)

Campos de inscripción externa y organizador individual (`signupType`,
`externalSignupUrl`, `organizerName`, `organizerRole`, `priceCents`) forman parte
del modelo base porque `run-detail` los consumirá en Fase 3. `priceCents` nullable
indica carrera gratuita; la lógica de cobro pertenece a `monetization-billing`.

### Cliente Prisma singleton (`lib/prisma.ts`)

En desarrollo con hot-reload de Next.js, múltiples instancias de `PrismaClient`
agotan conexiones. El patrón estándar almacena la instancia en `globalThis` en
entorno no productivo. Con **Prisma v7.8.0** se requiere además:

- `prisma.config.ts` en la raíz con `datasource.url` (la URL ya no va en `schema.prisma`).
- Driver adapter `@prisma/adapter-pg` + pool `pg` pasados al constructor de `PrismaClient`.
- `import "dotenv/config"` en scripts CLI (`seed.ts`, `verify-seed.ts`).

```ts
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
```

### Estrategia de seed

- **Idempotencia:** `upsert` por claves naturales (`City.slug`, `RunTypeTag.key`,
  `User.email`, `Club.slug`).
- **Contenido:** 20 ciudades (doc 3 §1), 11 tipos (doc 3 §2), 20 clubs (doc 3 §3).
- **RecurringRun:** tabla doc 3 §4 cubre 14 clubs; los 6 restantes reciben recurrencias
  coherentes con su frecuencia y descripción (decisión de contenido explícita).
- **Sin instancias `Run`:** la generación automática es responsabilidad de
  `add-recurring-runs-generation`.
- **Usuario demo:** `demo@runclubs.es` como propietario de todos los clubs seed.

### Tipos de dominio (`types/index.ts`)

Tipos independientes de Prisma Client para capas API/UI. `RunSummary`/`RunDetail`
incluyen campos de inscripción externa y organizador añadidos al modelo `Run`.

## Verificación local (si el agente no tiene Postgres)

Como mínimo sin conexión:

```bash
npx prisma validate
npx prisma generate
npm run build
npm run lint
```

Con Postgres disponible:

```bash
npx prisma migrate dev --name init
npx prisma db seed
```
