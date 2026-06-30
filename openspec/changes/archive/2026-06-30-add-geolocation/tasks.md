## 1. Coordenadas de ciudad

- [x] 1.1 Ampliar `CityInfo` y `CITY_DETAILS` en `lib/cities.ts` con lat/lng (doc 4 §9)

## 2. lib/geolocation.ts

- [x] 2.1 Implementar `getDistanceKm`, `findNearestCity` y `resolveEntityCoords`

## 3. GeolocationCard

- [x] 3.1 Crear `components/marketing/GeolocationCard.tsx` con estados y callback `onNearestCity`

## 4. i18n

- [x] 4.1 Añadir claves `geo.locating`, `geo.permissionDenied`, `geo.located` en `lib/i18n/es.ts`

## 5. Integración

- [x] 5.1 Integrar `GeolocationCard` en `RunsDirectoryClient.tsx` con `setSingle("city", slug)`
- [x] 5.2 Documentar integración `/clubs` pendiente de `clubs-directory`

## 6. Verificación

- [x] 6.1 Verificar Haversine Madrid–Barcelona (~500 km)
- [x] 6.2 Probar `/carreras` en navegador (geolocalización simulada y denegada)
- [x] 6.3 Ejecutar `npm run build` y `npm run lint`
- [x] 6.4 Validar y archivar change OpenSpec
