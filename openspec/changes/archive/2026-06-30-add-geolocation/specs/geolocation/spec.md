## ADDED Requirements

### Requirement: Coordenadas de referencia por ciudad
El sistema MUST disponer de coordenadas geográficas reales para las 20 ciudades
españolas soportadas, utilizables para calcular proximidad.

#### Scenario: Ciudades con coordenadas
- **WHEN** se consulta `CITY_DETAILS` para cualquiera de las 20 ciudades
- **THEN** cada entrada MUST incluir `lat` y `lng` numéricos válidos

### Requirement: Cálculo de distancia y ciudad más cercana
El sistema MUST calcular la distancia en kilómetros entre dos puntos (Haversine) y
MUST determinar la ciudad española más cercana a unas coordenadas dadas.

#### Scenario: Distancia entre Madrid y Barcelona
- **WHEN** se calcula `getDistanceKm` entre Madrid (40.4168, -3.7038) y Barcelona (41.3851, 2.1734)
- **THEN** el resultado MUST estar en el orden de magnitud de ~500 km (400–600 km)

#### Scenario: Ciudad más cercana a Valencia
- **WHEN** se invoca `findNearestCity` con coordenadas de Valencia (39.4699, -0.3763)
- **THEN** MUST devolver la `CityInfo` con slug `valencia`

### Requirement: Componente GeolocationCard
El componente `GeolocationCard` MUST solicitar la ubicación del navegador y MUST
exponer la ciudad más cercana vía callback, con manejo de estados de carga y error.

#### Scenario: Permiso concedido
- **WHEN** el usuario pulsa «Usar mi ubicación» y concede permiso del navegador
- **THEN** el componente MUST calcular la ciudad más cercana y MUST invocar
  `onNearestCity(city)` con esa ciudad

#### Scenario: Permiso denegado o geolocalización no disponible
- **WHEN** el usuario deniega el permiso o `navigator.geolocation` no está disponible
- **THEN** MUST mostrarse un mensaje no bloqueante de error y MUST NOT invocar
  `onNearestCity`

#### Scenario: Estado de carga
- **WHEN** se está obteniendo la ubicación del navegador
- **THEN** MUST mostrarse un indicador de carga no bloqueante

### Requirement: Aplicación de ciudad como filtro en /carreras
En la página `/carreras`, al detectar la ciudad más cercana, el sistema MUST
aplicarla como filtro de ciudad en la URL y MUST filtrar los resultados en
consecuencia.

#### Scenario: Filtro aplicado tras geolocalización
- **WHEN** `GeolocationCard` invoca `onNearestCity` con slug `valencia` en `/carreras`
- **THEN** la URL MUST incluir `city=valencia` y el listado MUST mostrar solo
  carreras de clubs de Valencia

#### Scenario: Permiso denegado mantiene orden por defecto
- **WHEN** el usuario deniega el permiso de geolocalización en `/carreras`
- **THEN** los filtros y el orden del listado MUST permanecer sin cambios respecto
  al estado anterior

### Requirement: Preparación para coordenadas de entidad futuras
`lib/geolocation.ts` MUST priorizar coordenadas de entidad (`lat`/`lng`) cuando
existan, y MUST usar las coordenadas de la ciudad como respaldo cuando sean nulas.

#### Scenario: Entidad sin coordenadas
- **WHEN** se resuelven coordenadas de una entidad con `lat`/`lng` nulos y
  `citySlug` válido
- **THEN** MUST devolverse las coordenadas de la ciudad correspondiente en
  `CITY_DETAILS`
