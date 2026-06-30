# Prompt de implementación — Capability `geolocation` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `geolocation` del proyecto RunClubs.es siguiendo
> **Spec-Driven Development con OpenSpec**. Léelo entero antes de escribir código.
>
> **Aviso:** este repo tiene varios changes avanzando en paralelo. Las rutas y
> firmas citadas aquí son una **foto fija** tomada justo antes de escribir este
> prompt — antes de dar nada por sentado, vuelve a comprobar con `ls`/`cat` el
> estado real de los ficheros mencionados.

---

## 1. Rol

Eres un **ingeniero full-stack senior** (Next.js App Router + Prisma + PostgreSQL +
TypeScript) que trabaja siguiendo metodología **Spec-Driven Development** con el
framework **OpenSpec**. Escribes código y documentación en **español**. No tomas
atajos: completas en orden el ciclo de vida de OpenSpec (proposal → specs →
design → tasks → implementación → validación → archivado).

---

## 2. Contexto del proyecto y estado actual del repo — LEE ESTO CON CUIDADO

**RunClubs.es** es un directorio social de clubs de running y carreras grupales en
las 20 ciudades más importantes de España. Capabilities **archivadas** en este
momento (confírmalo con `openspec list --specs`): `design-system`, `data-model`,
`recurring-runs`, `runs-directory`, `run-detail`. `global-search` puede estar en
curso o recién archivada — compruébalo, no te bloquea.

### ⚠️ Limitación de datos real (descubierta al inspeccionar el repo — no la ignores)

El esquema Prisma (`prisma/schema.prisma`) define `lat`/`lng` (`Float?`, nulables)
en `City`, `Club` (vía su carrera/recurrencias), `Run` y `RecurringRun`. **Pero
en este momento ningún registro sembrado tiene coordenadas reales** —
`prisma/seed.ts` no asigna `lat`/`lng` a ninguna ciudad ni recurrencia, y por
tanto tampoco las `Run` generadas por `recurring-runs`. Verifícalo tú mismo:
```bash
# debería devolver 0 o muy pocas filas
SELECT count(*) FROM "City" WHERE lat IS NOT NULL;
```
**Decisión de alcance obligatoria derivada de esto:** no existen coordenadas
fiables a nivel de club/carrera individual. Por tanto, "ordenar por proximidad"
en este change se implementa a **nivel de ciudad** (usando una tabla estática de
coordenadas reales de las 20 ciudades españolas — ver §3), no como un
reordenamiento punto-a-punto de resultados individuales. Esto es una limitación
de datos conocida y documentada, no un atajo que debas disculpar — pero el
código que escribas debe quedar preparado para usar coordenadas de entidad si
algún día existen (mira primero `item.lat`/`item.lng`; si son `null`, cae a las
coordenadas de su ciudad).

### Qué ya existe y debes reutilizar tal cual

- **`lib/cities.ts`** → `CITY_DETAILS: CityInfo[]` (20 ciudades, `name`/`slug`/`region`,
  **sin** lat/lng todavía) y `CITIES`. Vas a **ampliar** este fichero (no lo
  sustituyas) añadiendo las coordenadas reales — ver §3.
- **`hooks/useRunFilters.ts`** ya expone `setSingle(key, value)`, que es
  exactamente el mecanismo que usa `FilterSidebar` para fijar el filtro de
  ciudad (`setSingle("city", slug)`). Vas a reutilizar **ese mismo mecanismo**
  para aplicar "la ciudad más cercana" como filtro, en vez de inventar un sistema
  de reordenamiento paralelo.
- **`app/carreras/page.tsx`** delega en
  **`components/runs/RunsDirectoryClient.tsx`** (capability `runs-directory`,
  archivada), que ya renderiza un sidebar (`<div className="lg:w-64 lg:shrink-0"><FilterSidebar /></div>`)
  usando `useRunFilters`. Vas a **añadir** ahí el componente de geolocalización
  — es una modificación pequeña y justificada de un fichero de una capability
  archivada (no hay otra forma de cumplir US-10 en `/carreras`); no la uses como
  excusa para reescribir nada más de ese fichero.
- **`lib/i18n/es.ts`** ya tiene `geo.title` ("¿Dónde corres?") y
  `geo.useLocation` ("Usar mi ubicación"). Añade ahí las claves que falten (ver §5).

### Capability pendiente — compruébala, no la implementes tú

`clubs-directory` (página `/clubs`) **todavía no existe** en el momento de
escribir este prompt (`ls app/clubs/` no devuelve nada). Antes de integrar
geolocalización en `/clubs`:
```bash
ls app/clubs/ components/club/ lib/clubs.ts 2>&1
```
- **Si ya existe** (la otra capability avanzó mientras tanto): intégralo igual
  que en `/carreras`, siguiendo el mismo patrón.
- **Si no existe todavía:** no la construyas tú. Documenta en `design.md` que la
  integración en `/clubs` queda pendiente de que `clubs-directory` se complete, y
  deja `lib/geolocation.ts`/`GeolocationCard` ya listos para que esa integración
  sea trivial cuando llegue (no necesites volver a tocar este código).

### Fuera de alcance: la home real no existe todavía

`app/page.tsx` es hoy la página de demostración del sistema de diseño (creada en
`design-system`), no la home real con hero/buscador/contadores que describe el
PRD. **No reconstruyas la home en este change** — no hay todavía una capability
`home` en el ROADMAP que lo cubra. Limita tu integración visible a `/carreras`
(y `/clubs` si ya existe).

**Antes de escribir nada, lee también:**
1. `PRD-runclubs-es.md` **§6.6** (`geolocation` — US-10, criterios de aceptación)
   y **§13** (Fase 3).
2. `openspec/ROADMAP-FUNCIONALIDADES.md` — entrada **`add-geolocation`** (Fase 3).
3. `2-runclubs-es-documento-tecnico.md` **§9.7** (código de referencia de
   `GeolocationCard`: botón que llama a `navigator.geolocation.getCurrentPosition`
   y un callback `onLocate`).
4. `4-runclubs-es-analisis-completo-nuevas-secciones.md` **§9** — contiene la
   tabla `CITY_COORDS` con las coordenadas reales de las 20 ciudades españolas
   (originalmente documentada para el widget de clima, `weather-widget`, Fase 5,
   pero es exactamente la tabla que necesitas aquí). **Cópiala tal cual, son
   coordenadas reales**, no las inventes ni las redondees.

---

## 3. Objetivo de este change

Implementar la capability **`geolocation`**: un componente "¿Dónde corres?" con
botón "Usar mi ubicación" que, al conceder permiso, detecta la ciudad española
más cercana al usuario y la aplica como filtro de ciudad en `/carreras` (y
`/clubs` si ya existe), con manejo correcto del caso de permiso denegado.

### Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance de este change:**
- Ampliar `lib/cities.ts` con las coordenadas reales de §4 del doc 4 (añade
  `lat`/`lng` opcionales a `CityInfo` y rellénalos para las 20 ciudades, o
  exporta una constante `CITY_COORDS` separada — decide y documenta).
- `lib/geolocation.ts`:
  - `getDistanceKm(a: {lat:number;lng:number}, b: {lat:number;lng:number}): number`
    (fórmula de Haversine).
  - `findNearestCity(coords: {lat:number;lng:number}): CityInfo | null` —
    recorre `CITY_DETAILS` y devuelve la de menor distancia.
- `components/marketing/GeolocationCard.tsx` — basado en doc 2 §9.7, ampliado
  para manejar también el **error/denegación** (ver US-10, segundo escenario):
  - Estados: inicial, buscando ubicación, error (mensaje no bloqueante, no usar
    `alert()` ni bloquear la página), éxito.
  - Llama a `navigator.geolocation.getCurrentPosition(success, error)`; si
    `navigator.geolocation` no existe (contexto no seguro / navegador antiguo),
    trátalo igual que un error.
  - Al tener éxito, calcula la ciudad más cercana con `findNearestCity` y expone
    el resultado vía un callback `onNearestCity(city: CityInfo)` (o nombre
    equivalente que decidas) — la lógica de qué hacer con esa ciudad (aplicar
    filtro) vive en quien use el componente, no dentro de `GeolocationCard`
    (mantenlo desacoplado y reutilizable).
- Integración en `RunsDirectoryClient.tsx`: añade `<GeolocationCard>` en el
  sidebar (junto a `FilterSidebar`), y en su `onNearestCity` llama a
  `setSingle("city", city.slug)` (ya disponible vía `useRunFilters`).
- Integración equivalente en la página de clubs **si ya existe** (ver §2).
- Nuevas claves de i18n bajo `geo` para el estado de error (ver §5).

**Non-goals explícitos (no los implementes en este change):**
- **No** implementes reordenamiento punto-a-punto real de carreras/clubs
  individuales — no hay coordenadas fiables a ese nivel (ver limitación de
  datos arriba). Si quieres dejar la función `getDistanceKm` lista para ese uso
  futuro, perfecto, pero la funcionalidad visible de este change es por ciudad.
- **No** reconstruyas la home (`app/page.tsx`).
- **No** implementes `clubs-directory` si no existe todavía.
- **No** implementes geocodificación inversa (convertir coordenadas en una
  dirección legible) — solo necesitas la ciudad más cercana de una lista cerrada
  de 20.
- **No** persistas la ubicación del usuario (localStorage/cookies/sesión) —
  queda en estado de componente para esta fase; es una mejora opcional futura,
  no un requisito de US-10.

---

## 4. Especificación funcional (PRD §6.6 — síguela con precisión)

**US-10.** Como corredor, quiero ver lo más cercano a mi ubicación actual.
- **Given** estoy en la home o en `/carreras`/`/clubs`
- **When** pulso "Usar mi ubicación" y concedo permiso del navegador
- **Then** los resultados se reordenan por proximidad a mis coordenadas.
  *(Reinterpretado según la limitación de datos: se aplica como filtro de la
  ciudad más cercana — documenta esta reinterpretación explícitamente en
  `design.md` como una Decisión, citando la falta de coordenadas reales.)*
- **Given** deniego el permiso
- **Then** el sistema muestra un mensaje no bloqueante y mantiene el orden por
  defecto (sin geolocalizar).

---

## 5. Decisiones que debes tomar tú (documéntalas en `design.md` como "Decisión")

- **Dónde viven las coordenadas de ciudad:** ampliar `CityInfo` en `lib/cities.ts`
  o exportar `CITY_COORDS` aparte — cualquiera es válida si está bien tipada y
  no rompe los usos existentes de `CITY_DETAILS`/`CITIES` (revisa quién los
  importa antes de cambiar la forma del tipo).
- **Nombre y forma exacta del callback de `GeolocationCard`** (`onNearestCity`,
  `onLocate` + cálculo fuera, etc.) — prioriza que el componente sea reutilizable
  sin acoplarlo a `useRunFilters`.
- **Claves de i18n nuevas** bajo `geo` para el mensaje de error/denegación (p. ej.
  `geo.permissionDenied: "No se pudo acceder a tu ubicación. Mostrando todos los resultados."`,
  `geo.locating: "Buscando tu ubicación…"`) — sigue la convención existente del
  diccionario, usa el helper `t()` si necesitas interpolación.
- **Umbral de "está realmente cerca"**: decide si muestras algo distinto cuando
  la ciudad más cercana está muy lejos (p. ej. usuario fuera de España) o si
  simplemente aplicas la más cercana sin más; documenta tu elección.

---

## 6. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea la carpeta del change con sus 3 ficheros + delta de spec
openspec/changes/add-geolocation/proposal.md
openspec/changes/add-geolocation/design.md
openspec/changes/add-geolocation/tasks.md
openspec/changes/add-geolocation/specs/geolocation/spec.md

# 2. Valida antes de implementar
openspec validate add-geolocation --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §7) y vuelve a validar
openspec validate add-geolocation --strict

# 5. Archiva: promueve el delta a la spec vigente
openspec archive add-geolocation -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (depende de `data-model`/`runs-directory`; la
  limitación de coordenadas reales descrita arriba), qué cambia, capability
  `geolocation` (New Capability), impacto (modificación puntual y justificada de
  `RunsDirectoryClient.tsx`, archivo de una capability ya archivada), y una
  sección `## Non-goals` con los puntos del §3.
- **`design.md`**: la reinterpretación de US-10 a nivel de ciudad (Decisión
  explícita y justificada), el origen de `CITY_COORDS`/coordenadas (cítalo: doc 4
  §9), la fórmula de Haversine usada, y el resto de decisiones del §5.
- **`tasks.md`**: agrupa en algo como — (1) Coordenadas de ciudad en
  `lib/cities.ts`, (2) `lib/geolocation.ts` (distancia + ciudad más cercana),
  (3) `GeolocationCard`, (4) i18n nuevas claves, (5) Integración en
  `/carreras` (y `/clubs` si procede), (6) Verificación.
- **`specs/geolocation/spec.md`**: formato OpenSpec (`## ADDED Requirements` →
  `### Requirement: ...` → `#### Scenario: ...` con **WHEN**/**THEN**).
  **Recuerda (lección de los changes anteriores):** cada enunciado de requisito
  debe contener la palabra clave **`MUST`** o **`SHALL`** en inglés (RFC 2119)
  aunque el resto de la frase esté en español, o `openspec validate --strict` fallará.

  Requisitos mínimos a cubrir: detección correcta de la ciudad más cercana dadas
  unas coordenadas, aplicación de esa ciudad como filtro en `/carreras`, manejo
  no bloqueante de permiso denegado o geolocalización no disponible, mantenimiento
  del orden/filtros por defecto cuando se deniega.

---

## 7. Implementación y verificación (no te limites a "compila")

1. Confirma PostgreSQL real disponible (mismo `.env` que el resto de
   capabilities). Si no lo tienes, documenta qué no pudiste verificar.
2. Verifica los cálculos de distancia con casos conocidos: la distancia
   Haversine entre Madrid y Barcelona debe rondar los ~500 km (no exijas una
   cifra exacta, pero sí un orden de magnitud correcto) — escribe un pequeño
   script o prueba puntual, no asumas que la fórmula está bien solo porque compila.
3. Abre `/carreras` en un navegador (usa el MCP de Playwright si está disponible).
   Playwright permite simular geolocalización (`context.setGeolocation` /
   permisos) — úsalo para probar:
   - Conceder ubicación cercana a una ciudad conocida (p. ej. coordenadas de
     Valencia) → confirma que el filtro de ciudad se aplica a "Valencia" en la
     URL y en la UI, y que los resultados se filtran en consecuencia.
   - Denegar el permiso → confirma que aparece el mensaje no bloqueante y que
     el listado/filtros no cambian.
   - Revisa la consola del navegador: cero errores/warnings.
   - Comprueba responsive (1280px y ~390px).
4. Ejecuta `npm run build` y `npm run lint` del proyecto completo — deben
   seguir en verde, incluyendo que `/carreras` (de `runs-directory`) sigue
   funcionando tras tu modificación puntual.
5. Marca todas las casillas de `tasks.md`, repite
   `openspec validate add-geolocation --strict` y archiva con
   `openspec archive add-geolocation -y`. Confirma con `openspec list --specs`.

---

## 8. Qué NO hacer

- No implementes reordenamiento por distancia exacta de carreras/clubs
  individuales sin coordenadas reales — sería simular precisión que no existe.
- No reescribas `app/page.tsx` ni construyas una home nueva.
- No implementes `clubs-directory` si no existe todavía.
- No modifiques `RunsDirectoryClient.tsx` más allá de lo estrictamente necesario
  para integrar `GeolocationCard`.
- No marques una tarea como completada si no la has verificado de verdad.

---

## 9. Formato de tu informe final al usuario

Resume: qué se implementó, la decisión de reinterpretar "proximidad" a nivel de
ciudad y por qué, qué se verificó realmente (incluye los resultados de simular
geolocalización con Playwright), enlaces a los ficheros clave (`lib/geolocation.ts`,
`components/marketing/GeolocationCard.tsx`, cambios en `lib/cities.ts` y en
`RunsDirectoryClient.tsx`), confirmación de que `openspec validate` y
`openspec archive` se completaron, y propone la siguiente capability del roadmap
(`clubs-directory` si seguía pendiente, o `auth` para abrir la Fase 4) como
siguiente paso.
