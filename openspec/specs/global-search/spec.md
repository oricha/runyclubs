# global-search Specification

## Purpose
TBD - created by archiving change add-global-search. Update Purpose after archive.
## Requirements
### Requirement: Apertura del modal de búsqueda global
El sistema MUST permitir abrir el modal de búsqueda global desde cualquier página
mediante el atajo ⌘K/Ctrl+K o el icono de lupa del header (implementado en
`design-system`).

#### Scenario: Atajo de teclado
- **WHEN** el usuario pulsa ⌘K (macOS) o Ctrl+K (Windows/Linux) en cualquier página
- **THEN** el modal de búsqueda MUST abrirse con el campo de texto enfocado

#### Scenario: Icono de lupa
- **WHEN** el usuario hace clic en el icono de búsqueda del header
- **THEN** el modal de búsqueda MUST abrirse

### Requirement: Búsqueda en vivo con debounce
Al escribir en el modal, el sistema MUST buscar con un debounce de ~200 ms y MUST
evitar que respuestas obsoletas sobrescriban resultados más recientes.

#### Scenario: Debounce al escribir
- **WHEN** el usuario escribe un término de al menos 2 caracteres
- **THEN** el sistema MUST esperar ~200 ms tras la última pulsación antes de
  consultar `GET /api/search?q=...`

#### Scenario: Consulta demasiado corta
- **WHEN** la consulta tiene menos de 2 caracteres o está vacía
- **THEN** el sistema MUST mostrar el estado inicial sin resultados y MUST NOT
  realizar peticiones a la base de datos

#### Scenario: Cancelación de peticiones obsoletas
- **WHEN** el usuario modifica la consulta antes de que responda una petición anterior
- **THEN** el sistema MUST descartar la respuesta obsoleta y MUST NOT mostrar
  resultados de la búsqueda anterior

### Requirement: Endpoint GET /api/search
El endpoint `GET /api/search?q=` MUST devolver resultados mixtos de carreras y clubs
etiquetados por tipo.

#### Scenario: Consulta vacía
- **WHEN** se realiza `GET /api/search` sin `q` o con `q` vacío
- **THEN** MUST responder `200` con `{ items: [] }` sin consultar la base de datos

#### Scenario: Resultados mixtos
- **WHEN** se realiza `GET /api/search?q=retiro` con coincidencias en carreras y clubs
- **THEN** MUST responder `200` con `{ items: SearchResultItem[] }` donde cada item
  incluye `kind` (`"carrera"` o `"club"`), `title`, `href` y opcionalmente `subtitle`

#### Scenario: Solo carreras futuras programadas
- **WHEN** la búsqueda incluye carreras
- **THEN** MUST devolver únicamente carreras con `status = SCHEDULED` y `startAt >= now`
  (delegado en `getRuns`)

#### Scenario: Límite de resultados
- **WHEN** existen muchas coincidencias
- **THEN** MUST devolver como máximo 5 carreras y 5 clubs (10 items totales)

### Requirement: Presentación de resultados en el modal
El modal MUST mostrar resultados con tipo etiquetado en mayúsculas, título y
subtítulo opcional, y MUST manejar estados vacío, cargando y sin coincidencias.

#### Scenario: Estado cargando
- **WHEN** hay una búsqueda en curso (consulta ≥ 2 caracteres)
- **THEN** el modal MUST mostrar indicador de carga

#### Scenario: Sin coincidencias
- **WHEN** la búsqueda completa no devuelve items
- **THEN** el modal MUST mostrar un mensaje de «sin resultados»

#### Scenario: Etiqueta de tipo
- **WHEN** se muestran resultados
- **THEN** cada fila MUST mostrar el `kind` en mayúsculas (`CARRERA` o `CLUB`),
  el `title` y el `subtitle` si existe

### Requirement: Navegación al seleccionar un resultado
Al hacer clic en un resultado, el sistema MUST navegar a la ficha correspondiente
y MUST cerrar el modal.

#### Scenario: Clic en carrera
- **WHEN** el usuario hace clic en un resultado con `kind: "carrera"`
- **THEN** MUST navegar a `/carreras/[slug]` y MUST cerrar el modal

#### Scenario: Clic en club
- **WHEN** el usuario hace clic en un resultado con `kind: "club"`
- **THEN** MUST navegar a `/clubs/[slug]` y MUST cerrar el modal

