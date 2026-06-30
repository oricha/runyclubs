## ADDED Requirements

### Requirement: Página por slug de ciudad
El sistema MUST servir una página en `/ciudades/[ciudad]` para cada slug de
`CITY_DETAILS`, generada estáticamente con `generateStaticParams`.

#### Scenario: Ciudad válida
- **WHEN** se visita `/ciudades/madrid`
- **THEN** MUST mostrarse el título «Carreras en Madrid» y datos de la ciudad

#### Scenario: Slug inválido
- **WHEN** se visita `/ciudades/ciudad-inventada`
- **THEN** MUST responder 404

### Requirement: Ciudad sin datos en BD
La página MUST renderizarse con clubs y carreras vacíos cuando el slug existe en
`CITY_DETAILS` pero no hay fila `City` en PostgreSQL.

#### Scenario: Ciudad solo en lib/cities.ts
- **WHEN** `getCityBySlug` encuentra la ciudad pero `prisma.city.findUnique` retorna null
- **THEN** MUST mostrarse la página sin error 404

### Requirement: Listado de clubs verificados
La página MUST listar clubs con `verified: true` de la ciudad ordenados por nombre.

#### Scenario: Clubs en ciudad
- **WHEN** existen clubs verificados en la ciudad
- **THEN** MUST mostrarse en sección «Clubs en [Ciudad]» con enlace a ficha del club

#### Scenario: Sin clubs
- **WHEN** no hay clubs verificados
- **THEN** MUST mostrarse mensaje de estado vacío

### Requirement: Carreras próximas de la ciudad
La página MUST listar hasta 20 runs `SCHEDULED` futuros de clubs de la ciudad.

#### Scenario: Toggle lista y calendario
- **WHEN** el usuario alterna entre Lista y Calendario
- **THEN** MUST mostrarse tarjetas de carrera o grid semanal del mes actual

### Requirement: Competiciones próximas
La página MUST mostrar hasta 5 `Race` futuras de la ciudad en sección dedicada.

#### Scenario: Sin competiciones
- **WHEN** no hay races futuras
- **THEN** MUST mostrarse mensaje de estado vacío

### Requirement: Sidebar con clima y CTAs
La columna lateral MUST incluir `WeatherWidget` con Suspense, `AdCard` hacia
`/anunciate` y CTA «Añade tu club» hacia `/onboarding/club`.

#### Scenario: Sidebar visible
- **WHEN** se carga la página en viewport grande
- **THEN** MUST mostrarse widget de clima (o mensaje de no disponible) y enlaces de sidebar

### Requirement: FAQ dinámico con JSON-LD
La página MUST incluir acordeón FAQ con preguntas generadas dinámicamente y script
JSON-LD tipo `FAQPage`.

#### Scenario: FAQ en HTML
- **WHEN** se renderiza la página
- **THEN** MUST existir acordeón visible y `<script type="application/ld+json">` FAQPage

### Requirement: Metadatos SEO por ciudad
`generateMetadata` MUST producir title y description específicos por ciudad.

#### Scenario: Title Madrid
- **WHEN** se solicita metadata de `/ciudades/madrid`
- **THEN** el title MUST incluir «Madrid» y «RunClubs.es»
