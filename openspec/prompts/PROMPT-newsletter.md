# PROMPT: Implementar capability `newsletter`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Prisma 7.8.0** con driver adapter (`@prisma/adapter-pg`) · **Tailwind CSS v3.4.19** · **Auth.js v5** (`next-auth@beta`) · **Resend** para email.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit; fallará si no hay modal verb en cada requirement.

### Archivos críticos que DEBES leer antes de empezar

```
prisma/schema.prisma          — modelo NewsletterSubscriber (ya existe, línea ~226)
components/marketing/NewsletterForm.tsx — componente UI existente (stub sin backend)
components/layout/Footer.tsx  — importa NewsletterForm; muestra título + texto
lib/i18n/es.ts               — claves footer.subscribe, footer.emailPlaceholder,
                               footer.newsletterTitle, footer.newsletterText (ya existen)
app/api/                     — estructura de Route Handlers existente
lib/prisma.ts                — singleton Prisma con driver adapter (importa de aquí)
```

---

## Estado actual del repo

### `NewsletterSubscriber` en `prisma/schema.prisma`

El modelo ya existe — **NO lo crees de nuevo**:

```prisma
model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  city      String?
  createdAt DateTime @default(now())
}
```

### `components/marketing/NewsletterForm.tsx` (STUB — reemplazar)

El componente existe pero es UI pura sin backend:
- `handleSubmit` solo hace `setStatus("submitted")` localmente
- El comentario en el archivo dice: _"el envío real a /api/newsletter se implementa en la capability `newsletter`"_
- Tienes que **reemplazar** esta implementación con llamada real al Server Action

### `components/layout/Footer.tsx`

Importa `NewsletterForm` y la renderiza con título + texto. **No modificar Footer.tsx** — tu trabajo es hacer que `NewsletterForm` funcione correctamente.

---

## Qué DEBES implementar

### 1. Server Action `subscribeToNewsletter`

Crea `lib/actions/newsletter.ts`:

```typescript
"use server";

export async function subscribeToNewsletter(email: string): Promise<{
  success: boolean;
  alreadySubscribed: boolean;
  error?: string;
}>;
```

- MUST validar que `email` sea un email válido (regex mínima: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) antes de tocar la base de datos
- MUST usar `prisma.newsletterSubscriber.upsert`:
  ```typescript
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    create: { email },
    update: {}, // si ya existe, no cambiar nada — solo confirmar
  });
  ```
- MUST retornar `{ success: true, alreadySubscribed: false }` si se crea
- MUST retornar `{ success: true, alreadySubscribed: true }` si el email ya existía en BD
- MUST retornar `{ success: false, error: "..." }` si hay error de validación o BD
- MUST capturar errores con `try/catch` y nunca lanzar al cliente
- NO se requiere sesión de usuario — es flujo público
- NO enviar email de confirmación en esta capability (pertenece a un email-campaigns agent futuro)

### 2. Actualizar `components/marketing/NewsletterForm.tsx`

Reemplaza el stub con implementación real:

```typescript
"use client";
```

**Props:** ninguna (el componente es standalone, obtiene todo del contexto).

**Comportamiento:**
- MUST llamar al Server Action `subscribeToNewsletter(email)` al hacer submit
- MUST mostrar estado de loading durante la llamada (deshabilitar botón + input)
- MUST mostrar mensaje de éxito si `success: true && !alreadySubscribed`
- MUST mostrar mensaje neutro si `success: true && alreadySubscribed` (ejemplo: "¡Ya estás suscrito! Te avisaremos de próximas carreras.")
- MUST mostrar error si `success: false` (mostrar `error` field o mensaje genérico)
- MUST validar email en cliente también (atributo `type="email"` + `required` + validación básica antes de enviar)
- NO usar `useFormState` (deprecated en React 19) — usar `useState` + async call directa
- MUST mantener el estilo visual existente: `flex max-w-sm flex-col gap-2 sm:flex-row`, Input con `rounded-full`, Button `shrink-0`

**Estados UI:**
```
"idle"       → formulario normal
"loading"    → botón disabled con texto "Enviando..." o spinner, input disabled
"success"    → mensaje éxito, ocultar formulario
"duplicate"  → mensaje neutro "Ya estás suscrito", ocultar formulario
"error"      → mantener formulario visible + mensaje de error en rojo
```

### 3. Añadir claves i18n a `lib/i18n/es.ts`

Añade dentro del objeto `footer` (ya existe) las claves que falten:

```typescript
// Dentro de footer: { ... }
subscribeSuccess: "¡Gracias! Te avisaremos de las próximas carreras.",
subscribeDuplicate: "¡Ya estás suscrito! Te avisaremos de las próximas carreras.",
subscribeError: "Algo salió mal. Inténtalo de nuevo.",
subscribeSending: "Enviando...",
```

Si `footer.subscribe` y `footer.emailPlaceholder` ya existen, no los toques.

### 4. Rate limiting (opcional pero recomendado)

Si el proyecto tiene middleware de rate limit o similar — úsalo. Si no, añade un comentario en el Server Action indicando que rate limiting se añadirá a nivel de infraestructura. **No bloquees la implementación por esto.**

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Envío real de email de confirmación (pertenece a email-campaigns)
- Gestión de suscriptores en admin panel (pertenece a `admin-panel`)
- Campo `city` en el formulario (está en el schema pero no en el flujo básico)
- API Route Handler `/api/newsletter` — **usa Server Action directamente**
- Preferencias de frecuencia o categorías de newsletter
- Doble opt-in o unsubscribe flow

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| Backend | Server Action (no Route Handler) |
| Email duplicado | Upsert silencioso + mensaje neutro |
| Confirmación por email | No en esta fase |
| Rate limiting | Comentario + infraestructura futura |
| Campo city | Schema lo tiene, formulario no lo pide |
| Auth requerida | No — flujo 100% público |

---

## Verificación

Antes de considerar la tarea completa:

- [ ] `npx openspec validate --strict` pasa sin errores
- [ ] `npx tsc --noEmit` sin errores de tipos
- [ ] El formulario en el footer renderiza correctamente en `localhost:3000`
- [ ] Enviar un email nuevo → BD tiene registro → mensaje de éxito visible
- [ ] Enviar el mismo email → no duplica en BD → mensaje neutro visible
- [ ] Email inválido → no llega al Server Action → error visible
- [ ] El stub antiguo `setStatus("submitted")` sin backend **no existe** en el archivo final
- [ ] `lib/actions/newsletter.ts` exporta `subscribeToNewsletter` como Server Action
- [ ] No hay console.error sin captura en el Server Action
