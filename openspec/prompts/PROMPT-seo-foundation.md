# PROMPT: Implementar capability `seo-foundation`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Prisma 7.8.0** · **Tailwind CSS v3.4.19**.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
app/layout.tsx                — layout global donde se añade metadata base
lib/cities.ts                 — CITY_DETAILS (20 ciudades) para sitemap
lib/prisma.ts                 — singleton Prisma para sitemap dinámico
prisma/schema.prisma          — modelos Club, Run, Race
lib/i18n/es.ts               — textos del sitio para metadata por defecto
app/carreras/[slug]/page.tsx  — ejemplo de generateMetadata existente
app/clubs/[slug]/page.tsx     — ejemplo de generateMetadata existente
content/blog/                 — artículos de blog (si existen, creados por blog agent)
lib/blog.ts                   — getAllBlogPosts() si existe
```

---

## Estado actual del repo

No existe `app/sitemap.ts` ni `app/robots.ts`. El `app/layout.tsx` ya tiene algunos metadatos pero seguramente incompletos.

---

## Qué DEBES implementar

### 1. Metadata base global en `app/layout.tsx`

Comprueba el estado actual del archivo y actualiza el export `metadata`:

```typescript
export const metadata: Metadata = {
  metadataBase: new URL("https://runclubs.es"),
  title: {
    default: "RunClubs.es — Directorio de clubs de running en España",
    template: "%s | RunClubs.es",
  },
  description:
    "Encuentra clubs de running, carreras y eventos deportivos en España. El directorio más completo de running en español.",
  keywords: ["running", "clubs running España", "carreras populares", "correr en grupo"],
  authors: [{ name: "RunClubs.es" }],
  creator: "RunClubs.es",
  publisher: "RunClubs.es",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://runclubs.es",
    siteName: "RunClubs.es",
    title: "RunClubs.es — Directorio de clubs de running en España",
    description:
      "Encuentra clubs de running, carreras y eventos deportivos en España.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RunClubs.es",
    description: "El directorio de clubs de running en España.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: "https://runclubs.es" },
};
```

### 2. `app/robots.ts`

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: "https://runclubs.es/sitemap.xml",
  };
}
```

### 3. `app/sitemap.ts` — sitemap dinámico

```typescript
import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { CITY_DETAILS } from "@/lib/cities";
```

**Debe incluir (PRD §6.17):**

```typescript
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = "https://runclubs.es";
  const now = new Date();

  // Rutas estáticas principales
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/clubs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/carreras`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/competiciones`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/onboarding/club`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // Ciudades
  const cityRoutes: MetadataRoute.Sitemap = CITY_DETAILS.map((city) => ({
    url: `${BASE}/ciudades/${city.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Clubs (verificados)
  const clubs = await prisma.club.findMany({
    where: { verified: true },
    select: { slug: true, createdAt: true },
  });
  const clubRoutes: MetadataRoute.Sitemap = clubs.map((c) => ({
    url: `${BASE}/clubs/${c.slug}`,
    lastModified: c.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Carreras (futuras + recientes pasadas)
  const runs = await prisma.run.findMany({
    where: {
      OR: [
        { startAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      ],
    },
    select: { slug: true, startAt: true },
    orderBy: { startAt: "desc" },
    take: 500,
  });
  const runRoutes: MetadataRoute.Sitemap = runs.map((r) => ({
    url: `${BASE}/carreras/${r.slug}`,
    lastModified: r.startAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Tipos de run (páginas por tipo)
  const RUN_TYPE_SLUGS = ["trail", "road", "track", "night", "social", "speed"];
  const typeRoutes: MetadataRoute.Sitemap = RUN_TYPE_SLUGS.map((t) => ({
    url: `${BASE}/tipos/${t}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // Blog (si lib/blog.ts existe)
  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const { getAllBlogPosts } = await import("@/lib/blog");
    const posts = getAllBlogPosts();
    blogRoutes = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // blog no implementado aún — ok
  }

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...clubRoutes,
    ...runRoutes,
    ...typeRoutes,
    ...blogRoutes,
  ];
}
```

**NOTA sobre tipos de run:** Lee primero `lib/run-types.ts` (si existe) para obtener los slugs reales. Usa el contenido real del archivo en lugar del array hardcodeado arriba si los slugs difieren.

### 4. JSON-LD `WebSite` y `Organization` en layout

Añade en `app/layout.tsx` el JSON-LD global del sitio:

```typescript
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RunClubs.es",
  url: "https://runclubs.es",
  description: "Directorio de clubs de running en España",
  inLanguage: "es-ES",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://runclubs.es/buscar?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
};

// En el JSX del layout, antes de cierre de </body>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
/>
```

### 5. Auditoría de `generateMetadata` existente

Lee los siguientes archivos y verifica/corrige que tengan `generateMetadata` adecuada:

- `app/clubs/[slug]/page.tsx` — MUST tener `title`, `description`, `canonical`, `openGraph`
- `app/carreras/[slug]/page.tsx` — MUST tener title, description, canonical, openGraph con `type: "event"`
- `app/clubs/page.tsx` — MUST tener title estático
- `app/carreras/page.tsx` — MUST tener title estático

Si alguno no tiene `generateMetadata`, añádela. El patrón:

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // ...fetch del recurso...
  return {
    title: `${nombre} | RunClubs.es`,
    description: `...`,
    alternates: { canonical: `/ruta/${slug}` },
    openGraph: { title: `...`, description: `...`, url: `...` },
  };
}
```

### 6. JSON-LD `Event` en detalle de carrera

Si `app/carreras/[slug]/page.tsx` no tiene JSON-LD `Event`, añádelo:

```typescript
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: run.title,
  startDate: run.startAt.toISOString(),
  location: {
    "@type": "Place",
    name: run.location,
    address: { "@type": "PostalAddress", addressCountry: "ES" },
  },
  organizer: {
    "@type": "Organization",
    name: run.club.name,
    url: `https://runclubs.es/clubs/${run.club.slug}`,
  },
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
};
```

### 7. Verificar `app/clubs/[slug]/page.tsx` — JSON-LD `SportsOrganization`

Si no tiene JSON-LD `SportsOrganization`, añádelo:

```typescript
const clubJsonLd = {
  "@context": "https://schema.org",
  "@type": "SportsOrganization",
  name: club.name,
  sport: "Running",
  url: `https://runclubs.es/clubs/${club.slug}`,
  address: { "@type": "PostalAddress", addressLocality: club.city.name, addressCountry: "ES" },
};
```

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Schema.org para `Person` (usuarios)
- Hreflang (solo ES en MVP)
- AMP pages
- Open Search descriptor
- Tracking de clicks en sitemap
- Breadcrumb JSON-LD complejo (solo si es natural añadirlo)

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| Sitemap | `app/sitemap.ts` (Next.js nativo, sin librería) |
| Robots | `app/robots.ts` (bloquear /admin y /api/) |
| JSON-LD global | WebSite en layout |
| JSON-LD por página | Event, SportsOrganization, Article, FAQPage en páginas específicas |
| Metadata base | `metadataBase: new URL("https://runclubs.es")` |
| Blog en sitemap | Import dinámico con try/catch por si blog no existe aún |

---

## Verificación

- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `/robots.txt` accesible y contiene `Disallow: /admin`
- [ ] `/sitemap.xml` accesible y lista al menos ciudades, clubs y carreras
- [ ] `<title>` de la home es "RunClubs.es — Directorio de clubs de running en España"
- [ ] `<title>` de `/clubs/[slug]` sigue el patrón `%s | RunClubs.es`
- [ ] JSON-LD `WebSite` presente en el HTML del layout
- [ ] JSON-LD `Event` presente en detalle de carrera
- [ ] JSON-LD `SportsOrganization` presente en detalle de club
- [ ] OG tags (`og:title`, `og:description`, `og:type`) en páginas clave
- [ ] `<link rel="canonical">` en páginas de detalle
