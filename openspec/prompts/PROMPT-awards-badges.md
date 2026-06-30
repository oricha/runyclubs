# Prompt de implementación — Capability `awards-badges` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `awards-badges` del proyecto RunClubs.es siguiendo
> **Spec-Driven Development con OpenSpec**. Léelo entero antes de escribir código.
>
> **Aviso:** este repo tiene varios changes avanzando en paralelo. Las rutas y
> firmas citadas aquí son una **foto fija** tomada justo antes de escribir este
> prompt — antes de dar nada por sentado, vuelve a comprobar con `ls`/`cat` el
> estado real de los ficheros mencionados.

---

## 1. Rol

Eres un **ingeniero full-stack senior** (Next.js App Router + Prisma + PostgreSQL +
TypeScript) que trabaja siguiendo metodología **Spec-Driven Development** con el
framework **OpenSpec**. Escribes código y documentación en **español**. No tomas
atajos: completas en orden el ciclo de vida de OpenSpec (proposal → specs →
design → tasks → implementación → validación → archivado).

---

## 2. Contexto del proyecto y estado actual del repo

**RunClubs.es** es un directorio de clubs de running y carreras grupales en
las 20 ciudades más importantes de España.

Esta capability es **pequeña y presentacional**: no crea páginas ni endpoints.
Su trabajo es definir el catálogo canónico de insignias, crear los componentes
de render con tooltip, e integrarse en las superficies que ya existan. Lee el
estado real del repo antes de asumir qué existe.

### Stack exacto (verifica con `cat package.json`)

- **Next.js 16.2.9** App Router, **React 19.2.7**, **TypeScript 5.9.3**
- **Tailwind CSS v3.4.19** (NO v4). Tokens `hsl(var(--…))`.
- **shadcn/ui** (Radix primitives) + `lucide-react`.
- `components/ui/badge.tsx` ya existe con variantes `default`, `secondary`,
  `outline`, `destructive`.
- **`@radix-ui/react-tooltip` NO está instalado** en el momento de escribir
  este prompt. Verifica con `cat package.json | grep tooltip`.

### Qué ya existe — léelo antes de escribir código

| Fichero | Relevancia |
|---|---|
| `prisma/schema.prisma` | `model ClubAward { id, clubId, key, label, icon, awardedAt }` |
| `prisma/seed.ts` | Awards sembrados: `founders` 🏆 y `top-club` 🥇 (ver §3) |
| `types/index.ts` | `ClubSummary.awards: { key: string; icon: string; label: string }[]` ya definido |
| `lib/i18n/es.ts` | `es.common.showAwards = "Ver premios del club"` ya existe |
| `components/ui/badge.tsx` | Primitiva `<Badge>` disponible |
| `components/cards/TypeChip.tsx` | Patrón de chip pequeño — referencia de estilo |
| `components/cards/RunCard.tsx` | Patrón de card con chips — referencia de composición |

### Estado de las capabilities dependientes — COMPRUEBA ANTES DE INTEGRAR

```bash
ls app/clubs/           # ¿existe clubs-directory?
ls app/clubs/\[slug\]/  # ¿existe club-detail?
find components/club -name "ClubCard*" 2>/dev/null  # ¿ya hay ClubCard?
```

Actúa según lo que encuentres (ver §5).

---

## 3. El catálogo de insignias

### 3.1 Lo que hay en la BD

El seed ya creó `ClubAward` con dos claves distintas:

| `key` | `icon` | `label` |
|---|---|---|
| `founders` | 🏆 | Fundadores |
| `top-club` | 🥇 | Top club |

### 3.2 Clave canónica que falta: `verified`

El schema tiene `Club.verified: Boolean` pero **no existe** un `ClubAward` con
`key = "verified"` en el seed. Tienes dos opciones para mostrar el estado
"Verificado" en las tarjetas:

**Opción A (recomendada):** Derivar el badge "Verificado" directamente de
`club.verified`. Requiere añadir `verified?: boolean` a `ClubSummary` en
`types/index.ts` y actualizar los mapeos en `lib/clubs.ts` y `lib/runs.ts`
(donde existe `mapClubToSummaryForRun`).

**Opción B:** Tratar "Verificado" como un `ClubAward` más (creado por
`admin-panel` al verificar). No requiere cambiar tipos, pero el seed no tiene
estos registros — habría que añadirlos.

**Decide y documenta en `design.md`.** Ambas opciones son válidas; la A es
más coherente con el schema (el campo `verified` ya expresa esa semántica),
la B es más uniforme con el patrón `ClubAward`.

### 3.3 Catálogo canónico en `lib/awards.ts`

Crea este fichero como la única fuente de verdad para las definiciones:

```ts
// lib/awards.ts
export interface AwardDefinition {
  key: string;
  icon: string;
  label: string;
  description: string;   // para tooltip extendido, opcional en UI
}

export const AWARD_CATALOG: AwardDefinition[] = [
  {
    key: "founders",
    icon: "🏆",
    label: "Fundadores",
    description: "Club fundador de la comunidad RunClubs.es",
  },
  {
    key: "top-club",
    icon: "🥇",
    label: "Top club",
    description: "Club con alta actividad y valoración de la comunidad",
  },
  {
    key: "verified",
    icon: "✅",
    label: "Verificado",
    description: "Club revisado y confirmado por el equipo de RunClubs.es",
  },
];

export function getAwardDefinition(key: string): AwardDefinition | undefined {
  return AWARD_CATALOG.find((a) => a.key === key);
}
```

---

## 4. Componentes a crear

### 4.1 Tooltip — decisión de implementación

**`@radix-ui/react-tooltip` no está instalado.** Tienes tres opciones:

**Opción A — Instalar Radix Tooltip** (recomendada si la calidad UX importa):
```bash
npm install @radix-ui/react-tooltip@latest
```
Crea `components/ui/tooltip.tsx` siguiendo el patrón de los otros primitivos
en `components/ui/` (shadcn/ui style con `cn()`):
```tsx
"use client";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = TooltipPrimitive.Content;
// Wrapper con estilo del design system: bg-foreground text-background rounded text-xs px-2 py-1
```
Y añade `<TooltipProvider>` en `app/layout.tsx` (una sola vez, nivel raíz).

**Opción B — Atributo `title` HTML** (más simple, sin dependencia):
```tsx
<span title={award.label}>{award.icon}</span>
```
Funciona en todos los navegadores pero no es accesible ni estilizable. Úsala
solo si el equipo ha decidido no añadir Radix Tooltip.

**Opción C — Tooltip CSS puro** (sin dependencia, estilizable):
Posición absoluta con `group-hover:opacity-100`. Más código que A pero sin
instalación. Úsala si no quieres añadir paquetes.

**Documenta la opción elegida en `design.md`.** Si eliges A, registra el
paquete instalado y su versión (`npm view @radix-ui/react-tooltip version`).

### 4.2 `components/club/AwardBadge.tsx`

Componente atómico que renderiza **una sola insignia** con tooltip:

```tsx
interface AwardBadgeProps {
  award: { key: string; icon: string; label: string };
  size?: "sm" | "md";         // sm para tarjetas, md para fichas
  showLabel?: boolean;         // false en tarjeta (solo icono), true en ficha
}
```

- En modo `showLabel=false` (tarjetas): solo emoji + tooltip con el label.
- En modo `showLabel=true` (fichas): emoji + texto del label inline.
- Usa `getAwardDefinition(award.key)` para obtener la `description` del tooltip
  si la opción de tooltip lo soporta.
- Si la clave no existe en el catálogo, usa `award.icon` y `award.label` del
  propio registro (fallback graceful — puede haber awards futuros no en catálogo).

### 4.3 `components/club/AwardStack.tsx`

Renderiza la lista de insignias de un club. Dos modos:

**Modo compacto** (para tarjetas de listado):
```tsx
// Muestra los iconos en fila, cada uno con AwardBadge size="sm"
<div className="flex gap-1">
  {awards.map((a) => <AwardBadge key={a.key} award={a} size="sm" />)}
</div>
```

**Modo expandido** (para fichas de club):
```tsx
// Muestra "Ver premios del club" como botón que expande la lista con labels
// Usa useState para el toggle (NO el Accordion de Radix — es overkill aquí)
const [open, setOpen] = useState(false);

<div>
  <button onClick={() => setOpen(!open)} className="text-sm text-muted-foreground underline-offset-2 hover:underline">
    {open ? "Ocultar premios" : es.common.showAwards}
  </button>
  {open && (
    <div className="mt-2 flex flex-col gap-2">
      {awards.map((a) => (
        <AwardBadge key={a.key} award={a} size="md" showLabel />
      ))}
    </div>
  )}
</div>
```

---

## 5. Integración — actúa según lo que encuentres

### 5.1 Si `ClubCard.tsx` ya existe (`clubs-directory` completada)

Busca dónde renderiza los tipos (`TypeChip`) e inserta `<AwardStack>` justo
antes o después, en posición absoluta `top-3 right-3` como indica doc 2 §9.5:

```tsx
// Dentro de ClubCard, añadir en la esquina superior derecha:
{club.awards.length > 0 && (
  <div className="absolute right-3 top-3">
    <AwardStack awards={club.awards} />
  </div>
)}
```

La tarjeta ya tiene `className="... relative ..."` — si no, añade `relative`.

### 5.2 Si `app/clubs/[slug]/page.tsx` ya existe (`club-detail` completada)

Localiza `ClubHeader` o la sección de metadatos y añade `<AwardStack>` en
modo expandido, tras el nombre del club o al final del sidebar. Usa
`showLabel=true` implícito a través del botón "Ver premios del club".

### 5.3 Si `ClubCard.tsx` NO existe todavía

**No lo crees tú** — `clubs-directory` debe crearlo con su propia lógica de
filtros, contador y layout. Lo que sí debes hacer:

1. Crea una **página de demostración** en `app/demo/awards/page.tsx` que
   muestre `AwardBadge` y `AwardStack` con datos de prueba hardcodeados (los
   tres awards del catálogo). Esto permite verificar el componente sin
   depender de pages que aún no existen.
2. Documenta en `design.md` que la integración en `ClubCard` y `club-detail`
   queda pendiente de que esas capabilities creen sus superficies.
3. Exporta los componentes desde `components/club/index.ts` (o déjalos
   directamente importables) para que el agente de `clubs-directory` los
   encuentre fácilmente.

### 5.4 Badge "Verificado" en fichas (si Opción A de §3.2)

Si decides añadir `verified` a `ClubSummary`, actualiza también:
- `types/index.ts` — añadir `verified?: boolean` a `ClubSummary`
- `lib/clubs.ts` (si existe) — mapear `club.verified` en `getClubs` y `getClubBySlug`
- La función privada `mapClubToSummaryForRun` en `lib/runs.ts` — añadir
  `verified: club.verified`

**No hagas esto si el impacto en cascada es mayor de lo esperado** — en ese
caso, elige la Opción B y documéntalo.

---

## 6. Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance:**
- `lib/awards.ts` — catálogo canónico de insignias.
- `components/ui/tooltip.tsx` — si instalas Radix Tooltip (Opción A).
- `components/club/AwardBadge.tsx` — badge atómico con tooltip.
- `components/club/AwardStack.tsx` — lista de badges con toggle "Ver premios".
- Integración en `ClubCard.tsx` si ya existe.
- Integración en `app/clubs/[slug]/page.tsx` si ya existe.
- Página demo `app/demo/awards/page.tsx` si no hay dónde integrar.
- Añadir `<TooltipProvider>` a `app/layout.tsx` si instalas Radix Tooltip.

**Non-goals explícitos:**
- **No crees** `ClubCard.tsx` si no existe — pertenece a `clubs-directory`.
- **No crees** `app/clubs/[slug]/page.tsx` si no existe — pertenece a `club-detail`.
- **No implementes** la asignación de awards por parte del admin — eso es
  `admin-panel`. Las insignias se asignan manualmente en la BD o via seed.
- **No cambies** el modelo `ClubAward` en el schema — no hay migración.
- **No añadas** awards al seed más allá de confirmar que los existentes
  (`founders`, `top-club`) son suficientes para verificar el componente.
- **No implementes** un sistema de puntos, unlocks automáticos ni lógica de
  negocio para ganar insignias — son asignadas manualmente por admin.
- **No elimines** la página demo aunque más tarde se integre en cards reales —
  déjala como test visual.

---

## 7. Especificación funcional (PRD §6.9 — US-14)

**US-14.** Como visitante, quiero distinguir clubs destacados o verificados.
- **Given** un club tiene `ClubAward` asociados
- **When** veo su tarjeta en el listado
- **Then** se muestran los iconos de insignia con tooltip del label
  (p. ej. "Fundadores", "Verificado", "Top club").
- **When** veo la ficha de detalle del club
- **Then** puedo expandir "Ver premios del club" para ver icono + label de cada
  insignia.

---

## 8. Decisiones que debes tomar tú (documéntalas en `design.md`)

- **Tooltip**: cuál de las tres opciones elegiste y por qué.
- **Badge "Verificado"**: Opción A (campo `Club.verified`) o Opción B
  (`ClubAward` con key `"verified"`), y cuáles ficheros modificaste.
- **Estado de integración**: qué encontraste al comprobar `ClubCard` y
  `club-detail`, y qué se integró vs. qué quedó pendiente.
- **Posición en la tarjeta**: ¿absoluta esquina superior derecha (como doc 2)
  u otro lugar? ¿Cambia en mobile?

---

## 9. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea el change con sus 4 ficheros
openspec/changes/add-awards-badges/proposal.md
openspec/changes/add-awards-badges/design.md
openspec/changes/add-awards-badges/tasks.md
openspec/changes/add-awards-badges/specs/awards-badges/spec.md

# 2. Valida antes de implementar
openspec validate add-awards-badges --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §10)
openspec validate add-awards-badges --strict

# 5. Archiva
openspec archive add-awards-badges -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (los awards ya existen en BD desde `data-model`
  pero no se renderizan en ningún sitio; esta capability cierra esa brecha),
  qué cambia, `## Non-goals` con los puntos del §6, estado de integración
  esperado (condicional según capabilities previas).

- **`design.md`**: las decisiones del §8, el catálogo de awards, la opción
  de tooltip elegida (con versión de paquete si se instaló), y el mapa de
  integración (qué se integró, qué queda pendiente y dónde).

- **`tasks.md`**: grupos sugeridos — (1) `lib/awards.ts` + catálogo,
  (2) Tooltip (`components/ui/tooltip.tsx` si aplica + `app/layout.tsx`),
  (3) `AwardBadge`, (4) `AwardStack`, (5) Integración en `ClubCard`/
  `club-detail` (o página demo si no existen), (6) Badge "Verificado"
  (si Opción A), (7) Verificación.

- **`specs/awards-badges/spec.md`**: formato OpenSpec. **Recuerda:** cada
  enunciado de requisito MUST o SHALL contener las palabras en inglés
  (RFC 2119) o `openspec validate --strict` fallará.

  Requisitos mínimos: catálogo canónico importable desde `lib/awards.ts`,
  `AwardBadge` con tooltip accesible, `AwardStack` en modo compacto y
  expandido, integración en al menos una superficie (tarjeta o ficha o demo),
  fallback graceful para keys no conocidas.

---

## 10. Verificación (no te limites a "compila")

1. **Verifica que hay awards en la BD:**
   ```sql
   SELECT ca.key, ca.icon, ca.label, c.name
   FROM "ClubAward" ca
   JOIN "Club" c ON ca."clubId" = c.id
   ORDER BY ca.key;
   ```
   Deben aparecer filas con `founders` y `top-club`. Si la tabla está vacía
   (seed no corrió), ejecuta `npm run db:seed` y `npm run db:verify`.

2. **Verifica el componente visualmente:**
   - Si hay integración en `ClubCard`: navega a `/clubs` y confirma que los
     clubs con awards muestran el/los iconos en la esquina de la tarjeta. Al
     hacer hover, el tooltip muestra el label.
   - Si hay integración en `club-detail`: navega a `/clubs/<slug-con-awards>`,
     confirma que aparece el botón "Ver premios del club" y que al pulsarlo
     se expanden las insignias con icono + label.
   - Si solo existe la página demo: navega a `/demo/awards` y confirma que
     los tres badges del catálogo se renderizan correctamente, con tooltip y
     modo expandido funcional.

3. **Verifica accesibilidad básica**:
   - Los badges tienen un label accesible (aria-label o texto visible).
   - El botón "Ver premios del club" es un `<button>` real (no un `<div>`
     con onClick), tiene focus visible y funciona con teclado.

4. **Verifica que nada se rompió:**
   - `npm run build` y `npm run lint` pasan sin errores nuevos.
   - Si modificaste `types/index.ts`, confirma que `lib/runs.ts` y cualquier
     otro fichero que use `ClubSummary` compila sin errores de TypeScript.

5. Marca todas las casillas de `tasks.md`, ejecuta
   `openspec validate add-awards-badges --strict` y archiva con
   `openspec archive add-awards-badges -y`.

---

## 11. Qué NO hacer

- No crees `ClubCard.tsx` ni `app/clubs/[slug]/page.tsx` si no existen —
  crea la página demo en su lugar.
- No añadas la lógica de asignación de awards (solo rendering).
- No inventes un sistema de levels, puntos o progress bars — las insignias
  son estáticas y asignadas por admin.
- No instales una librería de tooltip pesada (p. ej. Tippy.js) cuando Radix
  Tooltip o el atributo `title` son suficientes.
- No modifiques `ClubAward` en el schema ni añadas campos — el modelo ya es
  suficientemente flexible con `key`/`icon`/`label`.
- No marques una tarea como completada si no la has verificado de verdad.

---

## 12. Formato de tu informe final al usuario

Resume: opción de tooltip elegida (y versión instalada si aplica), decisión
sobre badge "Verificado" (Opción A o B), qué superficies encontraste y en
cuáles se integró (`ClubCard` / `club-detail` / solo demo), resultado de
la query SQL de verificación (cuántos awards/clubs), confirmación de
`openspec validate` y `openspec archive` completados, y propón `newsletter`
como siguiente capability de Fase 4.
