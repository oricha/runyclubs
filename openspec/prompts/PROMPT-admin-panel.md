# PROMPT: Implementar capability `admin-panel`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Prisma 7.8.0** con driver adapter · **Tailwind CSS v3.4.19** · **Auth.js v5** (`next-auth@beta`).

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
prisma/schema.prisma          — modelos User (añadir isSuperAdmin), Club, ClubMember
auth.ts                       — exporta { auth }
middleware.ts                 — configurar protección de /admin/:path*
lib/prisma.ts                 — singleton Prisma con driver adapter
lib/i18n/es.ts               — para añadir claves de admin
types/next-auth.d.ts          — extender Session con isSuperAdmin
```

---

## Estado actual del repo

El esquema Prisma actual tiene `User` **sin** `isSuperAdmin`. El modelo `AdminAuditLog` tampoco existe. Los debes añadir mediante **migración**.

**NO existe** `app/admin/` ni `app/login/` — los crearás desde cero.

### Decisiones de diseño del PRD (§7.6 y §7.7)

**`isSuperAdmin` en User (PRD §7.6):**
```prisma
model User {
  // ...campos existentes...
  isSuperAdmin Boolean @default(false)  // <-- añadir
}
```

**`AdminAuditLog` (PRD §7.7):**
```prisma
model AdminAuditLog {
  id        String   @id @default(cuid())
  actorId   String
  actor     User     @relation(fields: [actorId], references: [id])
  action    String   // "club.create" | "club.disable" | "club.assign_owner"
  targetId  String?  // id del club afectado
  metadata  Json?
  createdAt DateTime @default(now())
}
```

**IMPORTANTE:** Añadir `AdminAuditLog` a `User` requiere relation inversa:
```prisma
model User {
  // ...
  adminAuditLogs AdminAuditLog[] @relation("AdminActor")
}
model AdminAuditLog {
  // ...
  actor  User   @relation("AdminActor", fields: [actorId], references: [id])
}
```

---

## Qué DEBES implementar

### 1. Migración de schema

Añade al `prisma/schema.prisma`:
1. Campo `isSuperAdmin Boolean @default(false)` en modelo `User`
2. Modelo `AdminAuditLog` completo (ver arriba)
3. Relación inversa `adminAuditLogs AdminAuditLog[]` en `User`

Genera la migración:
```bash
npx prisma migrate dev --name add-admin-panel
```

### 2. Extender session type en `types/next-auth.d.ts`

```typescript
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isSuperAdmin: boolean;  // <-- añadir
    } & DefaultSession["user"];
  }
}
```

### 3. Actualizar `auth.config.ts` para incluir `isSuperAdmin` en sesión

En el callback `session`, MUST incluir `isSuperAdmin` del usuario:

```typescript
callbacks: {
  session({ session, user }) {
    session.user.id = user.id;
    session.user.isSuperAdmin = (user as { isSuperAdmin?: boolean }).isSuperAdmin ?? false;
    return session;
  },
  authorized({ auth }) { return !!auth?.user; },
},
```

**Nota:** El `user` en el callback session viene de la BD via PrismaAdapter — incluye todos los campos del modelo `User`. El cast es necesario porque `AdapterUser` no conoce campos custom.

### 4. Actualizar `middleware.ts` para proteger `/admin`

Añade `/admin/:path*` al matcher:
```typescript
export const config = {
  matcher: ["/cuenta/:path*", "/onboarding/:path*", "/admin/:path*"],
};
```

### 5. Página admin `app/admin/page.tsx`

**RUTA OCULTA** — sin enlaces en la UI pública. El PRD establece que `/login` redirige a `/admin` si el usuario es superadmin (pero en la práctica el flujo es: el admin accede directamente a `/admin`, se le redirige a `/acceso`, y tras login vuelve a `/admin`).

**Guard de acceso:**
```typescript
const session = await auth();
if (!session?.user) redirect("/acceso?next=/admin");
if (!session.user.isSuperAdmin) redirect("/");  // redirige silenciosamente
```

**Estructura del panel:**

```
/admin
├── Header: "Panel de administración" (sin aparecer en nav pública)
├── Sección "Clubs" — tabla con:
│   ├── Nombre, ciudad, owner (email), verificado (✓/✗), activo (toggle)
│   ├── Acción "Asignar owner" — input email + botón
│   └── Acción "Dar de baja" — botón con confirmación
├── Sección "Dar de alta club" — formulario mínimo
│   ├── Nombre, ciudad (selector), owner (email del usuario)
│   └── Los campos opcionales (descripción, logo, etc.) se dejan vacíos
└── Sección "Log de auditoría" — lista de las últimas 50 acciones
    └── Columnas: fecha, actor (email), acción, target (nombre del club)
```

**Datos a cargar:**

```typescript
const clubs = await prisma.club.findMany({
  include: {
    city: { select: { name: true } },
    owner: { select: { email: true, name: true } },
    _count: { select: { members: true } },
  },
  orderBy: { createdAt: "desc" },
});

const auditLog = await prisma.adminAuditLog.findMany({
  take: 50,
  include: { actor: { select: { email: true } } },
  orderBy: { createdAt: "desc" },
});
```

### 6. Server Actions en `lib/actions/admin.ts`

```typescript
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
```

**Guard reutilizable (helper interno):**
```typescript
async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/acceso");
  if (!session.user.isSuperAdmin) redirect("/");
  return session.user;
}
```

#### `disableClub(clubId: string)`
- MUST cambiar `club.verified = false` (despublicar — no borrado físico)
- MUST registrar `AdminAuditLog { action: "club.disable", targetId: clubId, actorId }`
- MUST llamar `revalidatePath("/admin")` y `revalidatePath("/clubs")`

#### `enableClub(clubId: string)`
- MUST cambiar `club.verified = true`
- MUST registrar `AdminAuditLog { action: "club.enable", targetId: clubId, actorId }`

#### `assignClubOwner(clubId: string, ownerEmail: string)`
- MUST buscar usuario por email: `prisma.user.findUnique({ where: { email: ownerEmail } })`
- MUST retornar `{ error: "Usuario no encontrado" }` si no existe
- MUST ejecutar `prisma.$transaction`:
  1. `prisma.club.update({ where: { id: clubId }, data: { ownerId: newOwner.id } })`
  2. `prisma.clubMember.upsert({ where: { clubId_userId: { clubId, userId: newOwner.id } }, create: { clubId, userId: newOwner.id, role: "OWNER" }, update: { role: "OWNER" } })`
- MUST registrar `AdminAuditLog { action: "club.assign_owner", targetId: clubId, metadata: { newOwnerEmail: ownerEmail }, actorId }`

#### `createClubAsAdmin(data: { name: string; citySlug: string; ownerEmail: string })`
- MUST buscar ciudad por slug (`prisma.city.findUnique({ where: { slug: citySlug } })`)
- MUST buscar owner por email
- MUST retornar `{ error }` si falta ciudad o usuario
- MUST crear club con `verified: false` (requiere revisión manual tras alta)
- MUST crear `ClubMember` con rol OWNER
- MUST registrar `AdminAuditLog { action: "club.create", targetId: newClub.id, actorId }`
- MUST llamar `generateRuns()` de `lib/recurring.ts` tras crear el club
- Slug: usa `slugify(name)` de `lib/utils.ts` con manejo de colisión (añadir `-2`, `-3`, etc.)

### 7. Formularios del panel (Client Components)

Los formularios del panel MUST ser Client Components separados para evitar re-renders completos. Patrón:

```typescript
"use client";
// AssignOwnerForm, DisableClubButton, CreateClubForm — cada uno pequeño
// useState + async Server Action call directo (no useFormState)
```

`DisableClubButton` MUST incluir confirmación antes de ejecutar (puede ser `window.confirm` o un estado de confirmación inline — no instalar nuevas dependencias para esto).

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Gestión de usuarios (listar, banear usuarios) — fuera de scope
- Gestión de carreras desde admin (pertenece a un club-admin futuro)
- Dashboard con métricas / gráficos (pertenece a monetization-billing o fase posterior)
- Moderation queue / flujo de aprobación (el PRD dejó esto pendiente para admin-panel)
- Editar todos los campos de un club desde admin (solo alta básica + baja)
- Verificación de email del owner antes de asignar

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| Rol superadmin | `isSuperAdmin: Boolean` en `User` (no enum separado) |
| Acceso admin | Ruta `/admin` sin enlace en UI; `auth()` + check `isSuperAdmin` |
| Dar de baja club | Soft: `verified = false` (no borrado físico) |
| Dar de alta club | `verified: false` — requiere revisión manual posterior |
| Auditoría | `AdminAuditLog` con action string + targetId + metadata JSON |
| Confirmación de baja | `window.confirm` o estado inline — sin nuevas deps |
| Session isSuperAdmin | Incluido en callback session de auth.config.ts |

---

## Verificación

- [ ] `npx prisma migrate dev` sin errores — migración genera `isSuperAdmin` y `AdminAuditLog`
- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] Usuario sin sesión → `/admin` redirige a `/acceso?next=/admin`
- [ ] Usuario autenticado sin `isSuperAdmin` → `/admin` redirige a `/`
- [ ] Usuario con `isSuperAdmin: true` → ve el panel
- [ ] Acción "Asignar owner" con email no registrado → muestra error
- [ ] Acción "Dar de baja" → `club.verified` pasa a `false` + log en BD
- [ ] Cada acción crea una fila en `AdminAuditLog`
- [ ] Log de auditoría visible en panel con las últimas 50 entradas
- [ ] `/admin` NO aparece en Header, Footer, ni sitemap
