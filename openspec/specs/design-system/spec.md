# design-system Specification

## Purpose
TBD - created by archiving change add-design-system. Update Purpose after archive.
## Requirements
### Requirement: Tokens de diseño y tema
El sistema MUST exponer la identidad visual de RunClubs.es como variables CSS en
HSL y mapearlas en Tailwind, de modo que todos los componentes consuman los mismos
tokens de color, radio y tipografía.

#### Scenario: Tokens disponibles en Tailwind
- **WHEN** un componente usa clases como `bg-background`, `text-foreground`, `bg-primary` o `text-brand`
- **THEN** se renderiza con los valores definidos en `:root` (#FBFAF9, #1C1A17, #1C1A17, #3B1414 respectivamente)

#### Scenario: Radio de esquinas coherente
- **WHEN** un componente usa `rounded-lg`/`rounded-md`/`rounded-sm`
- **THEN** el radio se deriva de `--radius` (0.5rem) según el mapeo de `tailwind.config.ts`

### Requirement: Tipografías editoriales
El sistema MUST cargar Instrument Serif (titulares) e Inter (cuerpo/UI) con
`next/font` sin provocar layout shift, y permitir cursiva parcial en titulares.

#### Scenario: Titular con cursiva parcial
- **WHEN** se renderiza un titular con una palabra envuelta en `<em className="italic">`
- **THEN** el titular usa `font-serif` y la palabra resaltada aparece en cursiva

#### Scenario: Etiqueta de sección
- **WHEN** se renderiza una `SectionLabel`
- **THEN** el texto se muestra en MAYÚSCULAS, 11px, peso 500 y `tracking` ancho en color `muted-foreground`

### Requirement: Primitivas de interfaz accesibles
El sistema MUST proporcionar primitivas reutilizables (Button, Card, Dialog,
Accordion, Input, Badge, Avatar, Toggle) con foco visible.

#### Scenario: Foco visible por teclado
- **WHEN** el usuario tabula hasta una primitiva interactiva
- **THEN** se muestra un anillo de foco derivado del token `--ring`

### Requirement: Layout global con header pill y footer
El sistema MUST renderizar un header tipo pill flotante y un footer con newsletter y
columnas de navegación en todas las páginas, con idioma `es`.

#### Scenario: Header flotante presente
- **WHEN** el usuario carga cualquier página
- **THEN** se muestra el header pill con logo "RUNCLUBS®", enlaces "Descubrir carreras" y "Clubs", e iconos de calendario, búsqueda y cuenta

#### Scenario: Footer con secciones
- **WHEN** el usuario llega al pie de cualquier página
- **THEN** ve el bloque de newsletter y las columnas DESCUBRIR, TIPOS DE CARRERA, CIUDADES, EMPRESA y SÍGUENOS

### Requirement: Textos de interfaz centralizados en español
El sistema MUST servir todos los textos de UI desde un diccionario i18n en español
(`lib/i18n/es.ts`) para garantizar consistencia y facilitar cambios.

#### Scenario: Texto desde el diccionario
- **WHEN** un componente necesita una etiqueta de navegación o de sección
- **THEN** la obtiene del objeto `es` y no de cadenas embebidas en el componente

