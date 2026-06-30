## ADDED Requirements

### Requirement: Persistencia de entidades núcleo
El sistema MUST persistir en PostgreSQL las entidades `User`, `City`, `Club`,
`RunTypeTag`, `ClubType`, `ClubAward`, `ClubMember`, `RecurringRun`, `Run`,
`RunType`, `RunAttendee`, `NewsletterSubscriber` y `Race` con las relaciones
definidas en el esquema Prisma del change.

#### Scenario: Club asociado a una ciudad
- **WHEN** se crea un club con un `cityId` válido
- **THEN** el club MUST quedar vinculado a exactamente una `City` mediante la relación `Club.city`

#### Scenario: Carrera recurrente pertenece a un club
- **WHEN** se crea una `RecurringRun` para un club existente
- **THEN** la recurrencia MUST quedar asociada a ese `Club` y MUST poder consultarse vía `club.recurringRuns`

### Requirement: Unicidad de slugs y claves naturales
El sistema MUST garantizar unicidad de slugs públicos y claves de taxonomía para
evitar colisiones en URLs y filtros.

#### Scenario: Slug de club único
- **WHEN** se intenta crear dos clubs con el mismo `slug`
- **THEN** la base de datos MUST rechazar la operación por restricción de unicidad

#### Scenario: Clave de tipo de carrera única
- **WHEN** se intenta crear dos `RunTypeTag` con la misma `key`
- **THEN** la base de datos MUST rechazar la operación por restricción de unicidad

### Requirement: Unicidad de membresías y asistencias
El sistema MUST impedir duplicar la relación usuario-club y usuario-carrera.

#### Scenario: Membresía duplicada
- **WHEN** un usuario ya es miembro de un club e intenta unirse de nuevo
- **THEN** la base de datos MUST rechazar la operación por `@@unique([clubId, userId])`

#### Scenario: Asistencia duplicada
- **WHEN** un usuario ya está apuntado a una carrera e intenta apuntarse de nuevo
- **THEN** la base de datos MUST rechazar la operación por `@@unique([runId, userId])`

### Requirement: Inscripción interna y externa en Run
El modelo `Run` MUST soportar inscripción gestionada en plataforma (`signupType:
"internal"`) o enlace externo (`signupType: "external"` con `externalSignupUrl`),
así como datos opcionales de organizador individual y precio.

#### Scenario: Carrera con inscripción externa
- **WHEN** una carrera tiene `signupType` igual a `"external"` y `externalSignupUrl` definida
- **THEN** el sistema MUST persistir ambos campos y MUST permitir consultarlos desde Prisma Client

#### Scenario: Carrera gratuita por defecto
- **WHEN** se crea una carrera sin especificar `priceCents`
- **THEN** `priceCents` MUST ser `null`, indicando carrera gratuita

### Requirement: Datos semilla consistentes
El seed MUST poblar de forma idempotente datos ficticios suficientes para desarrollo:
20 ciudades, 11 tipos de carrera, 20 clubs con tipos, insignias (cuando aplique) y
al menos una `RecurringRun` por club.

#### Scenario: Conteos tras ejecutar el seed
- **WHEN** se ejecuta `npx prisma db seed` sobre una base vacía
- **THEN** MUST existir exactamente 20 registros `City`, 11 `RunTypeTag` y 20 `Club`

#### Scenario: Relaciones del seed cargables
- **WHEN** se consulta `prisma.club.findMany({ include: { city: true, types: { include: { type: true } }, recurringRuns: true, awards: true } })`
- **THEN** la consulta MUST completarse sin error y MUST devolver clubs con ciudad, tipos y recurrencias

#### Scenario: Insignias en el seed
- **WHEN** se ejecuta el seed
- **THEN** al menos un club MUST tener al menos un `ClubAward` asociado

### Requirement: Cliente Prisma reutilizable
El proyecto MUST exponer un singleton de Prisma Client en `lib/prisma.ts` para evitar
múltiples instancias en desarrollo con hot-reload de Next.js.

#### Scenario: Importación desde la app
- **WHEN** un módulo de servidor importa `prisma` desde `@/lib/prisma`
- **THEN** MUST obtener la misma instancia compartida en entorno de desarrollo

### Requirement: Tipos de dominio TypeScript
El proyecto MUST definir tipos de dominio en `types/index.ts` (`Pace`, `RunTypeTag`,
`ClubSummary`, `ClubDetail`, `RunSummary`, `RunDetail`, `RunFilters`) independientes
de los tipos generados por Prisma, incluyendo campos de inscripción y organizador en
`RunSummary`/`RunDetail`.

#### Scenario: RunSummary con campos de inscripción
- **WHEN** la capa API construye un `RunSummary`
- **THEN** MUST poder incluir `signupType`, `externalSignupUrl`, `organizerName` y `organizerRole`
