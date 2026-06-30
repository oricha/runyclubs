## 1. Server Action

- [x] 1.1 Crear `app/onboarding/club/actions.ts` con `createClub`, validación y transacción Prisma
- [x] 1.2 Slug único con colisiones, `generateRuns()` post-transacción, `revalidatePath`

## 2. Estructura wizard

- [x] 2.1 `app/onboarding/club/types.ts` — `WizardState`, `RecurrenciaInput`
- [x] 2.2 `app/onboarding/club/page.tsx` — Server Component con props estáticas
- [x] 2.3 `app/onboarding/club/ClubWizard.tsx` — navegación, estado, validación por paso

## 3. Pasos del wizard

- [x] 3.1 `steps/Step1Datos.tsx` — nombre, ciudad, descripción, tipos, ritmo
- [x] 3.2 `steps/Step2Recurrencias.tsx` — lista dinámica de recurrencias
- [x] 3.3 `steps/Step3Estilo.tsx` — URLs logo/cover con preview
- [x] 3.4 `steps/Step4Enlaces.tsx` — Instagram, Strava, web
- [x] 3.5 `steps/Step5Publicar.tsx` — resumen y botón publicar

## 4. Pantalla éxito + i18n

- [x] 4.1 Pantalla «¡Listo!» inline en `ClubWizard.tsx`
- [x] 4.2 Sección `onboarding.*` en `lib/i18n/es.ts`

## 5. Enlaces

- [x] 5.1 Verificar Footer apunta a `/onboarding/club` (sin cambios necesarios)

## 6. Verificación

- [x] 6.1 Redirect sin sesión, flujo BD, colisión slug
- [x] 6.2 Consultas BD: Club, RecurringRun, ClubMember, Run
- [x] 6.3 `npm run build` y `npm run lint`
- [x] 6.4 `openspec validate add-club-onboarding --strict` y archivar
