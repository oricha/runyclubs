# PROMPT: Implementar capability `monetization-billing`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Prisma 7.8.0** con driver adapter · **Tailwind CSS v4.19** · **Auth.js v5**.

Esta capability es **Fase 6** — la más compleja del roadmap. Es una integración con Stripe para planes SaaS de clubs e inscripciones de pago.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
prisma/schema.prisma          — modelos Club, User, ClubMember, Run, RunAttendee
auth.ts                       — exporta { auth }
lib/prisma.ts                 — singleton Prisma con driver adapter
middleware.ts                 — protección de rutas
app/cuenta/page.tsx           — página de cuenta del usuario (para enlazar desde aquí)
lib/i18n/es.ts               — para añadir claves billing.*
types/index.ts                — tipos existentes
```

---

## Estado actual del repo

El esquema Prisma NO tiene `PlanTier`, `Subscription`, ni campos de Stripe. Los añadirás.

**Variables de entorno requeridas** (asegúrate de que el agente las documente en `.env.example`):
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...      # ID del precio mensual Pro en Stripe
STRIPE_BUSINESS_PRICE_ID=price_... # ID del precio mensual Business en Stripe
```

---

## Qué DEBES implementar

### 1. Instalar dependencias

```bash
npm install stripe @stripe/stripe-js
```

### 2. Schema additions en `prisma/schema.prisma`

```prisma
enum PlanTier {
  FREE
  PRO
  BUSINESS
}

model Subscription {
  id               String    @id @default(cuid())
  clubId           String    @unique
  club             Club      @relation(fields: [clubId], references: [id])
  tier             PlanTier  @default(FREE)
  stripeCustomerId String?
  stripeSubId      String?
  status           String    @default("active") // "active" | "past_due" | "canceled"
  currentPeriodEnd DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

Añade en modelo `Club`:
```prisma
subscription  Subscription?
```

Genera la migración:
```bash
npx prisma migrate dev --name add-subscription
```

### 3. `lib/stripe.ts` — cliente Stripe server-side

```typescript
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
  typescript: true,
});
```

### 4. Server Action para iniciar checkout `lib/actions/billing.ts`

```typescript
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

const PRICE_IDS: Record<string, string> = {
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "",
  BUSINESS: process.env.STRIPE_BUSINESS_PRICE_ID ?? "",
};
```

#### `createCheckoutSession(clubSlug: string, tier: "PRO" | "BUSINESS")`

```typescript
export async function createCheckoutSession(
  clubSlug: string,
  tier: "PRO" | "BUSINESS"
): Promise<{ url: string | null; error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  // Verificar que el usuario es OWNER del club
  const membership = await prisma.clubMember.findFirst({
    where: {
      club: { slug: clubSlug },
      userId: session.user.id,
      role: "OWNER",
    },
    include: { club: { include: { subscription: true } } },
  });

  if (!membership) return { url: null, error: "Solo el fundador puede cambiar el plan." };

  const club = membership.club;
  const priceId = PRICE_IDS[tier];
  if (!priceId) return { url: null, error: "Plan no disponible." };

  // Crear o recuperar Stripe Customer
  let customerId = club.subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: club.name,
      metadata: { clubId: club.id, clubSlug: club.slug },
    });
    customerId = customer.id;
  }

  // Crear Checkout Session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/cuenta?checkout=success&club=${clubSlug}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cuenta?checkout=canceled`,
    metadata: { clubId: club.id, clubSlug: club.slug, tier },
    subscription_data: {
      metadata: { clubId: club.id, tier },
    },
  });

  return { url: checkoutSession.url };
}
```

#### `createPortalSession(clubSlug: string)`

Para gestionar/cancelar suscripción desde el Stripe Customer Portal:

```typescript
export async function createPortalSession(
  clubSlug: string
): Promise<{ url: string | null; error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const membership = await prisma.clubMember.findFirst({
    where: {
      club: { slug: clubSlug },
      userId: session.user.id,
      role: "OWNER",
    },
    include: { club: { include: { subscription: true } } },
  });

  if (!membership?.club.subscription?.stripeCustomerId) {
    return { url: null, error: "No hay suscripción activa." };
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: membership.club.subscription.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/cuenta`,
  });

  return { url: portalSession.url };
}
```

### 5. Webhook handler `app/api/stripe/webhook/route.ts`

**CRÍTICO:** El webhook de Stripe MUST recibir el body raw (sin parsear como JSON), porque Stripe verifica la firma del payload original.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  const body = await req.text(); // raw text, no .json()
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { clubId, tier } = session.metadata ?? {};
      if (!clubId || !tier) break;

      const sub = session.subscription as string;
      const stripeSub = await stripe.subscriptions.retrieve(sub);

      await prisma.subscription.upsert({
        where: { clubId },
        create: {
          clubId,
          tier: tier as "PRO" | "BUSINESS",
          stripeCustomerId: session.customer as string,
          stripeSubId: sub,
          status: "active",
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
        update: {
          tier: tier as "PRO" | "BUSINESS",
          stripeCustomerId: session.customer as string,
          stripeSubId: sub,
          status: "active",
          currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const clubId = sub.metadata.clubId;
      if (!clubId) break;

      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: { status: "canceled", tier: "FREE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

**MUST deshabilitar bodyParser para este route** — en Next.js App Router el body raw se obtiene con `req.text()`, no es necesaria config adicional.

### 6. Página de pricing `app/precios/page.tsx`

Server Component estático. Muestra los planes con sus características.

```
/precios
├── Hero: "Planes para clubs de running"
│   └── Subtítulo: "Empieza gratis. Crece cuando estés listo."
│
├── Grid 3 columnas: Gratuito / Pro / Business
│   ├── Plan Gratuito (0€/mes)
│   │   ├── ✓ Perfil básico del club
│   │   ├── ✓ Hasta 2 recurrentes
│   │   ├── ✓ Inscripción externa (link)
│   │   └── CTA: "Empezar gratis" → /onboarding/club
│   │
│   ├── Plan Pro (29€/mes) [DESTACADO]
│   │   ├── ✓ Todo lo gratuito
│   │   ├── ✓ Recurrentes ilimitadas
│   │   ├── ✓ Inscripciones nativas
│   │   ├── ✓ Lista de espera
│   │   ├── ✓ Estadísticas básicas
│   │   ├── ✓ Badge "Verificado"
│   │   ├── ✓ Mejor posicionamiento
│   │   └── CTA: "Empezar Pro" → /cuenta (requiere sesión + ser owner de un club)
│   │
│   └── Plan Business (79€/mes)
│       ├── ✓ Todo lo Pro
│       ├── ✓ Dominio propio
│       ├── ✓ Export CSV
│       ├── ✓ Soporte prioritario
│       └── CTA: "Contactar" → mailto:hola@runclubs.es
│
└── FAQ de precios (acordeón Radix)
    ├── "¿Puedo cancelar en cualquier momento?"
    ├── "¿Hay permanencia?"
    └── "¿Qué pasa cuando cancelo?"
```

### 7. Componente de upgrade en cuenta `components/billing/UpgradeClubCard.tsx`

Client Component. Mostrar en `/cuenta` para owners de clubs en plan FREE.

```typescript
"use client";
// Props: { clubSlug: string; clubName: string }
// Muestra: "Tu club está en plan Gratuito. Actualiza a Pro para..."
// Botón: "Actualizar a Pro" → llama createCheckoutSession → redirect a URL de Stripe
```

### 8. Claves i18n en `lib/i18n/es.ts`

```typescript
billing: {
  plans: {
    free: "Gratuito",
    pro: "Pro",
    business: "Business",
  },
  upgradeTitle: "Actualiza tu club",
  upgradeSubtitle: "Accede a más funciones con el plan Pro.",
  upgradeCta: "Actualizar a Pro",
  managePlan: "Gestionar suscripción",
  currentPlan: "Plan actual",
  cancelAnytime: "Cancela cuando quieras",
  checkoutSuccess: "¡Suscripción activada! Bienvenido al plan Pro.",
  checkoutCanceled: "El proceso de pago fue cancelado.",
  onlyOwnerCanUpgrade: "Solo el fundador del club puede cambiar el plan.",
},
```

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Stripe Connect (comisiones de inscripciones de pago — US-28 es Fase 6 futura)
- Inscripciones de pago nativas (`Run.priceCents` — pertenece a fase posterior)
- Facturación / facturas PDF
- Prueba gratuita de 14 días (simplificar MVP)
- Descuentos o códigos de cupón
- Planes anuales (solo mensual en MVP)
- Dashboard de estadísticas Pro (mencionado como beneficio, pero la pantalla se implementa por separado)

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| Stripe | Checkout Session (no Elements) — simpler |
| Webhook | `app/api/stripe/webhook/route.ts` — raw body con `req.text()` |
| Customer Portal | Stripe hosted portal para gestionar/cancelar |
| Upgrade entry point | `/cuenta` + `/precios` |
| Stripe Connect | NO en MVP (comisiones en fase posterior) |
| Precios | 29€/mes Pro, 79€/mes Business (ajustable via Stripe dashboard) |
| Cancelación efecto | Al vencer `currentPeriodEnd`, webhook actualiza a FREE |

---

## Verificación

- [ ] `npx prisma migrate dev` sin errores (crea tabla `Subscription`)
- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `.env.example` documentado con todas las vars de Stripe
- [ ] `/precios` carga y muestra los 3 planes
- [ ] `createCheckoutSession` redirige al checkout de Stripe (con `STRIPE_SECRET_KEY` en test mode)
- [ ] Webhook endpoint recibe eventos sin error de firma (con `stripe listen --forward-to`)
- [ ] Evento `checkout.session.completed` → crea `Subscription` en BD
- [ ] Evento `customer.subscription.deleted` → pone tier a FREE en BD
- [ ] Usuario no-owner ve mensaje de error si intenta hacer upgrade
- [ ] `UpgradeClubCard` visible en `/cuenta` para owners en plan FREE
