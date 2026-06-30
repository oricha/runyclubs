## Why

RunClubs.es necesita contenido editorial para SEO y educación de runners, sin depender
de un CMS externo.

## What Changes

- `content/blog/*.mdx` — artículos versionados en el repo.
- `lib/blog.ts` — lectura con gray-matter.
- `app/blog/` — listado y detalle con `next-mdx-remote/rsc`.
- `@tailwindcss/typography` para prose MDX.

## Capabilities

### New Capabilities

- `blog`: blog MDX estático en `/blog` y `/blog/[slug]`.

### Modified Capabilities

_(ninguna)_

## Impact

- Dependencias: `next-mdx-remote`, `gray-matter`, `@tailwindcss/typography`.
- Páginas estáticas generadas en build.

## Non-goals

- Comentarios, CMS, paginación, búsqueda, artículos relacionados, editor visual.
