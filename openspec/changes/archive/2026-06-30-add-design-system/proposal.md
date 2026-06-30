## Why

RunClubs.es necesita una base visual y de layout coherente antes de construir
cualquier página. Los documentos fuente definen una identidad concreta (blanco
hueso, Instrument Serif + Inter, botones pill oscuros, acento rojo) y un árbol de
componentes. Centralizar tokens, fuentes, primitivas y layout evita divergencias
y desbloquea el resto de capabilities (todas dependen de este sistema).

Fase 1 (Base) del ROADMAP. Fuentes: doc 1 §3, doc 2 §2-3, §8-9.

## What Changes

- Scaffold del proyecto Next.js (App Router) + TypeScript + Tailwind + tailwindcss-animate.
- Tokens de diseño en `app/globals.css` (HSL) y mapeo en `tailwind.config.ts`.
- Carga de fuentes Instrument Serif + Inter con `next/font` (`app/fonts.ts`).
- Primitivas `components/ui/` (shadcn/ui): Button, Card, Dialog, Accordion, Input,
  Badge, Avatar, Toggle.
- Layout raíz (`app/layout.tsx`) con `lang="es"`.
- Componentes de layout: `Header` (pill flotante), `Footer`, `FeedbackWidget`,
  `Container`, `SectionLabel`, `ViewToggle`.
- Diccionario i18n `lib/i18n/es.ts`, taxonomía `lib/run-types.ts`, `lib/cities.ts`.

## Capabilities

### New Capabilities
- `design-system`: tokens de diseño, tipografías, primitivas UI, layout (header pill,
  footer, feedback widget) y diccionario i18n en español que sirven de base a toda la app.

## Impact

- Crea la estructura inicial del repositorio (`app/`, `components/`, `lib/`).
- Define dependencias: `tailwindcss`, `tailwindcss-animate`, `lucide-react`, shadcn/ui.
- Ninguna ruta de datos todavía; sin dependencia de base de datos.
- Es prerequisito de prácticamente todos los demás changes.

## Non-goals

- No incluye modelo de datos ni Prisma (ver `add-data-model`).
- No incluye páginas con contenido real (carreras, clubs); solo layout y primitivas.
