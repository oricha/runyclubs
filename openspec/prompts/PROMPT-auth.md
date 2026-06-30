# Prompt de implementación — Capability `auth` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `auth` del proyecto RunClubs.es siguiendo
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
las 20 ciudades más importantes de España. Capabilities ya implementadas (confírmalo
con `openspec list --specs`): `design-system`, `data-model`, `recurring-runs`,
`runs-directory`, `run-detail`; posiblemente también `clubs-directory`,
`global-search` y `geolocation` dependiendo del avance del equipo paralelo.

### Stack exacto (no supongas versiones — lee `package.json` antes de añadir deps)

- **Next.js 16.2.9** con App Router. **No existen** `pages/` ni `pages/api/`.
- **React 19.2.7**, **TypeScript 5.9.3**
- **Prisma 7.8.0** con driver adapter (`@prisma/adapter-pg` + `pg.Pool`)
  — `lib/prisma.ts` usa `new PrismaPg(pool)`, **NO** hay `url = env("DATABASE_URL")`
  en el datasource del schema. Lee `lib/prisma.ts` antes de tocar el adapter de auth.
- **Tailwind CSS v3.4.19** (NO v4) con config JS (`tailwind.config.ts`).
- Los tokens de color son `hsl(var(--…))` definidos en `app/globals.css`.
- **`lib/i18n/es.ts`** — diccionario español con helper `t(template, vars)`.
- **Shadcn/ui** (Radix primitives) + `lucide-react` para componentes UI.

### Ficheros clave que debes leer antes de escribir código

| Fichero | Por qué |
|---|---|
| `prisma/schema.prisma` | Modelo `User` existente; debes añadir modelos NextAuth sin romper relaciones actuales |
| `lib/prisma.ts` | Singleton con driver adapter — el Prisma Adapter de Auth.js debe usar **la misma instancia** |
| `app/layout.tsx` | Dónde montar el `SessionProvider` (si hace falta en v5) |
| `components/layout/Header.tsx` | Tiene `<Link href="/cuenta">` hardcoded — deberás hacerlo condicional |
| `lib/i18n/es.ts` | Claves de i18n existentes (`nav.login`, `nav.account`) — añade las que falten |
| `package.json` | Versiones exactas; comprueba si `next-auth` ya fue instalado |

---

## 3. Modelo de datos actual — lo que existe y lo que hay que añadir

### `User` (ya existe — NO lo destruyas)

```prisma
model User {
  id            String        @id @default(cuid())
  name          String?
  email         String        @unique
  emailVerified DateTime?
  image         String?
  city          String?
  createdAt     DateTime      @default(now())
  memberships   ClubMember[]
  attendances   RunAttendee[]
  ownedClubs    Club[]        @relation("ClubOwner")
}
```

**Problema crítico:** el modelo `User` está sembrado con usuarios ficticios en
`prisma/seed.ts` (sin `Account`, `Session` ni `VerificationToken`). Los modelos
de NextAuth son **solo adiciones** al schema — no borres ni renombres ningún campo
existente. Las relaciones con `Club.ownerId`, `ClubMember.userId` y
`RunAttendee.userId` deben seguir funcionando.

### Modelos que debes añadir (estándar Prisma Adapter de Auth.js v5)

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

Y en el modelo `User` existente, añade las dos relaciones nuevas **sin tocar nada más**:

```prisma
  accounts      Account[]
  sessions      Session[]
```

Genera y aplica la migración con:

```bash
npx prisma migrate dev --name add-auth-tables
```

> **Importante:** la migración NO debe afectar a los datos sembrados de usuarios,
> clubs, carreras ni recurrencias. Si el entorno de desarrollo tiene datos reales,
> comprueba antes con `npx prisma migrate status`.

---

## 4. Decisión de librería — Auth.js v5 (`next-auth@beta`)

El ROADMAP dice «NextAuth.js». Para este proyecto con Next.js 16 + App Router,
**usa Auth.js v5** (paquete `next-auth@beta`), no NextAuth v4. Razones:

- App Router nativo: no necesita `pages/api/auth/[...nextauth]`.
- El helper `auth()` funciona en Server Components, Route Handlers y Middleware
  sin `getServerSession()`.
- TypeScript first, mismo `next-auth` package pero API diferente.

**Paquetes que debes instalar** (comprueba las versiones exactas disponibles
con `npm view <pkg> version` antes de fijar):

```bash
npm install next-auth@beta @auth/prisma-adapter
```

Versiones de referencia en el momento de escribir este prompt:
- `next-auth@beta` → mayor compatible con Next.js 16 App Router
- `@auth/prisma-adapter` → `2.x` (compatible con Auth.js v5, NO con v4)

**Si por cualquier razón Auth.js v5 tiene incompatibilidades bloqueantes** con
Next.js 16.2.9 que no puedas resolver, puedes caer a NextAuth v4 (`next-auth@4`)
con `@next-auth/prisma-adapter`. Documenta la decisión final en `design.md`.

---

## 5. Arquitectura de la capability

### 5.1 Configuración central — `auth.ts` (raíz del proyecto)

```ts
// auth.ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.EMAIL_FROM ?? "noreply@runclubs.es",
    }),
  ],
  pages: {
    signIn: "/acceso",
    error: "/acceso",
  },
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
```

> **Atención con el Prisma Adapter y el driver adapter:** `PrismaAdapter` espera
> una instancia de `PrismaClient`. La instancia en `lib/prisma.ts` usa
> `new PrismaPg(pool)` como driver adapter. Verifica que `PrismaAdapter` acepta
> esta instancia directamente; si no, puede que necesites exponer el cliente
> de forma ligeramente diferente. Lee el código de `lib/prisma.ts` antes de
> suponer cómo funciona.

### 5.2 Route handler — `app/api/auth/[...nextauth]/route.ts`

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

### 5.3 Página de login — `app/acceso/page.tsx`

- URL: `/acceso` (parámetro `?next=<url>` para redirección post-login).
- Dos acciones: «Continuar con Google» (OAuth) + «Continuar con Email» (magic link).
- El formulario de email llama `signIn("resend", { email, redirectTo: next ?? "/" })`.
- El botón de Google llama `signIn("google", { redirectTo: next ?? "/" })`.
- Si ya hay sesión activa, redirige directamente a `next` o a `/`.
- **Estética**: el doc 4 §5 menciona un vídeo de fondo en la pantalla de login.
  Implementa un fondo oscuro sólido (`bg-brand-accent` o similar) como alternativa
  sin coste de ancho de banda — documenta esta decisión en `design.md`. Si quieres
  el vídeo, usa un `<video>` autoplay muted loop con el vídeo de cottonbro studio
  (URL en `es.home.videoCredit`) solo si tienes la URL real disponible.
- Usa los tokens del design system: `font-serif` para el titular, botones con
  variantes del `Button` de `components/ui/button.tsx`.

### 5.4 Estado de sesión en el Header

`components/layout/Header.tsx` actualmente tiene:
```tsx
<Link href="/cuenta" aria-label={es.nav.account}>
  <User size={18} />
</Link>
```

Hazlo condicional según sesión. Dado que `Header` es un Client Component
(`"use client"`), necesitas pasar la sesión como prop desde el layout:

**Opción A (recomendada):** Convierte `Header` en un Server Component que llama
`auth()` internamente, y saca la lógica de `useState(searchOpen)` a un componente
hijo `HeaderClient`. Esto evita el `SessionProvider` y mantiene el patrón
server-first del proyecto.

**Opción B:** Añade `SessionProvider` a `app/layout.tsx` y usa `useSession()` en
el Header. Es más sencillo pero requiere marcar más superficie como `"use client"`.

Elige la opción que mejor encaje con la arquitectura del proyecto y documéntala
en `design.md`. Cuando el usuario tiene sesión:
- El icono de usuario cambia por el avatar (`<img>` o `<Avatar>` del design system)
  o las iniciales del nombre.
- El enlace apunta a `/cuenta` igual que ahora.

Cuando no hay sesión, el enlace apunta a `/acceso`.

### 5.5 Middleware — `middleware.ts` (raíz del proyecto)

Protege las rutas que requieren autenticación. Por ahora (Fase 4):

```ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/cuenta/:path*", "/onboarding/:path*"],
};
```

Las rutas públicas (`/`, `/carreras`, `/clubs`, `/carreras/[slug]`, etc.) NO
requieren middleware. Si el usuario intenta acceder a una ruta protegida sin
sesión, Auth.js redirige automáticamente a `/acceso?callbackUrl=<url original>`.
Asegúrate de que el parámetro que usa Auth.js (`callbackUrl`) es compatible con
el `next` que espera tu página `/acceso` — o adapta la página de login para leer
ambos (`next ?? callbackUrl`).

### 5.6 TypeScript — ampliación del tipo `Session`

Auth.js v5 necesita que extiendas los tipos de `next-auth` para incluir `user.id`:

```ts
// types/next-auth.d.ts
import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

### 5.7 Variables de entorno

Documenta en `design.md` (sección «Variables de entorno requeridas»):

| Variable | Descripción | Cómo obtenerla |
|---|---|---|
| `AUTH_SECRET` | Secreto para firmar tokens JWT/sesiones | `openssl rand -base64 32` |
| `AUTH_URL` | URL base del proyecto (solo necesario en producción) | `https://runclubs.es` |
| `GOOGLE_CLIENT_ID` | ID de app OAuth de Google | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Secreto OAuth de Google | Google Cloud Console |
| `RESEND_API_KEY` | API key de Resend para magic links | resend.com |
| `EMAIL_FROM` | Dirección remitente | `noreply@runclubs.es` (debe ser dominio verificado en Resend) |

Crea o actualiza `.env.example` (no `.env`) con estas variables vacías para
documentar lo que necesita el proyecto.

---

## 6. Objetivo de este change

Implementar la capa de autenticación de RunClubs.es: **magic link por email**
(Resend) + **OAuth de Google**, con página de login en `/acceso`, middleware de
protección de rutas, y estado de sesión visible en el Header.

Este change es **fundacional para Fase 4**: `membership-attendance`,
`club-onboarding`, `user-account` y `admin-panel` dependen todos de que `auth`
esté archivado.

### Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance:**
- Migración Prisma: añadir `Account`, `Session`, `VerificationToken` y relaciones
  en `User` (sin romper datos existentes).
- `auth.ts` — configuración central de Auth.js v5.
- `app/api/auth/[...nextauth]/route.ts` — route handler.
- `app/acceso/page.tsx` — página de login con Google + magic link + parámetro `next`.
- `middleware.ts` — protección de `/cuenta` y `/onboarding`.
- `Header` actualizado: avatar/iniciales si hay sesión, `/acceso` si no.
- `types/next-auth.d.ts` — extensión del tipo `Session`.
- `.env.example` — documenta las variables requeridas.
- Claves de i18n que falten (p. ej. `auth.continueWithGoogle`,
  `auth.continueWithEmail`, `auth.emailSent`, `auth.checkYourInbox`).

**Non-goals explícitos (no los implementes aquí):**
- **No implementes `/cuenta`** (capability `user-account`, Fase 4 posterior).
- **No implementes** el botón funcional de "Unirse al club" ni "Apuntarse" —
  esos son de `membership-attendance`. Solo el guard de redirección a `/acceso`
  si no hay sesión.
- **No implementes** el wizard de alta de club (`/onboarding/club`) — eso es
  `club-onboarding`.
- **No implementes** el panel admin — eso es `admin-panel`.
- **No añadas** lógica de roles de plataforma (superadmin) — fuera de este alcance.
- **No implementes** recuperación de contraseña ni cambio de email — no existen
  contraseñas en este sistema (magic link only).
- **No construyas** un email de bienvenida — el magic link ya envía un correo;
  el de bienvenida es mejora futura.

---

## 7. Especificación funcional (PRD §6.7 — síguela con precisión)

**US-11.** Como usuario nuevo, quiero entrar sin crear contraseña.
- **Given** estoy en `/acceso?next=/clubs/mi-club`
- **When** elijo «Continuar con Email» e introduzco mi correo
- **Then** recibo un enlace mágico de un solo uso; al validarlo, mi sesión se
  crea y soy redirigido a la URL de `next`.

**US-12.** Como usuario, quiero entrar con mi cuenta de Google.
- **Given** estoy en `/acceso`
- **When** pulso «Continuar con Google» y autorizo en el popup de Google
- **Then** mi sesión se crea (o se vincula a cuenta existente por email) y soy
  redirigido a `next` o a `/`.

**Reglas de negocio:**
- Toda acción que requiera cuenta redirige a `/acceso?next=<url original>` si
  no hay sesión activa.
- Un mismo email puede tener tanto cuenta Google como cuenta magic-link vinculadas
  (Auth.js lo gestiona via `Account.provider`).

---

## 8. Decisiones que debes tomar tú (documéntalas en `design.md`)

- **Auth.js v5 vs NextAuth v4**: justifica la versión elegida y documenta si
  encontraste incompatibilidades.
- **PrismaAdapter y driver adapter**: cómo conectas el adapter de Auth.js con
  la instancia de Prisma que usa `PrismaPg(pool)`. Puede que necesites exponer
  el cliente de forma diferente o crear una segunda instancia solo para el adapter.
- **Server Component vs SessionProvider en Header**: cuál de las dos opciones
  del §5.4 elegiste y por qué.
- **`callbackUrl` vs `next`**: qué parámetro de URL usa tu página de login para
  la redirección post-login, y si difiere del default de Auth.js cómo lo adaptas.
- **Estrategia de sesiones**: database sessions (recomendado, más seguro, permite
  revocar) vs JWT (sin tabla `Session`). Si usas JWT, no necesitas el modelo
  `Session` — documenta el tradeoff y elige.
- **Fondo de la pantalla de login**: vídeo real vs fondo sólido `bg-brand-accent`.

---

## 9. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea el change con sus 4 ficheros
openspec/changes/add-auth-magic-link/proposal.md
openspec/changes/add-auth-magic-link/design.md
openspec/changes/add-auth-magic-link/tasks.md
openspec/changes/add-auth-magic-link/specs/auth/spec.md

# 2. Valida antes de implementar
openspec validate add-auth-magic-link --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §10) y vuelve a validar
openspec validate add-auth-magic-link --strict

# 5. Archiva
openspec archive add-auth-magic-link -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué se necesita auth (prerequisito de Fase 4),
  qué cambia (5 cambios principales: schema, config, route handler, página
  de login, middleware), impacto en capabilities dependientes, sección
  `## Non-goals` con los puntos del §6.

- **`design.md`**: las decisiones del §8, el mapa de rutas protegidas vs
  públicas, el flujo completo de magic link (usuario → formulario → Resend →
  email → callback → sesión), el flujo de Google OAuth, cómo se extiende el tipo
  `Session`, y las variables de entorno necesarias.

- **`tasks.md`**: agrupa en — (1) Migración Prisma + nuevos modelos,
  (2) Instalación de paquetes y `auth.ts`, (3) Route handler,
  (4) Página `/acceso`, (5) Middleware, (6) Header condicional,
  (7) Tipos TypeScript + i18n, (8) Verificación.

- **`specs/auth/spec.md`**: formato OpenSpec (`## ADDED Requirements` →
  `### Requirement: ...` → `#### Scenario: ...` con **WHEN**/**THEN**).
  **Recuerda (lección de changes anteriores):** cada enunciado de requisito
  debe contener **`MUST`** o **`SHALL`** en inglés (RFC 2119), aunque el resto
  de la frase esté en español, o `openspec validate --strict` fallará con
  «must contain SHALL or MUST».

  Requisitos mínimos: acceso magic link, acceso Google OAuth, redirección
  post-login con `next`, protección de rutas por middleware, estado condicional
  en Header, no sesión → redirección a `/acceso`.

---

## 10. Implementación y verificación (no te limites a "compila")

1. **Comprueba la BD real** (mismo `.env` que el resto de capabilities).
   Aplica la migración y confirma que las tablas `Account`, `Session` y
   `VerificationToken` existen con `\d` en `psql` o `npx prisma studio`.

2. **Verifica el flujo de Google OAuth** (si tienes credenciales de test):
   - Inicia el dev server (`npm run dev`).
   - Navega a `/acceso`.
   - Pulsa «Continuar con Google» → flujo OAuth → callback → sesión creada.
   - El Header muestra avatar/iniciales en lugar del icono de usuario anónimo.
   - Navega a `/cuenta` — si la página no existe todavía, muestra 404 (esperado),
     pero la ruta **no debe redirigir a `/acceso`** desde middleware (no estás
     protegiendo rutas que aún no existen — esto es correcto).

3. **Verifica el flujo de magic link** (si tienes `RESEND_API_KEY` real):
   - Introduce un email en el formulario de `/acceso`.
   - Resend envía el correo con el enlace.
   - El enlace valida la sesión y redirige.
   - Si no tienes API key real, documenta explícitamente en `design.md` qué no
     pudiste verificar y por qué.

4. **Verifica el middleware**:
   - Sin sesión: accede a `/cuenta` → debe redirigir a `/acceso?callbackUrl=...`
     (o `?next=...` según tu implementación).
   - Con sesión: accede a `/cuenta` → pasa el middleware (llega a 404 si la
     página no existe todavía).

5. **Verifica que las capabilities previas no se rompieron**:
   - `npm run build` pasa sin errores TypeScript.
   - `npm run lint` pasa sin warnings nuevos.
   - `/carreras` sigue funcionando (ruta pública, no protegida).
   - La migración no borró ni alteró filas existentes de `User`, `Club` o `Run`.

6. Marca todas las casillas de `tasks.md`, repite
   `openspec validate add-auth-magic-link --strict` y archiva con
   `openspec archive add-auth-magic-link -y`.

---

## 11. Qué NO hacer

- No borres ni renombres campos del modelo `User` existente.
- No reescribas `lib/prisma.ts` — úsalo tal cual está.
- No implementes las páginas ni endpoints de `membership-attendance`,
  `user-account`, `club-onboarding` ni `admin-panel`.
- No uses `pages/api/auth/[...nextauth]` — este proyecto usa exclusivamente
  App Router.
- No añadas `SessionProvider` si eliges la Opción A (Server Component Header).
- No marques una tarea como completada si no la has verificado de verdad.
- No crees un fichero `.env` con credenciales reales — solo `.env.example`.

---

## 12. Formato de tu informe final al usuario

Resume: versión de Auth.js elegida y por qué, decisión sobre driver adapter +
PrismaAdapter, estrategia de sesiones (database vs JWT), flujos verificados
(Google real / magic link real / simulado), cambios al Header, tablas añadidas
en BD, confirmación de que `openspec validate` y `openspec archive` se
completaron, y propón `membership-attendance` como siguiente capability
(Fase 4, ya tiene todos sus prerequisitos cubiertos una vez `auth` esté
archivado).
