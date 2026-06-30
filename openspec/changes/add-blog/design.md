## Contexto

Blog file-based con MDX en `content/blog/`. Render con `next-mdx-remote/rsc` en App
Router. Sin base de datos.

## Decisiones

| Decisión | Elección |
|---|---|
| Contenido | MDX + frontmatter gray-matter |
| Render | `MDXRemote` RSC |
| Estilos | `@tailwindcss/typography` prose |
| Build | `generateStaticParams` por slug |
| Portadas | `coverImage: null` en MVP |

## Frontmatter

title, description, date, author, tags, coverImage.
