## 1. Capa de datos

- [x] 1.1 Ampliar `lib/runs.ts` con `getRunBySlug`, `getRunsAroundDate`, `mapClubToSummaryForRun`
- [x] 1.2 Script puntual para carrera externa de prueba (si no existe en BD)

## 2. i18n

- [x] 2.1 Añadir claves nuevas en `lib/i18n/es.ts` bajo `runDetail`

## 3. Componentes cabecera / meta / organizador

- [x] 3.1 `RunHeader.tsx`, `RunMeta.tsx`, `HostedByCard.tsx` (+ `OrganizerCard`)

## 4. Acciones

- [x] 4.1 `JoinRunButton.tsx`, `ExternalSignupButton.tsx`, `ShareRunButton.tsx`

## 5. Recomendaciones

- [x] 5.1 `MoreRunsInCity.tsx`, `RunsAroundDate.tsx`

## 6. Página + JSON-LD

- [x] 6.1 `app/carreras/[slug]/page.tsx` con metadata, JSON-LD y layout sidebar

## 7. Verificación

- [x] 7.1 Probar ficha real, externa, 404, JSON-LD, responsive
- [x] 7.2 `npm run build` y `npm run lint`
- [x] 7.3 Validar y archivar OpenSpec
