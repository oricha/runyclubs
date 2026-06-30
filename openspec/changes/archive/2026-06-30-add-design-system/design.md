## Context

Primer change del proyecto: aún no hay código. La identidad visual y el árbol de
componentes están especificados en el doc 2 (§2 tokens, §3 fuentes, §8 árbol de
componentes, §9 código de componentes clave). Este diseño fija la estructura de
carpetas y las convenciones que el resto de capabilities reutilizarán.

## Goals / Non-Goals

**Goals:**
- Establecer tokens de color/tipografía como variables CSS y exponerlos vía Tailwind.
- Cargar las dos familias tipográficas con `next/font` sin CLS.
- Proveer primitivas accesibles (shadcn/ui) reutilizables.
- Header pill flotante, footer con columnas y newsletter, y feedback widget.
- Centralizar todos los textos de UI en `lib/i18n/es.ts`.

**Non-Goals:**
- Lógica de datos, fetching o estado de servidor.
- Páginas con contenido (se abordan en sus propios changes).

## Decisions

- **Tokens en HSL** (`--background`, `--foreground`, `--primary`, `--secondary`,
  `--muted`, `--accent`, `--border`, `--card`, `--brand-accent`, `--radius`) en
  `:root` dentro de `@layer base`, mapeados en `tailwind.config.ts` con `hsl(var(--…))`.
- **Fuentes:** `Inter` (variable `--font-inter`) e `Instrument_Serif` (peso 400,
  normal+italic, variable `--font-instrument-serif`), aplicadas en `<html>`.
  Serif para titulares (cursiva parcial con `<em>`), Inter para cuerpo/etiquetas.
- **Convención de clases:** titular `font-serif text-5xl md:text-6xl`; etiqueta de
  sección `text-[11px] font-medium uppercase tracking-wider text-muted-foreground`;
  botón pill `rounded-full bg-primary px-6 py-3 text-primary-foreground`.
- **Header** `fixed top-4` centrado, `pointer-events-none` en contenedor y
  `pointer-events-auto` en la nav; fondo translúcido + `backdrop-blur`.
- **Estructura de carpetas:** `app/`, `components/{layout,ui,cards,search,filters,
  club,run,marketing,common}/`, `lib/`. Se crean ahora solo `layout`, `ui`, `common`
  y `marketing/NewsletterForm` (resto lo añaden sus changes).
- **i18n:** objeto plano `as const` en `lib/i18n/es.ts`; sin librería externa de
  momento (interpolación simple con `.replace("{count}", …)`).

## Risks / Trade-offs

- shadcn/ui añade ficheros de primitivas que hay que mantener; se acota a las 8
  primitivas necesarias para el MVP.
- i18n como objeto plano es simple pero no soporta plurales/ICU; aceptable para el
  alcance actual, migrable a next-intl si se internacionaliza.
- Vídeo del hero y multimedia deben ser activos propios (nota legal doc 1 §10).
