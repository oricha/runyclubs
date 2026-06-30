## Contexto

Widget reutilizable que recibe lat/lng y nombre de ciudad desde la página padre.
Open-Meteo gratuita sin API key.

## Decisiones

| Decisión | Elección |
|---|---|
| API | Open-Meteo forecast |
| Cache | `fetch` `revalidate: 3600` |
| Render | Server Component async |
| Errores | `null` → mensaje graceful |
| Unidades | Celsius |
| Días | 7 incluyendo hoy |

## UI

Cabecera: emoji + temp actual + ciudad. Grid 7 columnas, scroll horizontal en mobile.
Lluvia ≥20% amber, ≥60% blue.
