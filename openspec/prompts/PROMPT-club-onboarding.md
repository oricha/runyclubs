# Prompt de implementación — Capability `club-onboarding` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `club-onboarding` del proyecto RunClubs.es siguiendo
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

**RunClubs.es** es un directorio de clubs de running y carreras grupales en las 20
ciudades más importantes de España. Las capabilities `auth` y `membership-attendance`
**ya están implementadas**. Confírmalas con `openspec list --specs` antes de empezar.

### Stack exacto (verifica versiones con `cat package.json`)

- **Next.js 16.2.9** App Router. No existe `pages/`.
- **React 19.2.7**, **TypeScript 5.9.3** (`strict: true`)
- **Prisma 7.8.0** con `@prisma/adapter-pg` + `pg.Pool`. Lee `lib/prisma.ts`.
- **Auth.js v5** (`next-auth@beta`). Sesión en Server Components: `import { auth } from "@/auth"`.
- **Tailwind CSS v3.4.19** (NO v4). Tokens de color `hsl(var(--…))`.
- **shadcn/ui** (Radix primitives) + `lucide-react`.
- **`lib/i18n/es.ts`** con helper `t(template, vars)`.

### Patrón de auth establecido — debes seguirlo

```ts
// En un Server Component
import { auth } from "@/auth";
const session = await auth();
// session?.user?.id  → userId

// En una Server Action ("use server")
import { auth } from "@/auth";
import { redirect } from "next/navigation";
const session = await auth();
if (!session?.user?.id) redirect("/acceso?next=/onboarding/club");
```

> **Nota sobre middleware:** `middleware.ts` ya tiene
> `matcher: ["/cuenta/:path*", "/onboarding/:path*"]`. Cualquier ruta bajo
> `/onboarding/` redirige automáticamente a `/acceso` si no hay sesión. Aun
> así, todas tus Server Actions deben verificar `auth()` internamente
> (defensa en profundidad — el middleware puede saltearse en llamadas directas).

### Ficheros clave — léelos antes de escribir código

| Fichero | Relevancia |
|---|---|
| `prisma/schema.prisma` | Modelos `Club`, `RecurringRun`, `ClubMember`, `ClubType`, `RunTypeTag` |
| `prisma/seed.ts` | Ejemplo real de creación de club con todos los campos necesarios |
| `lib/utils.ts` | `slugify(value: string): string` — para generar el slug del club |
| `lib/cities.ts` | `CITY_DETAILS: CityInfo[]` (20 ciudades con slug, name, region) |
| `lib/run-types.ts` | `RUN_TYPES` (11 tipos con id, emoji, label) |
| `lib/pace-labels.ts` | `PACE_OPTIONS`, `PACE_LABELS`, `getPaceLabel` |
| `lib/recurring.ts` | `generateRuns(weeksAhead?)` — genera instancias `Run` futuras para todas las `RecurringRun` activas |
| `lib/i18n/es.ts` | Añadir sección `onboarding.*` antes de usarla |
| `app/acceso/actions.ts` | Patrón de referencia para Server Actions |
| `components/ui/` | `Button`, `Input`, `Card`, `Badge`, `Avatar` disponibles |
| `components/common/Container.tsx` | Wrapper de layout — úsalo |

---

## 3. Modelo de datos — campos que crea este change

El schema **no necesita migración** — todos los modelos ya existen. Lo que este
change crea en la BD son **filas nuevas** en modelos existentes:

### `Club` — campos requeridos al crear

```ts
{
  slug: string          // generado con slugify(name), único, ver §5.2
  name: string          // Paso 1 (obligatorio)
  description: string   // Paso 1 (obligatorio, @db.Text)
  cityId: string        // Paso 1 (obligatorio, resolver desde city.slug)
  pace: Pace            // Paso 1 (enum: ALL_PACES | BEGINNER | INTERMEDIATE | ADVANCED)
  frequency: number     // calculado = recurringRuns.length (NO se pide al usuario)
  ownerId: string       // session.user.id
  usesPlatform: true    // siempre true para clubs creados via self-service
  verified: false       // siempre false en creación (admin lo verifica)
  logoUrl?: string      // Paso 3 (URL externa, opcional)
  coverUrl?: string     // Paso 3 (URL externa, opcional)
  instagramUrl?: string // Paso 4 (opcional)
  stravaUrl?: string    // Paso 4 (opcional)
  website?: string      // Paso 4 (opcional)
  types: [...]          // Paso 1 o 3 (ClubType → RunTypeTag)
}
```

### `RecurringRun` — al menos 1, creadas en Paso 2

```ts
{
  clubId: string        // del club recién creado
  title: string         // obligatorio ("Quedada de los martes", etc.)
  weekday: number       // 0–6 (0=domingo, per Date.getDay())
  time: string          // "HH:MM" (p. ej. "07:30")
  location: string      // obligatorio
  distanceKm?: number   // opcional
  pace?: string         // opcional (texto libre: "5:30", "tranquilo", etc.)
  types: string[]       // ids de RUN_TYPES
  active: true          // siempre true al crear
}
```

### `ClubMember` — creator como OWNER

```ts
{
  clubId: string        // del club recién creado
  userId: string        // session.user.id
  role: "OWNER"
}
```

### `ClubType` — por cada tipo seleccionado

```ts
{ clubId: string; typeId: string }  // typeId = RunTypeTag.id (buscar por key)
```

---

## 4. Arquitectura del wizard

### 4.1 Decisión de diseño: wizard de página única con estado cliente

`/onboarding/club` es un **único Client Component** (`"use client"`) que gestiona
el estado de todos los pasos en `useState`. No uses URL params por paso
(`?step=2`) — añade complejidad sin beneficio real para este caso de uso.

La página Server Component (`app/onboarding/club/page.tsx`) solo pasa datos
estáticos (ciudades, tipos, opciones de ritmo) como props al wizard cliente.

```
app/onboarding/club/
  page.tsx          ← Server Component: carga cities + types, pasa al wizard
  ClubWizard.tsx    ← "use client", gestiona paso actual + estado acumulado
  steps/
    Step1Datos.tsx
    Step2Recurrencias.tsx
    Step3Estilo.tsx
    Step4Enlaces.tsx
    Step5Publicar.tsx
  actions.ts        ← "use server": createClub
```

### 4.2 Tipo del estado del wizard

```ts
// Dentro de ClubWizard.tsx o en un types local
interface WizardState {
  // Paso 1
  name: string;
  citySlug: string;
  description: string;
  pace: Pace;
  typeIds: string[];     // ids de RunTypeTag seleccionados

  // Paso 2
  recurrencias: RecurrenciaInput[];

  // Paso 3
  logoUrl: string;
  coverUrl: string;

  // Paso 4
  instagramUrl: string;
  stravaUrl: string;
  website: string;
}

interface RecurrenciaInput {
  title: string;
  weekday: number;       // 0–6
  time: string;          // "HH:MM"
  location: string;
  distanceKm: string;    // string en el form, parseFloat al enviar
  pace: string;
  typeIds: string[];
}
```

### 4.3 Navegación entre pasos

```tsx
const STEPS = ["Datos", "Carreras", "Estilo", "Redes", "Publicar"] as const;
const [step, setStep] = useState(0);

// Indicador visual de progreso: barra o pills con los 5 pasos
// Botones "Anterior" / "Siguiente" — "Siguiente" valida el paso actual antes de avanzar
// El paso 5 muestra un resumen y el botón "Publicar mi club" que llama createClub
```

---

## 5. Server Action — `app/onboarding/club/actions.ts`

```ts
"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { generateRuns } from "@/lib/recurring";

export type CreateClubInput = {
  name: string;
  citySlug: string;
  description: string;
  pace: string;           // Pace enum value
  typeIds: string[];      // RunTypeTag keys (no ids — buscar por key)
  recurrencias: RecurrenciaInput[];
  logoUrl?: string;
  coverUrl?: string;
  instagramUrl?: string;
  stravaUrl?: string;
  website?: string;
};

export type CreateClubResult =
  | { success: true; slug: string }
  | { success: false; error: string };

export async function createClub(input: CreateClubInput): Promise<CreateClubResult>
```

### 5.1 Validación en la Server Action (además de la del wizard)

```ts
if (!input.name?.trim() || input.name.trim().length < 2)
  return { success: false, error: "El nombre del club es obligatorio (mínimo 2 caracteres)." };
if (!input.description?.trim() || input.description.trim().length < 20)
  return { success: false, error: "La descripción debe tener al menos 20 caracteres." };
if (!input.citySlug)
  return { success: false, error: "Debes seleccionar una ciudad." };
if (!input.recurrencias || input.recurrencias.length === 0)
  return { success: false, error: "Añade al menos una carrera recurrente." };
// Validar cada recurrencia: title, weekday (0–6), time (HH:MM), location
```

### 5.2 Generación del slug — manejo de colisiones

```ts
const baseSlug = slugify(input.name.trim());
let slug = baseSlug;
let attempt = 0;

// Verifica unicidad y añade sufijo numérico si hay colisión
while (await prisma.club.findUnique({ where: { slug }, select: { id: true } })) {
  attempt++;
  slug = `${baseSlug}-${attempt}`;
}
```

### 5.3 Transacción Prisma — todo o nada

Usa `prisma.$transaction` para crear el club, sus tipos, recurrencias y el
`ClubMember` owner de forma atómica:

```ts
const club = await prisma.$transaction(async (tx) => {
  // 1. Resolver cityId
  const city = await tx.city.findUnique({ where: { slug: input.citySlug } });
  if (!city) throw new Error("Ciudad no encontrada");

  // 2. Crear el club
  const created = await tx.club.create({
    data: {
      slug,
      name: input.name.trim(),
      description: input.description.trim(),
      cityId: city.id,
      pace: input.pace as Pace,
      frequency: input.recurrencias.length,
      ownerId: userId,          // session.user.id
      usesPlatform: true,
      verified: false,
      instagramUrl: input.instagramUrl || null,
      stravaUrl: input.stravaUrl || null,
      website: input.website || null,
      logoUrl: input.logoUrl || null,
      coverUrl: input.coverUrl || null,
    },
  });

  // 3. Crear tipos del club (buscar RunTypeTag por key)
  if (input.typeIds.length > 0) {
    const tags = await tx.runTypeTag.findMany({
      where: { key: { in: input.typeIds } },
      select: { id: true },
    });
    await tx.clubType.createMany({
      data: tags.map((tag) => ({ clubId: created.id, typeId: tag.id })),
      skipDuplicates: true,
    });
  }

  // 4. Crear RecurringRuns
  for (const r of input.recurrencias) {
    await tx.recurringRun.create({
      data: {
        clubId: created.id,
        title: r.title.trim(),
        weekday: r.weekday,
        time: r.time,
        location: r.location.trim(),
        distanceKm: r.distanceKm ? parseFloat(r.distanceKm) : null,
        pace: r.pace || null,
        types: r.typeIds,
        active: true,
      },
    });
  }

  // 5. Owner como ClubMember con rol OWNER
  await tx.clubMember.create({
    data: { clubId: created.id, userId, role: "OWNER" },
  });

  return created;
});
```

### 5.4 Tras la transacción: generar runs y revalidar

```ts
// Genera instancias Run futuras (usa generateRuns de lib/recurring.ts)
// IMPORTANTE: generateRuns corre FUERA de la transacción para no bloquearla
try {
  await generateRuns(); // genera runs para TODAS las RecurringRun activas; idempotente
} catch {
  // No es bloqueante — las runs se generarán en el próximo cron
}

revalidatePath("/clubs");
if (await clubExists(club.slug)) revalidatePath(`/clubs/${club.slug}`);

return { success: true, slug: club.slug };
```

---

## 6. Los 5 pasos del wizard en detalle

### Paso 1 — Datos básicos

Campos:
- **Nombre del club** (text, obligatorio, max 80 chars) → `name`
- **Ciudad** (select, obligatorio) → opciones de `CITY_DETAILS` (`name` visible, `slug` value)
- **Descripción** (textarea, obligatorio, min 20 chars, max 500 chars con contador)
- **Tipos de carrera** (multi-select de `RUN_TYPES`, al menos 1 recomendado) → `typeIds`
- **Ritmo** (select de `PACE_OPTIONS` con `getPaceLabel`) → `pace`

Validación al avanzar:
- `name.trim().length >= 2`
- `citySlug` seleccionado
- `description.trim().length >= 20`

### Paso 2 — Carreras recurrentes

Interfaz de lista de recurrencias con botón "Añadir carrera". Cada recurrencia:
- **Título** (text, obligatorio) → `title`
- **Día de la semana** (select: Domingo=0, Lunes=1, … Sábado=6) → `weekday`
- **Hora** (time input "HH:MM") → `time`
- **Lugar de encuentro** (text, obligatorio) → `location`
- **Distancia** (number, opcional, km) → `distanceKm`
- **Ritmo** (text libre, opcional: "5:30/km", "tranquilo", etc.) → `pace`
- **Tipos** (multi-select de `RUN_TYPES`) → `typeIds`
- Botón de eliminar por recurrencia

Validación al avanzar:
- Al menos 1 recurrencia
- Cada recurrencia: `title` y `location` no vacíos, `weekday` entre 0-6,
  `time` con formato `HH:MM` (regex `/^\d{2}:\d{2}$/`)

### Paso 3 — Estilo e imagen

Campos opcionales (todos):
- **URL del logo** (text, URL) → `logoUrl`
- **URL de imagen de portada** (text, URL) → `coverUrl`

Nota para el agente: en esta fase no se implementa upload de ficheros —
solo se acepta URL externa (p. ej. de Instagram CDN o Imgur). Documenta en
`design.md` que el upload de imágenes es mejora futura. Muestra un preview
`<img src={logoUrl}>` si la URL tiene formato válido.

Validación al avanzar: ninguna obligatoria (todo opcional).

### Paso 4 — Redes sociales

Campos opcionales:
- **Instagram** (text, debe empezar por `https://instagram.com/` o aceptar cualquier URL) → `instagramUrl`
- **Strava** (text, URL) → `stravaUrl`
- **Web** (text, URL) → `website`

Validación al avanzar: ninguna obligatoria. Si se rellena, validar que tiene
formato de URL (`URL.canParse(value)` o regex simple `/^https?:\/\//`).

### Paso 5 — Revisión y publicar

Muestra un resumen de todo lo introducido:
- Nombre, ciudad, ritmo, tipos
- Lista de recurrencias con día y hora
- Logo/cover si se pusieron
- Redes sociales

Botón principal: **"Publicar mi club"** — llama a `createClub(state)`.

**Decisión de moderación** (pregunta abierta del PRD §14): implementa
**publicación inmediata** (`verified: false` pero visible en `/clubs`). El
campo `verified` no filtra la visibilidad en esta fase — los clubs recién
creados aparecen en `/clubs` sin moderación previa. `admin-panel` añadirá
moderación cuando sea necesario. Documenta esta decisión en `design.md`.

Si `createClub` devuelve `{ success: true, slug }`:
- Muestra la pantalla "¡Listo!" (ver §7).

Si devuelve `{ success: false, error }`:
- Muestra el error inline sin perder el estado del formulario.

---

## 7. Pantalla de confirmación — "¡Listo!"

Tras crear el club con éxito, en lugar de redirigir directamente a `/clubs/[slug]`,
muestra una pantalla de éxito **dentro del mismo wizard** (paso 6 implícito):

```
🏃  ¡Tu club ya está en RunClubs.es!

[Nombre del club] ya aparece en el directorio.
Comparte el enlace con tus corredores para que se unan.

[Ver mi club →]  [Copiar enlace]  [Volver al inicio]
```

- "Ver mi club" → `router.push("/clubs/<slug>")`.
- "Copiar enlace" → `navigator.clipboard.writeText(...)` con feedback visual
  (texto cambia a "¡Copiado!" durante 2s).
- "Volver al inicio" → `router.push("/")`.

---

## 8. i18n — sección nueva en `lib/i18n/es.ts`

Añade una sección `onboarding` al diccionario antes de usarla en los componentes:

```ts
onboarding: {
  // Pasos
  stepDatos: "Datos del club",
  stepCarreras: "Carreras",
  stepEstilo: "Estilo",
  stepRedes: "Redes sociales",
  stepPublicar: "Publicar",
  next: "Siguiente",
  back: "Anterior",
  // Paso 1
  clubName: "Nombre del club",
  clubNamePlaceholder: "p. ej. Retiro Morning Crew",
  city: "Ciudad",
  description: "Descripción",
  descriptionPlaceholder: "Cuéntanos de vuestro club, a quién está dirigido y cómo son vuestras salidas...",
  types: "Tipos de carrera",
  pace: "Ritmo habitual",
  // Paso 2
  addRecurrencia: "Añadir carrera recurrente",
  removeRecurrencia: "Eliminar",
  recurrenciaTitle: "Nombre de la salida",
  weekday: "Día de la semana",
  time: "Hora",
  location: "Lugar de encuentro",
  distanceKm: "Distancia (km)",
  pace_run: "Ritmo (opcional)",
  // Paso 3
  logoUrl: "URL del logo",
  coverUrl: "URL de imagen de portada",
  logoUrlHint: "URL directa a una imagen (jpg, png, webp)",
  imagePreview: "Vista previa",
  // Paso 4
  instagramUrl: "Instagram",
  stravaUrl: "Strava",
  website: "Web del club",
  // Paso 5
  reviewTitle: "Revisa tu club antes de publicar",
  publishButton: "Publicar mi club",
  publishing: "Publicando...",
  // Éxito
  successTitle: "¡Tu club ya está en RunClubs.es!",
  successText: "Ya aparece en el directorio. Comparte el enlace con tus corredores.",
  viewClub: "Ver mi club",
  copyLink: "Copiar enlace",
  linkCopied: "¡Copiado!",
  backToHome: "Volver al inicio",
  // Errores
  errorMinName: "El nombre debe tener al menos 2 caracteres.",
  errorMinDescription: "La descripción debe tener al menos 20 caracteres.",
  errorCityRequired: "Selecciona una ciudad.",
  errorMinRecurrencias: "Añade al menos una carrera recurrente.",
  errorRecurrenciaTitle: "El nombre de la salida es obligatorio.",
  errorRecurrenciaLocation: "El lugar de encuentro es obligatorio.",
  errorRecurrenciaTime: "Introduce la hora en formato HH:MM.",
  errorUrlFormat: "Introduce una URL válida (debe empezar por https://).",
},
```

---

## 9. Enlace desde el footer y clubs directory

El footer ya tiene `es.footer.addClub` ("Añade tu club") y un link a
`/onboarding/club` (confirma el href real con `cat components/layout/Footer.tsx`).
Si no apunta a `/onboarding/club`, corrígelo.

Si `app/clubs/page.tsx` existe (`clubs-directory` implementada), busca el CTA
"Añade tu club" en esa página y verifica que también apunta a `/onboarding/club`.

---

## 10. Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance:**
- `app/onboarding/club/page.tsx` — Server Component wrapper.
- `app/onboarding/club/ClubWizard.tsx` y pasos en `steps/`.
- `app/onboarding/club/actions.ts` — Server Action `createClub`.
- Pantalla de confirmación "¡Listo!" inline.
- Sección `onboarding.*` en `lib/i18n/es.ts`.
- Corrección del enlace en Footer (si necesaria).

**Non-goals explícitos:**
- **No implementes** upload de imágenes — solo URL externa. Documenta en `design.md`.
- **No implementes** edición de club existente — eso es `admin-panel` y `user-account`.
- **No implementes** moderación/revisión previa a publicación — publica inmediatamente;
  la moderación es responsabilidad de `admin-panel`.
- **No implementes** el wizard de alta de recurrencias por separado fuera del wizard
  de club — las recurrencias se crean como parte del mismo flujo.
- **No añadas** campos de `priceCents` ni `signupType` al wizard — los clubs
  no configuran precios individuales de carreras en el onboarding (es por carrera,
  no por club).
- **No implementes** `/onboarding/club/editar` ni rutas de edición.
- **No uses** `useFormStatus` de `react-dom` para el wizard completo — solo en el
  botón final de "Publicar" (el paso 5) donde se llama a `createClub`.

---

## 11. Especificación funcional (PRD §6.8)

**US-13.** Como organizador, quiero publicar mi club en pocos pasos.
- **Given** tengo sesión iniciada
- **When** completo el wizard de 5 pasos (datos, recurrencias, estilo, redes, publicar)
- **Then** se crea el `Club` con `ownerId = mi usuario`, sus `RecurringRun`
  asociadas y el `ClubMember` con rol `OWNER`; el club queda visible en `/clubs`
  inmediatamente; `generateRuns` genera las instancias de `Run` futuras.

**Reglas de negocio:**
- Cada paso valida antes de avanzar; la validación se repite en la Server Action.
- El slug se genera desde el nombre con `slugify`; las colisiones se resuelven
  con sufijo numérico (`-1`, `-2`, …).
- `frequency` se calcula automáticamente como `recurrencias.length`.
- `verified: false` en creación (moderación fuera de alcance).
- `usesPlatform: true` en clubs creados via self-service.

---

## 12. Decisiones que debes tomar tú (documéntalas en `design.md`)

- **Moderación**: documenta que la decisión elegida es publicación inmediata y
  por qué (simplicidad; `admin-panel` añadirá moderación; `verified` ya existe
  para diferenciarlo).
- **Paso de tipos**: ¿se seleccionan los tipos del club en el Paso 1 (junto a
  datos) o en el Paso 3 (junto a estilo visual)? Elige y justifica.
- **`generateRuns` scope**: la función actual regenera runs para TODAS las
  `RecurringRun` activas (idempotente). ¿La llamas globalmente o filtras solo las
  del club recién creado? Documenta el tradeoff (global = simple, filter = más
  eficiente pero requiere modificar la firma de `generateRuns`).
- **Validación de URL de imagen**: ¿solo formato (`/^https?:\/\//`) o también
  intentas cargar la imagen para confirmar que es válida? Elige la opción más
  simple.
- **Días de la semana**: el campo `weekday` usa la convención de `Date.getDay()`
  (0=domingo). Confirma en `prisma/seed.ts` y `lib/recurring.ts` que es así y
  documéntalo para que el `<select>` muestre los días en el orden correcto.

---

## 13. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea el change con sus 4 ficheros
openspec/changes/add-club-onboarding/proposal.md
openspec/changes/add-club-onboarding/design.md
openspec/changes/add-club-onboarding/tasks.md
openspec/changes/add-club-onboarding/specs/club-onboarding/spec.md

# 2. Valida antes de implementar
openspec validate add-club-onboarding --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §14)
openspec validate add-club-onboarding --strict

# 5. Archiva
openspec archive add-club-onboarding -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (primer flujo de captación de clubs self-service;
  prereqs: `auth` y `membership-attendance`), qué cambia, decisión de publicación
  inmediata vs moderación, `## Non-goals` con los puntos del §10.

- **`design.md`**: las decisiones del §12, el contrato de `createClub`,
  la arquitectura del wizard (página única client-side), la estrategia de
  generación de slug con colisiones, la transacción Prisma, el scope de
  `generateRuns`, y la decisión de URLs externas en lugar de upload.

- **`tasks.md`**: grupos sugeridos — (1) Server Action `createClub` + validación,
  (2) `WizardState` y estructura de componentes, (3) Paso 1 Datos,
  (4) Paso 2 Recurrencias (el más complejo — lista dinámica de items),
  (5) Paso 3 Estilo + Paso 4 Redes, (6) Paso 5 Revisión + pantalla éxito,
  (7) i18n + enlace footer, (8) Verificación.

- **`specs/club-onboarding/spec.md`**: formato OpenSpec. **Recuerda:** cada
  enunciado de requisito debe contener **`MUST`** o **`SHALL`** en inglés
  (RFC 2119) o `openspec validate --strict` fallará.

  Requisitos mínimos: wizard protegido por auth, validación por paso antes de
  avanzar, slug único generado desde nombre, transacción atómica (todo o nada),
  `ClubMember OWNER` creado, `generateRuns` llamado, pantalla de éxito con enlace
  al club, publicación inmediata sin moderación.

---

## 14. Verificación (no te limites a "compila")

1. **Sin sesión**: navega a `/onboarding/club` → debe redirigir a
   `/acceso?callbackUrl=...` (middleware actúa). No debes ver el wizard.

2. **Flujo completo con sesión**:
   - Paso 1: rellena nombre, elige ciudad, escribe descripción, selecciona tipos y ritmo.
   - Pulsa "Siguiente" sin rellenar nombre → error de validación inline, NO avanza.
   - Paso 2: añade 2 recurrencias. Pulsa "Siguiente" sin recurrencias → error inline.
   - Paso 3: pon una URL de logo válida → ver preview de imagen. Deja cover vacío.
   - Paso 4: rellena Instagram. Deja Strava vacío.
   - Paso 5: verifica que el resumen refleja todo lo introducido. Pulsa "Publicar mi club".
   - Pantalla éxito: aparece el nombre del club y los botones "Ver mi club", "Copiar enlace".
   - "Ver mi club" → navega a `/clubs/<slug>` (si `club-detail` existe, verás la ficha).

3. **Verifica en la BD**:
   ```sql
   SELECT slug, name, "ownerId", "usesPlatform", verified, frequency
   FROM "Club" ORDER BY "createdAt" DESC LIMIT 1;
   
   SELECT * FROM "RecurringRun" WHERE "clubId" = '<id-del-club-nuevo>';
   
   SELECT * FROM "ClubMember" WHERE "clubId" = '<id-del-club-nuevo>';
   
   SELECT COUNT(*) FROM "Run" WHERE "clubId" = '<id-del-club-nuevo>';
   -- Debe ser > 0 si generateRuns se ejecutó
   ```

4. **Colisión de slug**: crea dos clubs con el mismo nombre y verifica que el
   segundo obtiene slug `<base>-1`.

5. **Footer**: el enlace "Añade tu club" en el footer navega a `/onboarding/club`.

6. `npm run build` y `npm run lint` pasan sin errores nuevos.

7. Marca todas las casillas de `tasks.md`, ejecuta
   `openspec validate add-club-onboarding --strict` y archiva con
   `openspec archive add-club-onboarding -y`.

---

## 15. Qué NO hacer

- No implementes upload de imágenes (S3, Vercel Blob, etc.) — solo URL externa.
- No implementes moderación ni el campo `status` de publicación en este change.
- No uses `useFormState` (deprecated en React 19 — usa `useState` + la Server
  Action como función asíncrona normal, no como `action=` de formulario HTML para
  los pasos intermedios; solo el botón final de publicar puede usar `action=`).
- No crees rutas `/onboarding/club/paso-1`, etc. — wizard de una sola página.
- No modifiques `lib/recurring.ts` para filtrar por club si eso requiere cambiar
  la firma pública — llama `generateRuns()` globalmente (es idempotente).
- No marques una tarea como completada si no la has verificado de verdad.

---

## 16. Formato de tu informe final al usuario

Resume: arquitectura del wizard (pasos, componentes creados), decisión sobre
moderación documentada en `design.md`, cómo se resuelven las colisiones de slug,
si `generateRuns` se llamó globalmente o filtrado, qué verificaste en la BD
(muestra los valores de los campos clave del club creado en el test), si el footer
necesitó corrección, confirmación de `openspec validate` y `openspec archive`
completados, y propón `newsletter` o `user-account` como siguiente capability
de Fase 4.
