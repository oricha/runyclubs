## 1. Server Actions

- [x] 1.1 Crear `lib/actions/attendance.ts` con `joinRun`, `leaveRun`, `joinClub`, `leaveClub`

## 2. JoinRunButton

- [x] 2.1 Reescribir `components/run/JoinRunButton.tsx` con props `runSlug`, `userId`, `isAttending`
- [x] 2.2 Link a `/acceso` sin sesión; forms con `bind` y `useFormStatus` con sesión

## 3. JoinClubButton

- [x] 3.1 Crear `components/club/JoinClubButton.tsx` con props `clubSlug`, `userId`, `isMember`
- [x] 3.2 Comentario de integración pendiente para `club-detail`

## 4. Integración carrera

- [x] 4.1 Actualizar `app/carreras/[slug]/page.tsx`: `auth()`, `isAttending`, props al botón

## 5. Integración club

- [x] 5.1 Integrar en `app/clubs/[slug]/page.tsx` si existe _(no aplica — pendiente club-detail)_

## 6. i18n

- [x] 6.1 Añadir `clubDetail.isMember` en `lib/i18n/es.ts`

## 7. Verificación

- [x] 7.1 Flujo join/leave carrera (sin sesión, con sesión, idempotencia)
- [x] 7.2 Verificar carrera `external` no muestra `JoinRunButton`
- [x] 7.3 `npm run build` y `npm run lint`
- [x] 7.4 `openspec validate add-membership-and-attendance --strict`
- [x] 7.5 Archivar change
