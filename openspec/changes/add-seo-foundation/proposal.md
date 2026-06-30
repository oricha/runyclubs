## Why

RunClubs.es necesita base SEO consistente: metadata global, sitemap dinámico, robots
y JSON-LD estructurado para indexación.

## What Changes

- `app/layout.tsx` — metadataBase, OG, Twitter, JSON-LD WebSite + Organization.
- `app/robots.ts` y `app/sitemap.ts` — crawlers e índice dinámico.
- Auditoría `generateMetadata` en carreras, blog y ciudades.
- JSON-LD Event alineado en detalle de carrera.

## Capabilities

### New Capabilities

- `seo-foundation`: metadata base, robots, sitemap y JSON-LD global.

### Modified Capabilities

_(ninguna)_

## Impact

- Sitemap consulta Prisma en build/request.
- URLs canónicas unificadas en `https://runclubs.es`.

## Non-goals

- Hreflang, AMP, Person schema, breadcrumb JSON-LD complejo.
