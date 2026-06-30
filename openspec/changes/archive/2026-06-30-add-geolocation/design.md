## Contexto

Capability Fase 3 (US-10). El usuario pulsa «Usar mi ubicación» y el sistema debe
mostrar resultados cercanos. Limitación de datos verificada: `prisma/seed.ts` no
asigna `lat`/`lng`; las `Run` generadas tampoco tienen coordenadas fiables.

## Decisión: Reinterpretación de US-10 a nivel de ciudad

El PRD habla de «reordenar por proximidad», pero sin coordenadas de entidad la
implementación visible MUST aplicar la **ciudad española más cercana** como filtro
(`?city=slug`) mediante `setSingle("city", slug)` — mismo mecanismo que
`FilterSidebar`. No se simula precisión punto-a-punto que los datos no soportan.

Cuando existan `lat`/`lng` en entidades, `resolveEntityCoords()` en
`lib/geolocation.ts` prioriza coordenadas de la entidad y cae a las de su ciudad.

## Origen de coordenadas

Copiadas tal cual de `4-runclubs-es-analisis-completo-nuevas-secciones.md` §9
(`CITY_COORDS`), integradas en `CityInfo` de `lib/cities.ts`.

## Fórmula Haversine

```ts
getDistanceKm(a, b) = 2 * R * asin(sqrt(
  sin²(Δφ/2) + cos(φ1)*cos(φ2)*sin²(Δλ/2)
))
```
Con `R = 6371` km. Distancia Madrid–Barcelona ≈ 504 km (orden de magnitud ~500 km).

## Decisiones

### Decisión: Coordenadas en `CityInfo`

Se añaden `lat` y `lng` obligatorios a `CityInfo` y se rellenan en cada entrada
de `CITY_DETAILS`. Los consumidores existentes (`FilterSidebar`, `Footer`) solo
usan `name`/`slug`/`region` — sin ruptura.

### Decisión: Callback de `GeolocationCard`

`onNearestCity(city: CityInfo)` — el componente calcula la ciudad con
`findNearestCity` internamente y delega la acción (filtro URL) al padre. Desacoplado
de `useRunFilters`.

### Decisión: Usuario lejos de España

Siempre se aplica la ciudad más cercana de las 20, sin mensaje especial ni
bloqueo. Si el usuario está fuera de España, verá la ciudad española más próxima
(p. ej. desde Lisboa → probablemente Badajoz/Cádiz no está en lista; será
Sevilla o similar).

### Decisión: Persistencia

Sin localStorage/cookies — estado local del componente únicamente.

### Decisión: Integración `/clubs`

`clubs-directory` no existe (`app/clubs/`, `lib/clubs.ts` ausentes). Queda
documentado como pendiente; `GeolocationCard` + `findNearestCity` listos para
reutilizar con el mismo patrón `setSingle("city", slug)`.

## Arquitectura

```
GeolocationCard → navigator.geolocation.getCurrentPosition
               → findNearestCity({ lat, lng })
               → onNearestCity(city)
RunsDirectoryClient → setSingle("city", city.slug)
                   → re-render Server Component /carreras
```
