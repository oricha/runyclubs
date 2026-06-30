## ADDED Requirements

### Requirement: Obtención de datos meteorológicos
El sistema MUST obtener previsión de 7 días y clima actual desde Open-Meteo usando
coordenadas `lat`/`lng`, con cache de fetch de 1 hora.

#### Scenario: Petición exitosa
- **WHEN** se llama `getWeatherByCity(lat, lng)` con coordenadas válidas
- **THEN** MUST retornarse `WeatherData` con temperatura actual y 7 días de previsión

#### Scenario: Fallo de red o API
- **WHEN** la petición falla o la respuesta no es válida
- **THEN** `getWeatherByCity` MUST retornar `null` sin lanzar excepción

### Requirement: Cache de previsión
Las peticiones a Open-Meteo MUST usar `fetch` con `next: { revalidate: 3600 }`.

#### Scenario: Revalidación horaria
- **WHEN** se solicita clima para las mismas coordenadas dentro de una hora
- **THEN** Next.js MUST reutilizar la respuesta cacheada

### Requirement: Widget de clima por ciudad
El componente `WeatherWidget` MUST mostrar temperatura actual, emoji WMO y grid de
7 días con máx/mín y probabilidad de lluvia cuando hay datos.

#### Scenario: Datos disponibles
- **WHEN** `getWeatherByCity` retorna datos
- **THEN** MUST mostrarse cabecera con emoji, temperatura en °C y nombre de ciudad
- **THEN** MUST mostrarse 7 días con día abreviado, emoji, máx/mín y % lluvia si aplica

#### Scenario: Datos no disponibles
- **WHEN** `getWeatherByCity` retorna `null`
- **THEN** MUST mostrarse el mensaje «Clima no disponible» sin error visual agresivo

### Requirement: Colores de probabilidad de lluvia
El widget MUST resaltar probabilidad de lluvia ≥20% en amber y ≥60% en blue.

#### Scenario: Probabilidad moderada
- **WHEN** un día tiene probabilidad de lluvia ≥20% y &lt;60%
- **THEN** el porcentaje MUST mostrarse con estilo amber

#### Scenario: Probabilidad alta
- **WHEN** un día tiene probabilidad de lluvia ≥60%
- **THEN** el porcentaje MUST mostrarse con estilo blue

### Requirement: Skeleton de carga
El proyecto MUST incluir `WeatherWidgetSkeleton` para usar como fallback de Suspense.

#### Scenario: Carga del widget
- **WHEN** el widget está dentro de un boundary Suspense pendiente
- **THEN** MUST mostrarse el skeleton animado

### Requirement: Demo de verificación
El proyecto MUST incluir una ruta de demo que renderice `WeatherWidget` con coordenadas
de Madrid.

#### Scenario: Página demo
- **WHEN** se visita `/demo/weather`
- **THEN** MUST mostrarse el widget con datos de Madrid dentro de Suspense
