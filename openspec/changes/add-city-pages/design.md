## Contexto

20 ciudades en `CITY_DETAILS` con `generateStaticParams`. Datos de BD opcionales:
si la ciudad no está en PostgreSQL, página vacía sin 404.

## Decisiones

| Decisión | Elección |
|---|---|
| Ruta | `/ciudades/[ciudad]` |
| 404 | Solo slug desconocido en `CITY_DETAILS` |
| Sin BD | Mostrar UI con listas vacías |
| Calendario | Grid semanal del mes actual, sin librería |
| Clima | WeatherWidget en sidebar con Suspense |
| FAQ | Dinámico + JSON-LD FAQPage |

## Layout

Hero + grid principal/sidebar (320px) + FAQ acordeón.
