# run-detail Specification

## Purpose
TBD - created by archiving change add-run-detail. Update Purpose after archive.
## Requirements
### Requirement: Consulta de carrera por slug
El sistema MUST exponer `getRunBySlug(slug)` en `lib/runs.ts` que devuelve
`RunDetail | null` mapeado desde Prisma.

#### Scenario: Carrera programada futura encontrada
- **WHEN** se invoca `getRunBySlug` con un slug válido de carrera `SCHEDULED` futura
- **THEN** MUST devolver un objeto `RunDetail` con descripción, club completo,
  asistentes y metadatos de inscripción

#### Scenario: Carrera inexistente o pasada
- **WHEN** el slug no existe, la carrera no está `SCHEDULED` o `startAt` es pasado
- **THEN** MUST devolver `null`

### Requirement: Página /carreras/[slug] con notFound
La página MUST ser un Server Component que llama `getRunBySlug` y usa `notFound()`
si el resultado es `null`.

#### Scenario: Slug inventado
- **WHEN** el usuario visita `/carreras/slug-inexistente`
- **THEN** Next.js MUST renderizar la respuesta 404 estándar sin error 500

### Requirement: Inscripción externa funcional
Cuando `signupType === "external"` y existe `externalSignupUrl`, la ficha MUST
mostrar botón primario funcional que abre la URL en pestaña nueva.

#### Scenario: Botón de inscripción externa
- **WHEN** la carrera tiene `signupType: "external"` y `externalSignupUrl` definida
- **THEN** MUST mostrarse "Inscribirse externamente" con nota explicativa y al pulsar
  MUST abrirse `externalSignupUrl` en `_blank` con `rel="noopener noreferrer"`

### Requirement: Inscripción interna presentacional
Cuando `signupType === "internal"`, la ficha MUST mostrar botón "Apuntarse" sin
acción real de backend (no hay auth todavía).

#### Scenario: Botón join sin sesión
- **WHEN** la carrera tiene `signupType: "internal"`
- **THEN** MUST mostrarse el botón `JoinRunButton` visible pero MUST NOT invocar
  ningún endpoint de inscripción

### Requirement: Organizador y metadatos
La ficha MUST mostrar sección "ORGANIZADO POR" con club y, si existe,
`organizerName` con `organizerRole`. MUST mostrar metadatos FECHA/HORA/UBICACIÓN/
DISTANCIA/RITMO con `notKnownYet` cuando falte un dato.

#### Scenario: Organizador individual
- **WHEN** la carrera tiene `organizerName` y `organizerRole`
- **THEN** MUST mostrarse junto al club en la sección de organizador

### Requirement: Recomendaciones cruzadas
Al final de la ficha MUST aparecer "Más carreras en {city}" (máx. 3, misma ciudad,
futuras, excluye actual) y "Carreras cerca de esta fecha" (±3 días, cualquier
ciudad, máx. 3, excluye actual).

#### Scenario: Más carreras en la ciudad
- **WHEN** existen otras carreras futuras en la misma ciudad
- **THEN** MUST listarse hasta 3 sin incluir la carrera actual

#### Scenario: Carreras cerca de la fecha
- **WHEN** existen carreras en ±3 días de `startAt`
- **THEN** `getRunsAroundDate` MUST devolver hasta 3 resultados excluyendo la actual

### Requirement: JSON-LD Event
La página MUST incluir un `<script type="application/ld+json">` con schema.org
`Event` para la carrera.

#### Scenario: Metadatos estructurados
- **WHEN** se renderiza una ficha válida
- **THEN** el HTML MUST contener JSON-LD `Event` con nombre, fecha de inicio y ubicación

### Requirement: Compartir carrera
El botón compartir MUST usar Web Share API con fallback a copiar URL al portapapeles.

#### Scenario: Compartir en navegador compatible
- **WHEN** el usuario pulsa "Compartir carrera" y `navigator.share` está disponible
- **THEN** MUST invocarse la Web Share API con la URL canónica de la ficha

