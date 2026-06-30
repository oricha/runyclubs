# PROMPT: Implementar capability `legal-and-consent`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Tailwind CSS v3.4.19**.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
app/layout.tsx                — layout global donde integrar el banner de consentimiento
components/layout/Footer.tsx  — ya tiene links a /privacidad y /terminos
lib/i18n/es.ts               — para añadir claves legal.*
```

---

## Estado actual del repo

- `components/layout/Footer.tsx` ya tiene links a `/privacidad` y `/terminos` (revisando el Footer actual, estos links existen)
- No existen `app/privacidad/` ni `app/terminos/`
- No hay banner de cookies ni lógica de consentimiento

---

## Qué DEBES implementar

### 1. Página de Política de Privacidad `app/privacidad/page.tsx`

Server Component estático. Contenido RGPD/LOPD conforme a la ley española:

```typescript
export const metadata: Metadata = {
  title: "Política de Privacidad | RunClubs.es",
  description: "Información sobre el tratamiento de datos personales en RunClubs.es.",
  robots: { index: true, follow: false }, // No indexar pero sí rastreable
};
```

**Secciones mínimas obligatorias (RGPD Art. 13):**

1. **Responsable del tratamiento**
   - Nombre: RunClubs.es (identificar titular real o placeholder "RunClubs.es, S.L.")
   - Email de contacto: privacidad@runclubs.es (o placeholder)
   - DPO: no designado (pequeña empresa)

2. **Datos que recopilamos**
   - Datos de registro: email, nombre (via Google o magic link)
   - Datos de actividad: clubs a los que te unes, carreras a las que te apuntas
   - Datos opcionales: ciudad, imagen de perfil (proveniente del proveedor OAuth)
   - Newsletter: solo email y fecha de suscripción
   - Cookies: ver sección de cookies

3. **Finalidad y base legal**
   - Prestación del servicio (ejecución de contrato — Art. 6.1.b RGPD)
   - Newsletter (consentimiento explícito — Art. 6.1.a RGPD)
   - Estadísticas anónimas de uso (interés legítimo — Art. 6.1.f RGPD)

4. **Conservación de datos**
   - Cuenta activa: mientras el usuario no la cancele
   - Newsletter: hasta que el usuario se dé de baja
   - Logs de auditoría: 2 años

5. **Derechos del usuario (RGPD Arts. 15-22)**
   - Acceso, rectificación, supresión, portabilidad, limitación, oposición
   - Ejercer en: privacidad@runclubs.es
   - Reclamación ante AEPD: www.aepd.es

6. **Cookies** (ver también la política de cookies separada o incluirla aquí)

7. **Menores**
   - El servicio no está dirigido a menores de 16 años
   - No recopilamos conscientemente datos de menores

8. **Cambios en la política**
   - Notificación por email si cambios relevantes

**Renderiza el contenido con:**
```typescript
<article className="prose prose-neutral dark:prose-invert max-w-2xl mx-auto py-12">
  {/* contenido */}
</article>
```

Si `@tailwindcss/typography` no está instalado, usa `max-w-2xl mx-auto py-12 space-y-6` con headings y párrafos estilizados manualmente.

### 2. Página de Términos de Uso `app/terminos/page.tsx`

```typescript
export const metadata: Metadata = {
  title: "Términos de Uso | RunClubs.es",
  description: "Condiciones de uso del servicio RunClubs.es.",
  robots: { index: true, follow: false },
};
```

**Secciones mínimas:**

1. **Objeto del servicio**
   - RunClubs.es es un directorio de clubs de running en España
   - Facilita la conexión entre corredores y clubs; no organiza los eventos

2. **Registro y cuenta**
   - Edad mínima 16 años
   - Datos verídicos en el registro
   - Responsabilidad de la contraseña / acceso a la cuenta

3. **Uso del servicio**
   - Prohibiciones: spam, contenido ilegal, scraping masivo, suplantación
   - Los clubs son responsables de la veracidad de su información
   - RunClubs.es puede dar de baja clubs o usuarios que incumplan

4. **Contenido de usuarios**
   - Los clubs ceden a RunClubs.es licencia de uso del contenido publicado para mostrar el directorio
   - RunClubs.es no es responsable del contenido publicado por los clubs

5. **Exención de responsabilidad**
   - Las carreras son organizadas por terceros; RunClubs.es no es responsable de incidencias
   - Los datos de clima son orientativos

6. **Ley aplicable**
   - Legislación española, sometidas a tribunales de Madrid

7. **Contacto**
   - hola@runclubs.es

### 3. Banner de consentimiento de cookies `components/legal/CookieBanner.tsx`

**Client Component** con `localStorage` para persistir la elección.

```typescript
"use client";
import { useState, useEffect } from "react";
```

**Lógica:**
```typescript
const CONSENT_KEY = "runclubs_cookie_consent";

type ConsentStatus = "pending" | "accepted" | "rejected";

export function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
    setStatus(saved ?? "pending");
  }, []);

  if (status !== "pending") return null;

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setStatus("accepted");
    // Aquí se habilitaría analítica si se usara — placeholder comentado:
    // if (typeof window !== "undefined") window.__enableAnalytics?.();
  }

  function reject() {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setStatus("rejected");
  }

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 shadow-lg sm:p-6"
    >
      <div className="container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">
          Usamos cookies propias para el funcionamiento del servicio y, con tu
          consentimiento, cookies de analítica para mejorar la experiencia. Puedes
          ver más detalles en nuestra{" "}
          <a href="/privacidad" className="underline hover:opacity-70">
            política de privacidad
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={reject}
            className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted transition-colors"
          >
            Solo esenciales
          </button>
          <button
            onClick={accept}
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
```

### 4. Integrar `CookieBanner` en `app/layout.tsx`

Añade el banner al final del `<body>`, después de `{children}` y el footer:

```typescript
import { CookieBanner } from "@/components/legal/CookieBanner";

// En el JSX del layout:
<body>
  <Header />
  <main>{children}</main>
  <Footer />
  <CookieBanner />  {/* Añadir aquí */}
</body>
```

**MUST** asegurarse de que el banner NO bloquea la interactividad de la página (fixed bottom con `z-50`, el usuario puede interactuar con el contenido mientras el banner está visible).

### 5. Hook utilitario `hooks/useCookieConsent.ts`

Para que componentes puedan saber el estado del consentimiento:

```typescript
"use client";

import { useState, useEffect } from "react";

export type ConsentStatus = "pending" | "accepted" | "rejected";

const CONSENT_KEY = "runclubs_cookie_consent";

export function useCookieConsent(): ConsentStatus {
  const [status, setStatus] = useState<ConsentStatus>("pending");

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
    setStatus(saved ?? "pending");

    function handleStorageChange(e: StorageEvent) {
      if (e.key === CONSENT_KEY) {
        setStatus((e.newValue as ConsentStatus) ?? "pending");
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return status;
}
```

### 6. Claves i18n en `lib/i18n/es.ts`

```typescript
legal: {
  cookieBannerText:
    "Usamos cookies propias para el funcionamiento del servicio y, con tu consentimiento, cookies de analítica.",
  acceptAll: "Aceptar todas",
  essentialOnly: "Solo esenciales",
  privacyLink: "política de privacidad",
  privacyTitle: "Política de Privacidad",
  termsTitle: "Términos de Uso",
},
```

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Gestión granular de categorías de cookies (opcional, necesario/analítica/marketing)
- Integración real con Google Analytics / Plausible (depende de la decisión de analítica)
- GDPR delete de cuenta (se implementa desde user-account future iteration)
- Cookie preference center avanzado (con modal o pantalla separada)
- IAB TCF compliance (overshooting para MVP)

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| Persistencia consentimiento | `localStorage` con clave `runclubs_cookie_consent` |
| Opciones | "Aceptar todas" vs "Solo esenciales" (binario, sin granular) |
| Posición banner | `fixed bottom-0` — no bloquea contenido |
| Páginas legales | Static Server Components con prose |
| Analítica | Placeholder comentado (sin integración real aún) |
| AEPD | Mencionada como autoridad de control española |

---

## Verificación

- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `/privacidad` carga con contenido RGPD
- [ ] `/terminos` carga con términos de uso
- [ ] Banner aparece en primera visita (localStorage vacío)
- [ ] "Aceptar todas" → banner desaparece + localStorage `accepted`
- [ ] "Solo esenciales" → banner desaparece + localStorage `rejected`
- [ ] Banner NO reaparece al recargar si ya se eligió
- [ ] Links en footer `/privacidad` y `/terminos` funcionan
- [ ] Banner es accesible: `role="dialog"`, `aria-label`, botones con texto descriptivo
