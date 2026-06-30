## Contexto

SEO técnico PRD §6.17. Next.js Metadata API + sitemap/robots nativos.

## Decisiones

| Decisión | Elección |
|---|---|
| Dominio | `https://runclubs.es` (`metadataBase`) |
| Title template | `%s \| RunClubs.es` |
| Sitemap | Estático + Prisma (clubs, runs) + ciudades + blog |
| Tipos run | Slugs de `RUN_TYPES` en `/tipos/[id]` |
| Robots disallow | `/admin`, `/api/` |

## Pendiente

`app/clubs/[slug]/page.tsx` no existe aún — JSON-LD `SportsOrganization` se añadirá
con la capability `club-detail`.
