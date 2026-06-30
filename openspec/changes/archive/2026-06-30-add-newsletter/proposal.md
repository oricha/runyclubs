## Why

El footer ya muestra `NewsletterForm` como stub local sin persistencia. Los visitantes
deben poder suscribirse al boletín semanal de carreras; el modelo `NewsletterSubscriber`
existe desde `data-model` pero no hay backend conectado.

## What Changes

- `lib/actions/newsletter.ts` — Server Action `subscribeToNewsletter` con upsert idempotente.
- `components/marketing/NewsletterForm.tsx` — reemplazo del stub con llamada real.
- Claves i18n en `footer.*` para éxito, duplicado, error y loading.

## Capabilities

### New Capabilities

- `newsletter`: suscripción pública al boletín vía Server Action y formulario del footer.

### Modified Capabilities

_(ninguna)_

## Impact

- Escrituras en tabla `NewsletterSubscriber`.
- Sin auth, sin email de confirmación, sin Route Handler.

## Non-goals

- **No** email de confirmación (email-campaigns futuro).
- **No** admin de suscriptores (`admin-panel`).
- **No** campo `city` en el formulario.
- **No** Route Handler `/api/newsletter`.
- **No** doble opt-in ni unsubscribe.
