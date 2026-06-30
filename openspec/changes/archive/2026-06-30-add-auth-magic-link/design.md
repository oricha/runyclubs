## Contexto

Capability fundacional Fase 4. Auth.js v5 (`next-auth@beta`) sobre Next.js 16 App
Router con Prisma 7 driver adapter (`PrismaPg`).

## Decisión: Auth.js v5 (no v4)

Se usa `next-auth@5.0.0-beta.31` + `@auth/prisma-adapter@2.x`. App Router nativo,
helper `auth()` en Server Components y middleware sin `pages/api`. Compatible con
Next.js 16.2.9 en build local.

## Decisión: PrismaAdapter + driver adapter

`PrismaAdapter(prisma)` recibe la **misma instancia** exportada por `lib/prisma.ts`
(sin modificar ese fichero). Solo se importa en `auth.ts` (runtime Node).

## Decisión: Middleware sin Prisma (Edge)

`middleware.ts` usa `NextAuth(authConfig)` desde `auth.config.ts` **sin** adapter ni
`lib/prisma`, porque el middleware de Next.js no puede cargar `pg`/`node:util/types`.
La verificación de sesión en middleware usa la cookie de sesión + `AUTH_SECRET`.

## Decisión: Sesiones en base de datos

Estrategia **database sessions** (default con PrismaAdapter). Permite revocar
sesiones y alinea con modelos `Session`/`Account`. Tradeoff: consulta BD por
request autenticado; aceptable para este producto.

## Decisión: Header — Opción A (Server Component)

`Header.tsx` es Server Component que llama `auth()` y pasa la sesión a
`HeaderClient` (estado del modal de búsqueda). Evita `SessionProvider` y mantiene
el patrón server-first del proyecto.

## Decisión: Redirección post-login — `callbackUrl` + `next`

Auth.js middleware usa `callbackUrl`. La página `/acceso` lee ambos:
`redirectTo = next ?? callbackUrl ?? "/"`. Los botones/acciones pasan `redirectTo`
a `signIn(..., { redirectTo })`.

## Decisión: Fondo de login

Fondo sólido `bg-brand` (token `--brand-accent`, doc design system) — sin vídeo
para evitar dependencia de URL externa y ancho de banda. Tarjeta clara centrada
con tipografía `font-serif`.

## Mapa de rutas

| Ruta | Acceso |
|---|---|
| `/`, `/carreras`, `/clubs`, `/carreras/[slug]`, `/acceso` | Público |
| `/cuenta/*`, `/onboarding/*` | Middleware → `/acceso` si no hay sesión |

## Flujo magic link

1. Usuario en `/acceso?next=/carreras/foo` introduce email.
2. Server Action `signIn("resend", { email, redirectTo })`.
3. Resend envía enlace; Auth.js redirige a `/acceso/verificar`.
4. Usuario abre enlace → callback Auth.js → sesión en tabla `Session` → redirect a `redirectTo`.

## Flujo Google OAuth

1. Usuario pulsa «Continuar con Google» → `signIn("google", { redirectTo })`.
2. OAuth popup/redirect → callback → `Account` + `Session` → redirect.

## Variables de entorno requeridas

| Variable | Descripción | Cómo obtenerla |
|---|---|---|
| `AUTH_SECRET` | Firma de tokens/sesiones | `openssl rand -base64 32` |
| `AUTH_URL` | URL base (producción) | `https://runclubs.es` |
| `GOOGLE_CLIENT_ID` | OAuth Google | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Secreto OAuth Google | Google Cloud Console |
| `RESEND_API_KEY` | Magic links | resend.com |
| `EMAIL_FROM` | Remitente verificado | `noreply@runclubs.es` |

## Verificación en entorno local

- Migración aplicada; tablas `Account`, `Session`, `VerificationToken` creadas.
- Build y lint en verde; `/carreras` sigue público.
- Middleware: `/cuenta` sin sesión → redirect `/acceso?callbackUrl=...`.
- **Google OAuth / magic link con APIs reales:** dependen de credenciales en `.env`;
  si no están configuradas, flujos documentados como no verificados end-to-end.
