## ADDED Requirements

### Requirement: Metadata base global
`app/layout.tsx` MUST export metadata con `metadataBase`, title template, description,
OpenGraph, Twitter, robots y canonical del sitio.

#### Scenario: Title por defecto de la home
- **WHEN** se renderiza la página de inicio sin metadata propia
- **THEN** el title MUST ser «RunClubs.es — Directorio de clubs de running en España»

### Requirement: robots.txt
El proyecto MUST servir `app/robots.ts` que permita `/` y disallow `/admin` y `/api/`,
referenciando el sitemap.

#### Scenario: Bloqueo de admin
- **WHEN** un crawler lee `/robots.txt`
- **THEN** MUST incluir `Disallow: /admin`

### Requirement: Sitemap dinámico
`app/sitemap.ts` MUST incluir rutas estáticas, ciudades de `CITY_DETAILS`, clubs
verificados, carreras recientes, tipos de run y entradas de blog si existen.

#### Scenario: Ciudades en sitemap
- **WHEN** se genera `/sitemap.xml`
- **THEN** MUST incluir URLs `/ciudades/{slug}` para cada ciudad de `CITY_DETAILS`

#### Scenario: Clubs verificados
- **WHEN** existen clubs con `verified: true`
- **THEN** MUST incluir URLs `/clubs/{slug}` en el sitemap

### Requirement: JSON-LD WebSite global
El layout MUST incluir script JSON-LD `WebSite` con `SearchAction`.

#### Scenario: Schema en HTML
- **WHEN** se renderiza cualquier página
- **THEN** el HTML MUST incluir JSON-LD `@type: WebSite`

### Requirement: Metadata de listados
Las rutas `/carreras` y `/blog` MUST exportar title, description, canonical y OpenGraph.

#### Scenario: Listado carreras
- **WHEN** se solicita metadata de `/carreras`
- **THEN** MUST existir title y canonical `/carreras`

### Requirement: Metadata y JSON-LD de detalle de carrera
`/carreras/[slug]` MUST tener `generateMetadata` con title, description, canonical y
OpenGraph, y JSON-LD `@type: Event`.

#### Scenario: Event schema
- **WHEN** se renderiza un detalle de carrera válido
- **THEN** MUST existir JSON-LD `@type: Event` con `startDate` y `organizer`
