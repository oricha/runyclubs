## Contexto

Primer flujo self-service de alta de clubs. Depende de `auth` (middleware en
`/onboarding/*`) y modelos existentes en `data-model`. No hay migración Prisma.

## Arquitectura del wizard

Página única Client Component (`ClubWizard.tsx`) con `useState` para paso (0–4)
y estado acumulado. `page.tsx` (Server Component) pasa ciudades, tipos y ritmos.
Paso 6 implícito: pantalla de éxito tras `createClub` exitoso.

```
page.tsx → ClubWizard → steps/Step1..5
                      → SuccessScreen (inline)
actions.ts → createClub
```

## Decisiones

### Moderación: publicación inmediata

El club se crea con `verified: false` pero **visible** en el directorio. El campo
`verified` no filtra listados en esta fase. Simplicidad para lanzamiento; el panel
admin marcará clubs verificados más adelante.

### Tipos de carrera en Paso 1

Los tipos del club se seleccionan en **Paso 1 (Datos)** junto al nombre, ciudad
y ritmo. Son datos de identidad del club, no estética; el Paso 3 queda solo para
URLs de imagen.

### `generateRuns`: llamada global

Se llama `generateRuns()` **sin filtrar por club** tras la transacción. La función
es idempotente (upsert por slug) y no requiere cambiar su firma pública. Tradeoff:
procesa todas las `RecurringRun` activas (~segundos aceptables en onboarding).

### Validación de URL de imagen

Solo formato `URL.canParse(value)` o regex `/^https?:\/\//`. Sin fetch ni carga
de imagen en cliente para validar — preview opcional con `<img onError>` oculto.

### Convención `weekday`

Confirmado en `prisma/seed.ts` y `lib/recurring.ts`: `weekday` usa `Date.getDay()`
(0=domingo … 6=sábado). El `<select>` muestra días en orden español (lunes→domingo)
con valores 1–6, 0 como en `FilterSidebar`.

### Slug con colisiones

`slugify(name)` + bucle con sufijo `-1`, `-2`, … hasta slug único.

### Imágenes: URL externa

No upload en este change. Mejora futura: Vercel Blob o similar.

## Contrato `createClub`

```ts
CreateClubInput → validación → slug único → $transaction → generateRuns() → revalidatePath
CreateClubResult: { success: true, slug } | { success: false, error: string }
```

Transacción atómica: City lookup → Club → ClubType → RecurringRun[] → ClubMember OWNER.

Auth: `auth()` + redirect a `/acceso?next=/onboarding/club` si no hay sesión.

## Integración club-detail

`app/clubs/[slug]/page.tsx` puede no existir aún. La pantalla de éxito enlaza a
`/clubs/{slug}` de todos modos.
