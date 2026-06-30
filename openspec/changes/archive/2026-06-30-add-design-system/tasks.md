## 1. Scaffold del proyecto

- [x] 1.1 Crear app Next.js (App Router) + TypeScript.
- [x] 1.2 Instalar y configurar Tailwind CSS + `tailwindcss-animate`.
- [x] 1.3 Instalar `lucide-react` y dependencias de shadcn/ui.

## 2. Tokens y tipografías

- [x] 2.1 Definir tokens HSL en `app/globals.css` (`@layer base :root`).
- [x] 2.2 Mapear tokens en `tailwind.config.ts` (colors, borderRadius, fontFamily, keyframes/animation).
- [x] 2.3 Configurar fuentes en `app/fonts.ts` (Inter + Instrument Serif).
- [x] 2.4 Aplicar variables de fuente en `<html>` de `app/layout.tsx` (`lang="es"`).

## 3. Primitivas UI (shadcn/ui)

- [x] 3.1 Añadir Button, Card, Dialog, Accordion.
- [x] 3.2 Añadir Input, Badge, Avatar, Toggle.
- [x] 3.3 Verificar accesibilidad básica (focus ring con `--ring`).

## 4. Layout y componentes comunes

- [x] 4.1 `components/layout/Header.tsx` (pill flotante con nav + iconos calendario/búsqueda/cuenta).
- [x] 4.2 `components/layout/Footer.tsx` (newsletter + columnas DESCUBRIR/TIPOS/CIUDADES/EMPRESA/SÍGUENOS).
- [x] 4.3 `components/layout/FeedbackWidget.tsx` (botón flotante de sugerencias).
- [x] 4.4 `components/common/Container.tsx`, `SectionLabel.tsx`, `ViewToggle.tsx`.
- [x] 4.5 `components/marketing/NewsletterForm.tsx` (solo UI; endpoint en `add-newsletter`).

## 5. i18n y taxonomías

- [x] 5.1 `lib/i18n/es.ts` con el diccionario completo (nav, home, filtros, fichas, footer, common).
- [x] 5.2 `lib/run-types.ts` (RUN_TYPES con emoji + label).
- [x] 5.3 `lib/cities.ts` (CITIES, 20 ciudades).

## 6. Verificación

- [x] 6.1 Página de demostración que renderice Header + Footer + primitivas.
- [x] 6.2 Comprobar tipografías, tokens y modo responsive.
- [x] 6.3 `openspec validate add-design-system --strict` en verde.
