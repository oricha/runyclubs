# PROMPT: Implementar capability `error-pages`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Tailwind CSS v3.4.19**.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
app/layout.tsx                — layout global para entender el diseño
lib/i18n/es.ts               — para añadir claves error.*
components/ui/button.tsx      — componente Button para los CTAs
app/clubs/[slug]/page.tsx     — ya llama notFound() — ejemplo de uso
app/carreras/[slug]/page.tsx  — ya llama notFound() — ejemplo de uso
```

---

## Estado actual del repo

No existe `app/not-found.tsx` ni `app/error.tsx`. Cuando `notFound()` se llama desde páginas de clubs o carreras, Next.js muestra su página 404 por defecto (sin branding).

---

## Qué DEBES implementar

### 1. `app/not-found.tsx` — Página 404 global

Server Component. Se muestra para cualquier ruta no encontrada.

```typescript
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada | RunClubs.es",
  robots: { index: false, follow: false },
};
```

**Diseño:**

```
<main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
  ├── Número "404" grande (text-8xl, font-serif, text-muted-foreground)
  ├── Título: "Página no encontrada"
  ├── Subtítulo: "El enlace que seguiste puede estar roto o la página ya no existe."
  └── CTAs:
      ├── Botón primario "Ver carreras" → /carreras
      └── Botón secondary "Volver al inicio" → /
```

### 2. `app/error.tsx` — Error global (runtime errors)

**Client Component** (requerido por Next.js App Router para `error.tsx`):

```typescript
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí se reportaría a Sentry cuando se integre
    console.error("Runtime error:", error);
  }, [error]);

  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-serif text-muted-foreground">500</p>
      <h1 className="mt-4 text-2xl font-bold">Algo salió mal</h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
        Inténtalo de nuevo en unos momentos.
      </p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="...">
          Intentar de nuevo
        </button>
        <a href="/" className="...">
          Volver al inicio
        </a>
      </div>
    </main>
  );
}
```

Usa las clases de `Button` si no quieres estilos inline — puedes importar el componente `<Button>` de `@/components/ui/button` para el botón "Volver al inicio" (es un link renderizado como botón), y un botón sin outline para "Intentar de nuevo".

### 3. Páginas 404 contextuales con `not-found.tsx` por segmento

Next.js App Router permite `not-found.tsx` dentro de segmentos para mensajes más específicos.

#### `app/clubs/[slug]/not-found.tsx`

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClubNotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-serif text-muted-foreground">404</p>
      <h1 className="mt-4 text-2xl font-bold">Club no encontrado</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Este club no existe o ha sido dado de baja. Puede que el enlace esté
        desactualizado.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/clubs">Ver todos los clubs</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    </main>
  );
}
```

#### `app/carreras/[slug]/not-found.tsx`

```typescript
// Similar a clubs pero con copy para carreras:
// Título: "Carrera no encontrada"
// Subtítulo: "Esta carrera no existe o ya ha finalizado."
// CTA primario: "Ver carreras" → /carreras
// CTA secundario: "Volver al inicio" → /
```

### 4. Claves i18n en `lib/i18n/es.ts`

```typescript
errors: {
  notFoundTitle: "Página no encontrada",
  notFoundSubtitle: "El enlace que seguiste puede estar roto o la página ya no existe.",
  serverErrorTitle: "Algo salió mal",
  serverErrorSubtitle: "Ocurrió un error inesperado. Nuestro equipo ha sido notificado.",
  clubNotFoundTitle: "Club no encontrado",
  clubNotFoundSubtitle: "Este club no existe o ha sido dado de baja.",
  runNotFoundTitle: "Carrera no encontrada",
  runNotFoundSubtitle: "Esta carrera no existe o ya ha finalizado.",
  tryAgain: "Intentar de nuevo",
  backHome: "Volver al inicio",
  seeAllClubs: "Ver todos los clubs",
  seeAllRuns: "Ver carreras",
},
```

### 5. Verificar llamadas `notFound()` existentes

Lee `app/clubs/[slug]/page.tsx` y `app/carreras/[slug]/page.tsx` para confirmar que ya tienen `notFound()`. Si no lo tienen, añádelo:

```typescript
import { notFound } from "next/navigation";

// En el Server Component, después de la query:
if (!club) notFound();
```

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Integración real con Sentry (solo el comentario en `error.tsx`)
- Página de mantenimiento / modo mantenimiento
- Página de error 403 separada (suficiente con redirect silencioso en admin)
- Tracking de 404s (futura analítica)
- Página personalizada para timeout / error de BD

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| 404 global | `app/not-found.tsx` — Server Component |
| 500 global | `app/error.tsx` — Client Component (required by Next.js) |
| 404 contextual clubs | `app/clubs/[slug]/not-found.tsx` |
| 404 contextual carreras | `app/carreras/[slug]/not-found.tsx` |
| Copy | Específico por contexto (club/carrera/genérico) |
| CTAs 404 global | "Ver carreras" + "Volver al inicio" |
| Sentry | Comentario placeholder en error.tsx |

---

## Verificación

- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `/ruta-que-no-existe` muestra la página 404 personalizada con copy de RunClubs.es
- [ ] `/clubs/slug-inexistente` muestra "Club no encontrado" con CTA a /clubs
- [ ] `/carreras/slug-inexistente` muestra "Carrera no encontrada" con CTA a /carreras
- [ ] La página 404 global tiene `<title>` "Página no encontrada | RunClubs.es"
- [ ] Los CTAs de las páginas 404 enlazan correctamente
- [ ] La página de error (`error.tsx`) tiene botón "Intentar de nuevo" funcional
- [ ] `robots: { index: false }` en metadata de páginas de error
