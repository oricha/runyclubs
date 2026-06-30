# Prompt de implementación — Capability `membership-attendance` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `membership-attendance` del proyecto RunClubs.es siguiendo
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

**RunClubs.es** es un directorio social de clubs de running y carreras grupales en
las 20 ciudades más importantes de España. La capability `auth` **ya está
implementada y archivada**. Lee los ficheros que se citan a continuación antes
de escribir nada — el patrón de autenticación está establecido y debes seguirlo.

### Stack exacto

- **Next.js 16.2.9** App Router. No existe `pages/`.
- **React 19.2.7**, **TypeScript 5.9.3**
- **Prisma 7.8.0** con driver adapter (`@prisma/adapter-pg` + `pg.Pool`).
- **Auth.js v5** (`next-auth@beta`) con Prisma Adapter. La sesión expone
  `session.user.id` (tipo extendido en `types/next-auth.d.ts`).
- **Tailwind CSS v3.4.19** (NO v4).
- **shadcn/ui** (Radix primitives) + `lucide-react`.
- **`lib/i18n/es.ts`** con helper `t(template, vars)`.

### Patrón de auth ya establecido — DEBES seguirlo

```
auth.ts                 — NextAuth({ adapter: PrismaAdapter(prisma), ...authConfig })
auth.config.ts          — providers, páginas, callbacks (session.user.id)
middleware.ts           — export { auth as middleware }, matcher: ["/cuenta/*", "/onboarding/*"]
types/next-auth.d.ts    — interface Session { user: { id: string } & DefaultSession["user"] }
app/acceso/actions.ts   — "use server"; signInWithGoogle / signInWithEmail usando signIn de @/auth
components/layout/Header.tsx     — Server Component: const session = await auth()
components/layout/HeaderClient.tsx — Client Component: recibe Session | null como prop
```

**Cómo obtener la sesión en un Server Component:**
```ts
import { auth } from "@/auth";
const session = await auth();   // session?.user?.id es el userId
```

**Cómo escribir una Server Action:**
```ts
// lib/actions/attendance.ts  (o co-localizado en app/...)
"use server";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function joinRun(runSlug: string) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/acceso?next=/carreras/${runSlug}`);
  // ... lógica Prisma
  revalidatePath(`/carreras/${runSlug}`);
}
```

### Ficheros clave — léelos antes de empezar

| Fichero | Relevancia |
|---|---|
| `app/carreras/[slug]/page.tsx` | Server Component a modificar: debes añadir `auth()` y pasar props a `JoinRunButton` |
| `components/run/JoinRunButton.tsx` | Actualmente presentacional (`disabled`). **Lo reemplazas completamente.** |
| `components/run/RunAttendees.tsx` | Ya renderiza avatares y contador — no lo toques, se re-renderiza sola tras `revalidatePath` |
| `types/index.ts` | `RunDetail.attendeeCount`, `RunDetail.attendeeAvatars` ya calculados en `getRunBySlug` |
| `prisma/schema.prisma` | `RunAttendee @@unique([runId, userId])`, `ClubMember @@unique([clubId, userId])`, enum `MemberRole` |
| `lib/i18n/es.ts` | Claves relevantes: `runDetail.joinRun`, `common.going`, `clubDetail.joinClub`, `common.join`, `clubDetail.members` |

---

## 3. Modelos de datos (ya en `prisma/schema.prisma` — no necesitas migración)

```prisma
model ClubMember {
  id       String     @id @default(cuid())
  clubId   String
  userId   String
  role     MemberRole @default(MEMBER)   // enum: OWNER | ADMIN | MEMBER
  club     Club       @relation(...)
  user     User       @relation(...)
  joinedAt DateTime   @default(now())

  @@unique([clubId, userId])
}

model RunAttendee {
  id       String   @id @default(cuid())
  runId    String
  userId   String
  run      Run      @relation(...)
  user     User     @relation(...)
  joinedAt DateTime @default(now())

  @@unique([runId, userId])
}
```

La unicidad está garantizada a nivel de BD. Usa **`upsert`** para todas las
operaciones de join — es idempotente y evita errores de clave duplicada:

```ts
await prisma.runAttendee.upsert({
  where: { runId_userId: { runId, userId } },
  create: { runId, userId },
  update: {},              // ya existe, no hacer nada
});
```

Para leave, usa `deleteMany` (tolerante si la fila no existe):

```ts
await prisma.runAttendee.deleteMany({
  where: { runId, userId },
});
```

---

## 4. Objetivo de este change

Convertir los botones "Apuntarse" y "Unirse al club" de shells presentacionales
en acciones reales: crean/eliminan `RunAttendee` y `ClubMember` en la BD,
actualizan el contador y el estado del botón, y redirigen a `/acceso` si no hay
sesión.

### 4.1 Flujo para carreras (`run-detail`)

El flujo completo de **"Apuntarse a una carrera"** (`signupType = "internal"`):

```
app/carreras/[slug]/page.tsx (Server Component)
  ├── getRunBySlug(slug)              → RunDetail (con attendeeCount, attendeeAvatars)
  ├── auth()                          → session
  ├── isAttending? (query extra)      → bool
  └── <JoinRunButton runSlug={slug} userId={session?.user.id ?? null} isAttending={isAttending} />
      └── Si !userId   → <a href="/acceso?next=/carreras/{slug}"> (link, no form)
          Si userId    → <form action={joinRunAction | leaveRunAction}>
                             useFormStatus para estado "cargando"
                        → Server Action: upsert RunAttendee → revalidatePath
```

Para el query de `isAttending`:

```ts
const isAttending = session?.user?.id
  ? !!(await prisma.runAttendee.findUnique({
      where: { runId_userId: { runId: run.id, userId: session.user.id } },
      select: { id: true },
    }))
  : false;
```

Hazlo en la página, no en `getRunBySlug` (el tipo `RunDetail` no cambia —
`isAttending` es contexto de sesión, no dato del recurso).

### 4.2 Flujo para clubs (`club-detail`)

El flujo de **"Unirse al club"** depende de si `app/clubs/[slug]/page.tsx` existe:

```bash
ls app/clubs/
```

**Si `app/clubs/[slug]/page.tsx` ya existe** (capability `club-detail` completada):
integra exactamente igual que en carreras — añade `auth()` y el query de
`isMember`, y actualiza `JoinClubButton` con las props necesarias.

**Si `app/clubs/[slug]/page.tsx` no existe todavía:**
- Implementa `JoinClubButton` con la firma final (ver §5.2) pero no la integres
  en ninguna página aún.
- Deja un comentario en `JoinClubButton.tsx` indicando qué props espera y que
  la integración la hará `club-detail`.
- Documenta en `design.md` qué encontraste y qué queda pendiente.

---

## 5. Componentes a crear / modificar

### 5.1 `JoinRunButton` — **reescritura completa**

Firma final:

```tsx
// components/run/JoinRunButton.tsx
"use client";

export function JoinRunButton({
  runSlug,
  userId,
  isAttending,
}: {
  runSlug: string;
  userId: string | null;
  isAttending: boolean;
})
```

Comportamiento:
- `userId === null` → botón como `<a href="/acceso?next=/carreras/{runSlug}">`.
  Usa `Button asChild` con `<a>` interno (ya existente en el design system).
  No usar `<Link>` de Next.js — una redirección a `/acceso` puede necesitar
  preservar el parámetro `?next=` que es una URL absoluta de desarrollo.
  Usa el atributo `href` directamente.
- `isAttending === false` → `<form>` con `joinRunAction`. Botón primario,
  texto `es.runDetail.joinRun` ("Apuntarse").
- `isAttending === true` → `<form>` con `leaveRunAction`. Botón variante
  `"outline"`, texto `es.common.going` ("Voy") con un check/icono.

Usa `useFormStatus` del paquete `react-dom` para deshabilitar el botón mientras
la acción está en curso:

```tsx
import { useFormStatus } from "react-dom";

function SubmitButton({ label, variant }: { label: string; variant?: "outline" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" variant={variant} disabled={pending}>
      {pending ? "…" : label}
    </Button>
  );
}
```

### 5.2 `JoinClubButton` — **nueva firma** (reemplaza el stub de `club-detail`)

Si `components/club/JoinClubButton.tsx` ya existe (del prompt `club-detail`),
reemplázalo. Si no existe, créalo:

```tsx
// components/club/JoinClubButton.tsx
"use client";

export function JoinClubButton({
  clubSlug,
  userId,
  isMember,
}: {
  clubSlug: string;
  userId: string | null;
  isMember: boolean;
})
```

Comportamiento análogo a `JoinRunButton`:
- Sin sesión → link a `/acceso?next=/clubs/{clubSlug}`.
- `isMember === false` → form con `joinClubAction`. Texto `es.clubDetail.joinClub`.
- `isMember === true` → form con `leaveClubAction`. Variante `"outline"`, texto
  `es.common.join` o "Miembro ✓" (decide y añade clave al diccionario si hace falta).

### 5.3 Server Actions — `lib/actions/attendance.ts`

```ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function joinRun(runSlug: string): Promise<void>
export async function leaveRun(runSlug: string): Promise<void>
export async function joinClub(clubSlug: string): Promise<void>
export async function leaveClub(clubSlug: string): Promise<void>
```

Cada función sigue el mismo patrón:

1. `const session = await auth()` — si `!session?.user?.id`,
   `redirect("/acceso?next=/<tipo>/<slug>")`.
2. Obtén el `runId`/`clubId` a partir del slug (query Prisma mínima:
   `findUnique({ where: { slug }, select: { id: true } })`).
3. Si el recurso no existe, retorna silenciosamente (puede haberse eliminado
   entre el render y la acción).
4. Ejecuta el `upsert` (join) o `deleteMany` (leave).
5. `revalidatePath("/carreras/<slug>")` o `revalidatePath("/clubs/<slug>")`.

> **Importante:** en Next.js App Router las Server Actions pueden recibir
> argumentos directamente (no solo `FormData`). Usa el patrón de función
> ligada (`bind`) cuando los necesites pasar desde el componente:
>
> ```tsx
> const joinAction = joinRun.bind(null, runSlug);
> // <form action={joinAction}>
> ```
>
> O bien usando un campo `<input type="hidden">` dentro del `<form>` y
> leyendo `formData.get("runSlug")` en la acción. Elige el más limpio y
> documéntalo.

### 5.4 Actualización de `app/carreras/[slug]/page.tsx`

Añade **solo** estas dos cosas (sin restructurar el resto del fichero):

```ts
// 1. Obtener sesión
const session = await auth();

// 2. Comprobar asistencia si hay sesión
const isAttending = session?.user?.id
  ? !!(await prisma.runAttendee.findUnique({
      where: { runId_userId: { runId: run.id, userId: session.user.id } },
      select: { id: true },
    }))
  : false;
```

Y actualiza las dos llamadas a `<JoinRunButton />` (aparece dos veces, una en
mobile y otra en el sidebar desktop):

```tsx
<JoinRunButton
  runSlug={run.slug}
  userId={session?.user?.id ?? null}
  isAttending={isAttending}
/>
```

**No toques** `RunAttendees`, `RunHeader`, `RunMeta`, `ExternalSignupButton`,
`ShareRunButton` ni la lógica de `moreInCity` / `aroundDate`.

Añade el import de `prisma`:
```ts
import { prisma } from "@/lib/prisma";
```

---

## 6. Claves de i18n

Las claves existentes que debes usar tal cual:

```ts
es.runDetail.joinRun        // "Apuntarse"
es.common.going             // "Voy"
es.clubDetail.joinClub      // "Unirse al club"
es.common.join              // "Unirse"
es.clubDetail.members       // "{count} miembros"  → t(es.clubDetail.members, { count })
```

Si añades estados nuevos (p. ej. "Miembro" como estado del botón de club tras
unirse), añade la clave al diccionario en `lib/i18n/es.ts` antes de usarla.
Sugerencia: `es.clubDetail.isMember: "Miembro"`.

---

## 7. Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance:**
- `lib/actions/attendance.ts` — cuatro Server Actions: `joinRun`, `leaveRun`,
  `joinClub`, `leaveClub`.
- `components/run/JoinRunButton.tsx` — reescritura con sesión y estado toggle.
- `components/club/JoinClubButton.tsx` — nueva firma (o reescritura si existe stub).
- `app/carreras/[slug]/page.tsx` — añadir `auth()` + query `isAttending` + props.
- `app/clubs/[slug]/page.tsx` — integración análoga **si el fichero ya existe**.
- Nuevas claves de i18n que sean necesarias.

**Non-goals explícitos:**
- **No implementes** gestión de roles (`OWNER`/`ADMIN`) dentro de un club —
  eso es `club-onboarding` y `admin-panel`. Las acciones de este change crean
  `ClubMember` con rol `MEMBER` siempre.
- **No implementes** notificaciones por email al unirse — eso es `newsletter` o futuro.
- **No implementes** paginación de miembros ni lista completa de asistentes —
  `RunAttendees` ya muestra hasta 5 avatares + contador.
- **No implementes** `/cuenta` ni perfil de usuario — eso es `user-account`.
- **No implementes** desactivación de cuenta ni gestión de membresías desde el
  perfil — ídem.
- **No modifiques** el middleware (`middleware.ts`) — las rutas `/carreras/[slug]`
  y `/clubs/[slug]` son públicas; la protección de auth la hace la propia Server
  Action con `redirect`.
- **No uses** Route Handlers (`app/api/runs/[slug]/join/route.ts`) — el proyecto
  usa Server Actions como patrón establecido. Si encuentras una razón técnica
  bloqueante para usar Server Actions, documéntala en `design.md` y decide.

---

## 8. Especificación funcional (PRD §6.3 y §6.4)

**US-4.** Como corredor, quiero apuntarme a una carrera con un clic.
- **Given** tengo sesión iniciada y `run.signupType = "internal"`
- **When** pulso "Apuntarse"
- **Then** se crea un `RunAttendee`, el contador sube en 1 y el botón cambia
  a estado "Voy".

**US-8** (parcial). Como corredor, quiero unirme a un club.
- **Given** tengo sesión iniciada
- **When** pulso "Unirse al club" en la ficha
- **Then** se crea un `ClubMember` con rol `MEMBER`, el contador de miembros
  sube y el botón cambia a "Miembro".

**Reglas de negocio:**
- Sin sesión, cualquier acción de join redirige a `/acceso?next=<url actual>`.
- Join es idempotente — pulsar dos veces no crea duplicados (upsert).
- Leave elimina la fila si existe; no lanza error si no existía.
- Solo aplica a `signupType = "internal"` para carreras — `ExternalSignupButton`
  ya gestiona el caso `"external"` y **no lo tocas**.

---

## 9. Decisiones que debes tomar tú (documéntalas en `design.md`)

- **Cómo pasas el `runSlug`/`clubSlug` a las Server Actions**: ¿`bind(null, slug)`
  o `<input type="hidden">`? Elige el más legible y documenta.
- **Estado visual del botón de club tras unirse**: ¿"Miembro ✓", "Unido", o
  simplemente cambia de variante? Añade la clave al diccionario si decides texto nuevo.
- **Estado del `JoinClubButton` si `club-detail` no existía** al momento de
  implementar: documenta qué encontraste y qué integración queda pendiente.
- **Loading state**: ¿Muestras "…" o un spinner durante `pending`? Decide y
  aplica consistentemente en ambos botones.

---

## 10. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea el change con sus 4 ficheros
openspec/changes/add-membership-and-attendance/proposal.md
openspec/changes/add-membership-and-attendance/design.md
openspec/changes/add-membership-and-attendance/tasks.md
openspec/changes/add-membership-and-attendance/specs/membership-attendance/spec.md

# 2. Valida antes de implementar
openspec validate add-membership-and-attendance --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §11)
openspec validate add-membership-and-attendance --strict

# 5. Archiva
openspec archive add-membership-and-attendance -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (destapa las acciones que `run-detail` y `club-detail`
  dejaron como stubs; requiere `auth` archivado), qué cambia (Server Actions,
  dos botones, modificación de la página de carrera), `## Non-goals` con los
  puntos del §7, estado de dependencia con `club-detail`.

- **`design.md`**: las decisiones del §9, el flujo de auth (redirect vs guard en
  la Server Action), la estrategia de idempotencia (upsert/deleteMany), cómo
  `revalidatePath` refresca el contador sin estado cliente, y el estado de
  integración de `JoinClubButton` en el momento de implementar.

- **`tasks.md`**: grupos sugeridos — (1) Server Actions (`lib/actions/attendance.ts`),
  (2) `JoinRunButton` reescritura, (3) `JoinClubButton` nueva firma,
  (4) Integración en `app/carreras/[slug]/page.tsx`, (5) Integración en
  `app/clubs/[slug]/page.tsx` (si existe), (6) i18n, (7) Verificación.

- **`specs/membership-attendance/spec.md`**: formato OpenSpec
  (`## ADDED Requirements` → `### Requirement: ...` → `#### Scenario: ...`).
  **Recuerda (lección de changes anteriores):** cada enunciado de requisito
  **MUST** o **SHALL** en inglés (RFC 2119) o `openspec validate --strict`
  fallará.

  Requisitos mínimos: join/leave carrera con sesión activa, join/leave club
  con sesión activa, idempotencia de join, redirección a `/acceso` sin sesión,
  no afectar `ExternalSignupButton`.

---

## 11. Verificación (no te limites a "compila")

1. **Confirma PostgreSQL real** y que hay carreras futuras con `status=SCHEDULED`.
   Si no hay, ejecuta el cron de generación primero:
   ```bash
   curl -X POST http://localhost:3000/api/cron/generate-runs \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

2. **Flujo apuntarse (carrera interna)**:
   - Sin sesión: abre `/carreras/<slug>` → el botón "Apuntarse" debe ser un link
     a `/acceso?next=/carreras/<slug>`. Al pulsar, redirige a login.
   - Con sesión: el botón "Apuntarse" es un `<form>`. Al pulsarlo, la página
     recarga con el botón en estado "Voy" y el contador de asistentes subió en 1.
   - Pulsar "Voy" (leave): el contador baja, el botón vuelve a "Apuntarse".
   - Pulsa "Apuntarse" dos veces rápido — el contador no debe aumentar en 2.
   - Comprueba en la BD: `SELECT * FROM "RunAttendee" WHERE "userId" = '...'`.

3. **Flujo unirse al club** (si `app/clubs/[slug]/page.tsx` existe):
   - Mismo flujo que carreras pero con `ClubMember`.
   - Verifica que el rol es `MEMBER` en la BD.

4. **Verificar que no se rompe el caso `external`**: en una carrera con
   `signupType = "external"`, `JoinRunButton` **no debe renderizarse** —
   `ExternalSignupButton` sigue apareciendo y funcionando.

5. **`npm run build`** y **`npm run lint`** pasan sin errores nuevos.
   Presta atención a que el tipado de `JoinRunButton` sea correcto (TypeScript
   estricto: `userId: string | null`, no `userId?: string`).

6. Marca todas las casillas de `tasks.md`, ejecuta
   `openspec validate add-membership-and-attendance --strict` y archiva con
   `openspec archive add-membership-and-attendance -y`.

---

## 12. Qué NO hacer

- No añadas `useOptimistic` o estado cliente local para el contador de
  asistentes — `revalidatePath` es suficiente y mantiene el Server Component
  como fuente de verdad. Si lo implementas de todos modos, documenta el
  tradeoff en `design.md`.
- No modifiques `RunAttendees.tsx` — se re-renderiza sola al refrescar la ruta.
- No uses Route Handlers para las acciones de join/leave.
- No cambies `getRunBySlug` ni los tipos de `RunDetail` — `isAttending` es
  contexto de sesión, no dato del recurso.
- No marques una tarea como completada si no la has verificado de verdad.
- No ignores el caso `external`: si una carrera tiene `signupType = "external"`,
  `JoinRunButton` no debe aparecer en la página.

---

## 13. Formato de tu informe final al usuario

Resume: qué Server Actions se crearon, cómo se pasa el slug a la acción
(bind vs hidden input), si `club-detail` existía al implementar y si integraste
`JoinClubButton`, qué verificaste de verdad (incluye el estado de la BD tras
las acciones), confirmación de `openspec validate` y `openspec archive`
completados, y propón `club-onboarding` (si `auth` y `membership-attendance`
ya están archivados) como siguiente capability del roadmap.
