## 1. Dependencias y config

- [x] 1.1 Instalar `next-mdx-remote`, `gray-matter`, `@tailwindcss/typography`
- [x] 1.2 Añadir plugin typography en `tailwind.config.ts`

## 2. Contenido y datos

- [x] 2.1 Crear `types/blog.ts` y `lib/blog.ts`
- [x] 2.2 Crear 2 artículos MDX en `content/blog/`

## 3. UI y páginas

- [x] 3.1 Crear `components/blog/BlogCard.tsx`
- [x] 3.2 Crear `app/blog/page.tsx` y `app/blog/[slug]/page.tsx`
- [x] 3.3 Añadir claves `blog.*` en `lib/i18n/es.ts`

## 4. Verificación

- [x] 4.1 `npx openspec validate add-blog --strict`
- [x] 4.2 `npx tsc --noEmit`
