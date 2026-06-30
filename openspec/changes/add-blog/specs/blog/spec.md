## ADDED Requirements

### Requirement: Contenido MDX en content/blog
El proyecto MUST almacenar artículos como archivos `.mdx` en `content/blog/` con
frontmatter parseable (title, description, date, author, tags, coverImage).

#### Scenario: Artículos de demo
- **WHEN** se despliega el proyecto con la capability blog
- **THEN** MUST existir al menos dos archivos `.mdx` en `content/blog/`

### Requirement: API de lectura de blog
`lib/blog.ts` MUST exponer `getAllBlogPosts()` ordenado por fecha descendente y
`getBlogPost(slug)` que retorna `null` si no existe.

#### Scenario: Slug inexistente
- **WHEN** se llama `getBlogPost` con un slug sin archivo
- **THEN** MUST retornar `null`

### Requirement: Listado /blog
La ruta `/blog` MUST mostrar un grid de artículos con título, descripción, fecha, autor
y tags (máximo 3 visibles).

#### Scenario: Listado con artículos
- **WHEN** existen archivos MDX en `content/blog/`
- **THEN** `/blog` MUST listar todos los artículos sin paginación

#### Scenario: Sin artículos
- **WHEN** no hay archículos
- **THEN** MUST mostrarse mensaje de estado vacío

### Requirement: Detalle /blog/[slug]
La ruta `/blog/[slug]` MUST renderizar el contenido MDX con estilos prose, metadata SEO,
OpenGraph article y JSON-LD `Article`.

#### Scenario: Artículo válido
- **WHEN** se visita `/blog/[slug]` de un artículo existente
- **THEN** MUST renderizarse el MDX y MUST incluir script JSON-LD Article

#### Scenario: Slug inválido
- **WHEN** se visita un slug sin archivo
- **THEN** MUST responder 404

### Requirement: Generación estática
Las páginas de blog MUST usar `generateStaticParams` desde los slugs de
`getAllBlogPosts()`.

#### Scenario: Build estático
- **WHEN** se ejecuta el build de Next.js
- **THEN** MUST pregenerarse rutas para cada slug de artículo

### Requirement: CTA al final del artículo
Cada artículo MUST incluir un CTA hacia `/clubs` al final del contenido.

#### Scenario: CTA visible
- **WHEN** se renderiza un artículo completo
- **THEN** MUST mostrarse enlace «Explora clubs en RunClubs.es»
