# RunClubs.es — Especificación completa para clonar RunClubs.nl

> Documento de diseño y funcionalidad basado en el análisis de https://www.runclubs.nl/
> Objetivo: construir https://www.runclubs.es/ replicando estilo, menús, funcionalidades y estructura, adaptado a España.

---

## 1. Resumen del proyecto

RunClubs es un directorio/plataforma para descubrir clubs de running y carreras (group runs) en una ciudad. El usuario puede:
- Buscar clubs y carreras por ciudad, ritmo (pace), tipo de carrera y día de la semana.
- Ver carreras próximas (upcoming runs) en formato lista o cuadrícula.
- Ver la ficha de cada club y de cada carrera.
- Unirse a un club / apuntarse a una carrera ("Join club" / "Join this run").
- Los organizadores pueden añadir su club ("Add your club") mediante un onboarding.
- Anunciantes pueden promocionar marca/carrera ("Advertise here").

Para la versión española (.es), todo el contenido se traduce al castellano y los datos se centran en ciudades de España (Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza, etc.).

---

## 2. Identidad visual / Design tokens

### Tipografías
- **Titulares (H1, nombres de club/carrera):** `Instrument Serif`, serif. Peso 400, estilo normal. Tamaño grande (H1 ≈ 64px). Da el aspecto editorial elegante.
  - Nota: en la home el "Run Club" del titular va en *cursiva* (italic) mientras "Find your" va en redonda. Replicar ese contraste: una parte del título en italic.
- **Cuerpo y UI:** `Inter`, sans-serif. Pesos 400/500. Las etiquetas de sección (DATE, TIME, LOCATION…) van en mayúsculas, 11px, peso 500, con letter-spacing ligero.
- Cargar ambas desde Google Fonts.

### Paleta de colores (formato HSL tal como en el original)
| Token | HSL | Aprox HEX | Uso |
|---|---|---|---|
| --background | 40 20% 98% | #FBFAF9 | Fondo general (blanco hueso cálido) |
| --foreground | 30 10% 10% | #1C1A17 | Texto principal (casi negro cálido) |
| --primary | 30 10% 10% | #1C1A17 | Botones primarios (fondo oscuro) |
| --primary-foreground | 40 20% 98% | #FBFAF9 | Texto sobre botón primario |
| --secondary / --muted / --accent | 35 15% 93% | #EEEAE5 | Fondos suaves, chips |
| --muted-foreground | 30 8% 52% | #8A847C | Texto secundario/gris |
| --border | 35 15% 90% | #E7E2DC | Bordes sutiles |
| --ring | 30 10% 10% | #1C1A17 | Foco |
| --card | 0 0% 100% | #FFFFFF | Tarjetas |
| --destructive | 0 84.2% 60.2% | #EF4444 | Acciones destructivas |
| --radius | .5rem | | Radio de esquinas base |

El hero usa un tono rosado/malva cálido de fondo cuando carga (degradado/imagen). Acento de marca rojo oscuro (#3B1414) aparece en algunos textos de sección.

### Estilo general
- Estética minimalista, cálida, editorial. Mucho espacio en blanco.
- Botones primarios: fondo oscuro casi negro, texto claro, esquinas muy redondeadas (pill / rounded-full).
- Tarjetas blancas con bordes muy sutiles y sombras ligeras.
- Chips de tipo de carrera con emoji + texto (ej. "😊 Social", "🍺 Beer Run").
- Iconografía lineal (estilo Lucide / Feather).

---

## 3. Navegación (header)

Header tipo "pill" flotante centrado sobre el contenido, fondo claro translúcido con sombra suave.

- **Logo:** "RUNCLUBS®" en negro, tipografía bold condensada (logotipo). Enlaza a "/".
- Enlaces principales:
  - **Discover Runs** → /runs
  - **RunClubs** → /runclubs
- Iconos a la derecha:
  - **Calendars** (icono calendario) → calendarios por ciudad
  - **Search** (icono lupa) → abre modal de búsqueda (atajo ⌘K / Ctrl+K)
  - **Account options** (icono usuario) → menú de cuenta / login

Adaptación .es: "Discover Runs" → "Descubrir carreras"; "RunClubs" → "Clubs"; etc.

---

## 4. Páginas / rutas

### 4.1 Home ("/")
Estructura de arriba a abajo:
1. **Hero** con vídeo de fondo (corredores) y overlay oscuro. Botón de pausa de vídeo. Crédito de vídeo abajo a la derecha.
   - Titular grande: "Find your *Run Club*" (parte en italic).
   - Subtítulo: "We help you find the coolest run clubs in your city. Whether you're here to chat or sweat, we got you."
   - Barra de búsqueda central "Search clubs and runs…" con atajo ⌘K.
   - Contadores: "145 clubs" y "145 upcoming runs" (enlazan a /runclubs y /runs).
2. **Columna izquierda (sidebar):**
   - Tarjeta "Where do you run?" con botón "Use my location" (geolocalización).
   - Tarjeta de anuncio "Your brand here?" → "Advertise here" (/advertise).
   - Panel de **Filters** (City, Type of run [12], Pace [4], Day of week [7]) con "Clear all" y contador "100 clubs · 143 runs".
3. **Upcoming runs:** lista de carreras próximas (tarjetas con fecha en bloque día/mes, título, fecha completa, hora, ubicación, club, distancia, chips de tipo). Enlace "View all".
4. **Run Clubs:** cuadrícula de clubs destacados (tarjetas con logo, nombre, ciudad, frecuencia "2x/week", ritmo). Enlace "View all".
5. **Footer** (ver sección 6).

### 4.2 Discover Runs ("/runs")
- Titular "Upcoming Runs" (Instrument Serif).
- Subtítulo: "Find upcoming group runs across the Netherlands. Filter by city, pace, or type to find your next run." → adaptar a "…por toda España…".
- Toggle vista **cuadrícula / lista** (arriba a la derecha).
- Sidebar de filtros: buscador "Search runs…", "Find runs" / "Clear all", filtros: **City**, **Date** (This week / This month), **Type of run** [10], **Pace** [2], **Day of week** [7].
- Listado de carreras con el formato de tarjeta descrito (bloque fecha, hora, ubicación, club + avatar, distancia, ritmo, chips, nº de asistentes).
- Sección final: "Looking for runs in your city? Browse city running calendars…" → botón "City Running Calendars".

### 4.3 RunClubs ("/runclubs")
- Titular "Discover *Run Clubs*".
- Subtítulo: "145 clubs across the Netherlands. Find your crew." → adaptar.
- Toggle **Grid view / List view**.
- Botón destacado **"Add your club"** → /onboarding/runclub?mode=create.
- Sidebar con geolocalización, anuncio y buscador "Search clubs…".
- Tarjetas de club: imagen/logo, nombre, ciudad (icono pin), frecuencia (icono calendario, "2x/week"), ritmo (icono, "All paces"/"Beginner"), botón "Show club awards" (premios/medallas, p.ej. icono medalla 🥇 y rayo ⚡).

### 4.4 Ficha de club ("/runclubs/[slug]")
Ej: /runclubs/casa-dawn-run-club
- Enlace "← All clubs".
- Banner/cover + logo del club (avatar cuadrado redondeado superpuesto).
- Nombre del club (Instrument Serif, muy grande).
- Badge "Uses RunClubs.nl for signups" (con icono rayo) cuando el club usa la plataforma para inscripciones.
- Fila de avatares de miembros + "7 members".
- Descripción larga del club (con "Read more" colapsable). Soporta listas/bullets y emojis.
- **Sidebar derecha (sticky):**
  - Botón primario **"Join club"**.
  - Botón secundario **"Follow on Instagram"** (icono Instagram).
  - Bloque de metadatos: **RUNS** (ej. "Every Wednesday & Sunday"), **PACE** ("All paces"), **TYPE** (chips: 😊 Social, 😊 Beginner Friendly, 🏆 Founders), **MEMBERS** ("7 members"), **CITY** ("Rotterdam").
- **Upcoming runs** del club (lista).
- **More clubs nearby** (clubs cercanos) con "View all".

### 4.5 Ficha de carrera ("/runs/[slug]")
Ej: /runs/casadawn-sun-beginners-20260628-ab7477
- Enlace "← All runs".
- Título de la carrera (Instrument Serif, grande).
- **HOSTED BY:** tarjeta del club organizador (logo, nombre, nº miembros) que enlaza a su ficha.
- **ABOUT THIS RUN:** descripción.
- **X RUNNERS GOING:** avatares de los asistentes.
- **Sidebar derecha:**
  - Botón primario **"Join this run"**.
  - Botón secundario **"Share this run"** (icono compartir).
  - Metadatos: **DATE**, **TIME**, **LOCATION**, **DISTANCE** ("Not known yet" si falta), **PACE** ("Not known yet" si falta). Cada uno con su icono.

### 4.6 Otras rutas
- **/advertise** — landing para anunciantes.
- **/onboarding/runclub?mode=create** — alta de club (formulario multi-paso).
- **City Running Calendars** — calendarios por ciudad.
- **/blog** — blog.
- Páginas legales: **/privacy**, **/terms**.

---

## 5. Funcionalidades clave

1. **Búsqueda global** (modal con atajo ⌘K / Ctrl+K) sobre clubs y carreras.
2. **Geolocalización** ("Use my location") para ordenar/filtrar por cercanía.
3. **Filtros combinables:** ciudad, tipo de carrera, ritmo, día de la semana, fecha (esta semana / este mes). Con contador dinámico de resultados y "Clear all".
4. **Vistas alternables** lista / cuadrícula en /runs y /runclubs.
5. **Inscripciones:** "Join club", "Join this run" (requiere cuenta). Recuento de miembros/asistentes con avatares.
6. **Compartir carrera** (Share).
7. **Sistema de premios/medallas** de clubs ("Show club awards", badges como Founders 🏆, rayo ⚡, medalla 🥇).
8. **Onboarding de clubs** ("Add your club") para que organizadores publiquen su club y sus carreras recurrentes.
9. **Carreras recurrentes:** generación automática de instancias semanales (ej. "Every Wednesday & Sunday" genera muchas fechas futuras).
10. **Newsletter** ("Stay in the loop… Subscribe") en el footer.
11. **Publicidad** ("Advertise here" / "Your brand here?").
12. **Cuenta de usuario** (login / menú de cuenta).
13. **Feedback** widget flotante ("Feedback") abajo a la derecha.
14. **Calendarios por ciudad** y páginas SEO por ciudad y por tipo (Saturday/Sunday Run Clubs).

---

## 6. Footer

Newsletter arriba: "Stay in the loop with new club runs — One practical weekly update with upcoming runs from the community. No noise." + botón "Subscribe".

Columnas:
- **DISCOVER:** Home, Discover Runs, RunClubs, City Running Calendars, Saturday Run Clubs, Sunday Run Clubs, Blog.
- **RUN TYPES:** 😊 Social, 🏆 Founders, ⏱️ Performance, 🏔️ Trail Running, 😊 Beginner Friendly, 🏃 Long Run, 🙋‍♀️ Girls Only, 🏳️‍🌈 LGBTQI+, ❤️ Singles Run, 🌍 International.
- **CITIES (adaptar a España):** Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza, Granada… (el original lista Amsterdam, Rotterdam, Utrecht, Den Haag, Groningen, Eindhoven, Haarlem, Leiden).
- **COMPANY:** Partnerships, Add your club, Advertise.
- **FOLLOW US:** Instagram, LinkedIn, Strava.
- Línea inferior: "Runned by [nombre]", "Simple Analytics", Privacy, Terms.

---

## 7. Tipos de carrera (chips / taxonomía)

😊 Social · 🏆 Founders · ⏱️ Performance · 🏔️ Trail Running · 😊 Beginner Friendly · 🏃 Long Run · 🙋‍♀️ Girls Only · 🏳️‍🌈 LGBTQI+ · ❤️ Singles Run · 🌍 International · 🍺 Beer Run.

Ritmos (pace): All paces, Beginner, Intermediate, y ritmos concretos (ej. "6:00/km", "5:30").
Frecuencia: "1x/week", "2x/week", "3x/week", "6x/week".

---

## 8. Componentes de UI a construir (reutilizables)

- **Header pill** flotante con nav + iconos.
- **SearchModal** (command palette ⌘K).
- **RunCard** (tarjeta de carrera: bloque fecha, info, chips).
- **ClubCard** (grid y list variants).
- **FilterSidebar** (acordeones de filtros con contadores).
- **ViewToggle** (grid/list).
- **MetaList** (lista de metadatos con icono + label en mayúsculas + valor).
- **TypeChip** (emoji + texto).
- **AvatarStack** (avatares apilados + "+N").
- **Botones:** Primary (oscuro pill), Secondary (borde, fondo claro), IconButton.
- **AdCard** ("Your brand here?").
- **GeolocationCard** ("Where do you run?").
- **Footer** multi-columna + newsletter.
- **FeedbackWidget** flotante.

---

## 9. Stack recomendado

El original parece construido con un framework moderno (estética típica de Next.js + Tailwind + shadcn/ui, por los CSS variables en HSL y el radius). Recomendación para clonarlo:

- **Next.js (App Router)** + **React**.
- **Tailwind CSS** con los tokens de la sección 2 mapeados a variables CSS (`--background`, `--primary`, etc.) y `@theme`/config.
- **shadcn/ui** para botones, modales (command palette), acordeones de filtros.
- **Fuentes:** next/font con Instrument Serif (titulares) e Inter (cuerpo).
- **Iconos:** lucide-react.
- **Mapa/geolocalización:** API de geolocalización del navegador + (opcional) Mapbox/Google Maps.
- **Backend/DB:** clubs, carreras (con soporte de recurrencia), miembros, inscripciones, premios. Postgres + Prisma o Supabase encajan bien.
- **Auth:** login social/email para "Join".
- **SEO:** páginas estáticas/ISR por ciudad y por tipo (Saturday/Sunday Run Clubs, calendarios por ciudad).

---

## 10. Adaptaciones para España (.es)

- Traducir toda la UI al castellano:
  - "Discover Runs" → "Descubrir carreras"
  - "RunClubs" / "Find your Run Club" → "Encuentra tu club de running"
  - "Use my location" → "Usar mi ubicación"
  - "Join club" / "Join this run" → "Unirse al club" / "Apuntarse"
  - "Add your club" → "Añade tu club"
  - "Advertise here" → "Anúnciate aquí"
  - "Upcoming runs" → "Próximas carreras"
  - Metadatos: DATE→FECHA, TIME→HORA, LOCATION→UBICACIÓN, DISTANCE→DISTANCIA, PACE→RITMO, MEMBERS→MIEMBROS, CITY→CIUDAD, TYPE→TIPO, RUNS→CARRERAS.
- Cambiar "across the Netherlands" → "por toda España".
- Ciudades por defecto: Madrid, Barcelona, Valencia, Sevilla, Bilbao, Málaga, Zaragoza, Granada, Murcia, Palma.
- Formato de fecha en español (ej. "dom, 28 de junio de 2026").
- Mantener distancias en km y ritmo en min/km (igual que el original).

---

## 11. Nota legal importante

Puedes replicar libremente la **estructura, el diseño general, las funcionalidades y la disposición** (no están protegidos como tales). Sin embargo, NO copies activos protegidos del sitio original:
- No reutilices su logotipo, su vídeo del hero, sus textos exactos de marketing ni los datos de clubs/carreras reales del sitio neerlandés.
- Crea tus propios textos, tu propio logo/marca, tu propio contenido multimedia y tus propios datos para España.
- Revisa los Términos de RunClubs.nl antes de reutilizar cualquier contenido.

Este documento describe el patrón de producto para que construyas una plataforma equivalente con identidad y contenido propios.
