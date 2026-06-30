# PROMPT: Implementar capability `user-account`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Prisma 7.8.0** con driver adapter · **Tailwind CSS v3.4.19** · **Auth.js v5** (`next-auth@beta`).

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
prisma/schema.prisma          — modelos User, Club, ClubMember, Run, RunAttendee
auth.ts                       — exporta { auth } — usa en Server Components
auth.config.ts                — providers + callbacks; session.user.id disponible
middleware.ts                 — protege /cuenta/:path* ya configurado
types/next-auth.d.ts          — session.user.id: string tipado
lib/prisma.ts                 — singleton Prisma con driver adapter
lib/i18n/es.ts               — clave nav.account existe
types/index.ts                — tipos ClubSummary, RunSummary existentes
```

---

## Estado actual del repo

### Auth ya implementada

- `middleware.ts` protege `/cuenta/:path*` — usuarios no autenticados redirigen a `/acceso`
- `auth()` importado desde `@/auth` (NO desde `next-auth`) devuelve la sesión en Server Components
- `session.user.id` disponible y tipado (ver `types/next-auth.d.ts`)

### Modelos de datos relevantes

```prisma
model User {
  id            String       @id @default(cuid())
  name          String?
  email         String       @unique
  emailVerified DateTime?
  image         String?
  city          String?
  createdAt     DateTime     @default(now())
  memberships   ClubMember[]
  attendances   RunAttendee[]
  ownedClubs    Club[]       @relation("ClubOwner")
}

model ClubMember {
  id       String     @id @default(cuid())
  clubId   String
  userId   String
  role     MemberRole @default(MEMBER)  // OWNER | ADMIN | MEMBER
  joinedAt DateTime   @default(now())
  club     Club       @relation(...)
  user     User       @relation(...)
  @@unique([clubId, userId])
}

model RunAttendee {
  id       String   @id @default(cuid())
  runId    String
  userId   String
  joinedAt DateTime @default(now())
  run      Run      @relation(...)
  user     User     @relation(...)
  @@unique([runId, userId])
}
```

### No existe `app/cuenta/` todavía

Crearás toda la estructura desde cero.

---

## Qué DEBES implementar

### 1. Página de cuenta `app/cuenta/page.tsx`

Server Component. La ruta está protegida por middleware, pero MUST igualmente llamar `auth()` y hacer `redirect('/acceso')` si no hay sesión (doble garantía).

**Estructura de datos a cargar:**

```typescript
// clubs donde el usuario es miembro (incluyendo OWNER)
const memberships = await prisma.clubMember.findMany({
  where: { userId: session.user.id },
  include: {
    club: {
      select: {
        id: true, slug: true, name: true, logoUrl: true,
        city: { select: { name: true, slug: true } },
      },
    },
  },
  orderBy: { joinedAt: "desc" },
});

// carreras a las que está apuntado
const attendances = await prisma.runAttendee.findMany({
  where: { userId: session.user.id },
  include: {
    run: {
      select: {
        id: true, slug: true, title: true, startAt: true,
        location: true,
        club: { select: { name: true, slug: true } },
      },
    },
  },
  orderBy: { run: { startAt: "desc" } },
});
```

**Layout de la página:**

```
/cuenta
├── Sección cabecera: avatar (session.user.image o iniciales), nombre, email
├── Sección "Mis clubs" — lista de clubes con rol (OWNER badge si aplica)
│   └── Si vacío: "Aún no te has unido a ningún club"
│       + CTA "Explora clubs" → /clubs
├── Sección "Próximas carreras" — runs donde startAt >= now()
│   └── Si vacío: "No tienes carreras próximas"
│       + CTA "Descubre carreras" → /carreras
└── Sección "Carreras pasadas" — runs donde startAt < now()
    └── (ocultar sección si está vacía, o mostrar vacío sutil)
```

**Avatar fallback:** si `session.user.image` es null, MUST mostrar las iniciales del nombre (primera letra de nombre + primera letra de apellido si existe) en un círculo con `bg-muted`.

### 2. Sección de perfil con edición de nombre

Añade un Server Action para actualizar el nombre del usuario:

```typescript
// lib/actions/account.ts
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function updateUserName(name: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");
  
  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) return { error: "El nombre debe tener al menos 2 caracteres." };
  if (trimmed.length > 80) return { error: "El nombre no puede superar 80 caracteres." };
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });
  
  revalidatePath("/cuenta");
  return {};
}

export async function updateUserCity(city: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: { city: city || null },
  });
  
  revalidatePath("/cuenta");
  return {};
}
```

El formulario de edición MUST ser un Client Component pequeño (`"use client"`) que recibe el valor actual y usa `useState` + async call al Server Action. NO usar `useFormState` (deprecated en React 19).

### 3. Componentes UI requeridos

Crea los componentes mínimos necesarios:

**`components/account/AccountHeader.tsx`** (client, para inline edit del nombre):
- Muestra avatar (imagen o iniciales), nombre, email
- Botón "Editar nombre" que abre un `<input>` inline con guardar/cancelar
- Selector de ciudad (dropdown con `CITY_DETAILS` de `lib/cities.ts`) 

**`components/account/ClubMembershipCard.tsx`** (server):
- Logo del club (o placeholder con iniciales del nombre), nombre del club, ciudad
- Badge de rol si es OWNER (`"Fundador"`) o ADMIN (`"Admin"`)
- Link `href={/clubs/${club.slug}}`

**`components/account/RunAttendanceCard.tsx`** (server):
- Título de la carrera, fecha formateada, nombre del club, ubicación
- Badge "Próxima" (verde) vs "Pasada" (muted)
- Link `href={/carreras/${run.slug}}`

### 4. Claves i18n a añadir en `lib/i18n/es.ts`

```typescript
account: {
  title: "Mi cuenta",
  myClubs: "Mis clubs",
  myClubsEmpty: "Aún no te has unido a ningún club.",
  exploreClubs: "Explora clubs",
  upcomingRuns: "Próximas carreras",
  upcomingRunsEmpty: "No tienes carreras próximas.",
  discoverRuns: "Descubre carreras",
  pastRuns: "Carreras pasadas",
  editName: "Editar nombre",
  saveName: "Guardar",
  cancel: "Cancelar",
  namePlaceholder: "Tu nombre",
  cityLabel: "Tu ciudad",
  cityPlaceholder: "Selecciona tu ciudad",
  noCitySelected: "Sin ciudad",
  ownerBadge: "Fundador",
  adminBadge: "Admin",
  upcomingBadge: "Próxima",
},
```

---

## Avisos técnicos importantes

### `params` y `searchParams` son Promises en Next.js 16

```typescript
// CORRECTO en Next.js 16 App Router:
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  ...
}
```

### `auth()` en Server Components

```typescript
import { auth } from "@/auth";  // NO desde "next-auth"

const session = await auth();
if (!session?.user) redirect("/acceso");
const userId = session.user.id;  // tipado como string
```

### Formateo de fechas

Usa el patrón ya establecido en el proyecto. Comprueba si existe algún `formatDate` en `lib/` antes de crear uno nuevo. Si no existe, usa:
```typescript
const dateStr = new Intl.DateTimeFormat("es-ES", {
  weekday: "short", day: "numeric", month: "short",
}).format(new Date(run.startAt));
```

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Gestión de password o magic links (pertenece a `auth`)
- Borrar cuenta / GDPR delete (pertenece a `legal-and-consent`)
- Panel de gestión del club desde cuenta (pertenece a `admin-panel` y club-owner future)
- Preferencias de notificaciones
- Historial de pagos o plan Pro (pertenece a `monetization-billing`)
- Avatar upload — solo URL externa si el provider ya la da

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| Ruta | `/cuenta` (ya protegida por middleware) |
| Auth guard | `auth()` + redirect en Server Component además del middleware |
| Edición de nombre | Client component inline, Server Action |
| Roles visibles | Solo OWNER y ADMIN se marcan; MEMBER no tiene badge |
| Carreras split | Futuras vs pasadas por `startAt` |
| Ciudad del usuario | Campo opcional, selector de `CITY_DETAILS` |

---

## Verificación

- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `/cuenta` redirige a `/acceso` si no hay sesión
- [ ] `/cuenta` muestra nombre, email y avatar (o iniciales)
- [ ] Clubs con rol OWNER muestran badge "Fundador"
- [ ] Editar nombre persiste en BD y se refleja tras revalidatePath
- [ ] Cambio de ciudad persiste en BD
- [ ] Carreras separadas en futuras/pasadas correctamente
- [ ] Listas vacías muestran estados vacíos con CTAs
