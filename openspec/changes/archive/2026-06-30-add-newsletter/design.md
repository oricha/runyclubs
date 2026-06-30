## Contexto

Capability Fase 4. Conecta el stub del footer con `NewsletterSubscriber` en PostgreSQL.
Flujo 100% público.

## Decisiones

| Decisión | Elección |
|---|---|
| Backend | Server Action (no Route Handler) |
| Email duplicado | `upsert` + mensaje neutro si ya existía |
| Confirmación email | No en esta fase |
| Rate limiting | Comentario en Server Action; infra futura |
| Campo `city` | Schema lo tiene; formulario no lo pide |
| Auth | No requerida |

## Contrato `subscribeToNewsletter`

```ts
(email: string) => Promise<{
  success: boolean;
  alreadySubscribed: boolean;
  error?: string;
}>
```

1. Normalizar email (`trim`, lowercase).
2. Validar regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`.
3. `findUnique` para detectar duplicado antes de `upsert`.
4. `upsert` con `update: {}`.
5. Retornar flags; errores capturados en `try/catch`.

## UI del formulario

Estados: `idle` | `loading` | `success` | `duplicate` | `error`.  
React 19: `useState` + async call (no `useFormState`).

## Rate limiting

No hay middleware de rate limit en el proyecto. Comentario en `lib/actions/newsletter.ts`
indica que se añadirá a nivel de infraestructura (Vercel Firewall / edge).
