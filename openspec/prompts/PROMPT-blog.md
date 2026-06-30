# PROMPT: Implementar capability `blog`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Tailwind CSS v3.4.19**.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
package.json                  — dependencias instaladas
app/layout.tsx                — layout global
lib/i18n/es.ts               — para añadir claves blog.*
```

---

## Estado actual del repo

No existe `app/blog/` ni ningún sistema de blog. No hay dependencias de MDX instaladas.

---

## Enfoque: MDX con archivos locales

El blog usa **MDX** (Markdown + JSX) con archivos en `content/blog/`. Sin CMS externo, sin BD. Los artículos son archivos `.mdx` versionados en el repo.

### Dependencias a instalar

```bash
npm install @next/mdx @mdx-js/react @mdx-js/loader next-mdx-remote gray-matter
```

**Alternativa más simple (recomendada):** usa `next-mdx-remote/rsc` que no requiere configurar webpack y funciona directamente en App Router:

```bash
npm install next-mdx-remote gray-matter
```

Usa `next-mdx-remote/rsc` (no el cliente). Es el patrón oficial de Next.js App Router para MDX.

---

## Qué DEBES implementar

### 1. Estructura de archivos de contenido

Crea el directorio `content/blog/` con al menos **2 artículos de demo** en formato MDX:

**`content/blog/como-encontrar-tu-club-de-running.mdx`**
```mdx
---
title: "Cómo encontrar tu club de running en España"
description: "Guía práctica para runners de todos los niveles que buscan grupo con quien entrenar."
date: "2026-06-01"
author: "Equipo RunClubs.es"
tags: ["guía", "principiantes", "clubs"]
coverImage: null
---

# Cómo encontrar tu club de running en España

Correr en grupo tiene muchas ventajas...

[Contenido de ejemplo — 400-600 palabras sobre cómo elegir club de running]
```

**`content/blog/running-en-madrid-guia-completa.mdx`**
```mdx
---
title: "Running en Madrid: guía completa 2026"
description: "Todo lo que necesitas saber para correr en Madrid: rutas, clubs, clima y competiciones."
date: "2026-05-15"
author: "Equipo RunClubs.es"
tags: ["madrid", "guía", "ciudad"]
coverImage: null
---

[Contenido de ejemplo sobre running en Madrid]
```

### 2. Tipo `BlogPost` en `types/blog.ts`

```typescript
export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;       // "2026-06-01" ISO
  author: string;
  tags: string[];
  coverImage: string | null;
}

export interface BlogPost extends BlogPostMeta {
  content: string;   // MDX raw content
}
```

### 3. `lib/blog.ts` — funciones de datos

```typescript
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export function getAllBlogPosts(): BlogPostMeta[] {
  // Lee todos los .mdx de content/blog/
  // Parsea frontmatter con gray-matter
  // Ordena por date desc
  // Retorna array de BlogPostMeta
}

export function getBlogPost(slug: string): BlogPost | null {
  // Lee content/blog/[slug].mdx
  // Parsea frontmatter + content
  // Retorna null si no existe
}
```

### 4. Página de listado `app/blog/page.tsx`

Server Component:

```
/blog
├── Hero: "Blog de running" + subtítulo
├── Grid de artículos (2 cols en sm, 3 cols en lg)
│   └── BlogCard por cada artículo
└── (sin paginación en MVP — todos los artículos)
```

**`components/blog/BlogCard.tsx`:**
- Título del artículo (h2, `line-clamp-2`)
- Descripción (p, `line-clamp-3`, `text-muted-foreground`)
- Fecha formateada: `"1 jun 2026"` (Intl.DateTimeFormat es-ES)
- Autor
- Tags como chips pequeños (máx. 3)
- Link a `/blog/[slug]`
- Estilo: `border border-border rounded-xl p-6 hover:shadow-sm transition-shadow`

### 5. Página de detalle `app/blog/[slug]/page.tsx`

**IMPORTANTE — Next.js 16 params es Promise:**
```typescript
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  // ...
}
```

**Renderizado MDX:**
```typescript
import { MDXRemote } from "next-mdx-remote/rsc";

// En el JSX:
<MDXRemote source={post.content} />
```

**Layout del artículo:**
```
article.max-w-2xl.mx-auto
├── Breadcrumb: Blog → [título]
├── Cabecera del artículo
│   ├── Tags chips
│   ├── h1: título
│   ├── Descripción (lead text)
│   └── Metadatos: autor · fecha
├── Contenido MDX renderizado
│   └── Prose styles (ver abajo)
└── CTA final: "Explora clubs en RunClubs.es" → /clubs
```

**Prose styles para MDX:** el contenido MDX necesita estilos tipográficos. Instala `@tailwindcss/typography` si no existe, o aplica clases manualmente:
```typescript
<div className="prose prose-neutral dark:prose-invert max-w-none">
  <MDXRemote source={post.content} />
</div>
```

Comprueba en `package.json` si `@tailwindcss/typography` ya está instalado antes de instalar. Si no, instala:
```bash
npm install @tailwindcss/typography
```
Y añade al `tailwind.config.ts`:
```typescript
plugins: [require("@tailwindcss/typography")],
```

### 6. `generateStaticParams` y `generateMetadata`

```typescript
export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Blog RunClubs.es`,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}
```

### 7. JSON-LD `Article`

Añade en la página de detalle:
```typescript
const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  author: { "@type": "Organization", name: post.author },
  datePublished: post.date,
  publisher: {
    "@type": "Organization",
    name: "RunClubs.es",
    url: "https://runclubs.es",
  },
};
```

### 8. Claves i18n en `lib/i18n/es.ts`

```typescript
blog: {
  title: "Blog de running",
  subtitle: "Guías, consejos y noticias para runners en España.",
  readMore: "Leer más",
  backToBlog: "Volver al blog",
  by: "Por",
  publishedOn: "Publicado el",
  exploreCta: "Explora clubs en RunClubs.es",
  noPosts: "No hay artículos publicados todavía.",
},
```

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Sistema de comentarios
- CMS externo (Contentful, Sanity, etc.)
- Paginación (en MVP todos los artículos en una página)
- Newsletter desde el blog (ya existe en el footer global)
- Búsqueda de artículos
- Artículos relacionados (puede añadirse después)
- Editor visual para redactores (los artículos son MDX en el repo)

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| CMS | Sin CMS — archivos MDX en `content/blog/` |
| Librería MDX | `next-mdx-remote/rsc` (App Router nativo) |
| Prose styles | `@tailwindcss/typography` |
| Paginación | Sin paginación en MVP |
| Generación | Static (`generateStaticParams`) |
| Imágenes de portada | `null` en MVP (solo texto) |

---

## Verificación

- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `/blog` lista los artículos sin errores
- [ ] `/blog/como-encontrar-tu-club-de-running` renderiza el artículo
- [ ] `/blog/slug-inexistente` → 404
- [ ] Título y descripción `<meta>` correctos en el artículo
- [ ] JSON-LD `Article` presente en el HTML
- [ ] OpenGraph tags (`og:title`, `og:description`, `og:type: article`)
- [ ] Prose styles aplicados al contenido MDX (h2, p, ul con estilos)
- [ ] CTA "Explora clubs" al final del artículo
