# RunClubs.es — Roadmap de funcionalidades (Spec-Driven Development con OpenSpec)

> Descomposición completa del producto en **capabilities** (specs) y **changes** de
> OpenSpec. Es la fuente de la que se generan los artefactos de `openspec/changes/`.
>
> **Modelo de trabajo.** Por cada *change* de OpenSpec se crean **3 ficheros**
> (`proposal.md`, `design.md`, `tasks.md`) más el **delta de especificación**
> `specs/<capability>/spec.md`. Al archivar el change (`openspec archive`), el delta
> se promociona a `openspec/specs/<capability>/spec.md` (la verdad vigente).
>
> ```
> openspec/
>   specs/<capability>/spec.md            # verdad vigente (tras archivar)
>   changes/<change-id>/
>     proposal.md                         # 1) por qué + qué cambia + capabilities + impacto
>     design.md                           # 2) decisiones técnicas, modelado, endpoints, SEO
>     tasks.md                            # 3) checklist de implementación por capas
>     specs/<capability>/spec.md          #    delta: ADDED/MODIFIED/REMOVED Requirements
> ```
>
> **Flujo por change:** `openspec/propose` → revisar `proposal` → `specs` (delta) →
> `design` → `tasks` → implementar → `openspec validate` → `openspec archive`.

---

## Cómo crear cada change

Con la CLI ya inicializada (`openspec init`), para cada entrada de la tabla:

```bash
# Slash command (en Claude Code):  /opsx:propose "<descripción>"
# o manualmente, creando la carpeta y los 3 ficheros + el delta:
openspec/changes/<change-id>/proposal.md
openspec/changes/<change-id>/design.md
openspec/changes/<change-id>/tasks.md
openspec/changes/<change-id>/specs/<capability>/spec.md
```

Validar antes de implementar: `openspec validate <change-id> --strict`.

---

## Resumen de capabilities (specs)

| # | Capability (spec) | Área | Fase |
|---|---|---|---|
| 1 | `design-system` | UI base, tokens, layout | 1 |
| 2 | `data-model` | Prisma, ciudades, tipos, seed | 1 |
| 3 | `runs-directory` | Listado de carreras + filtros | 3 |
| 4 | `run-detail` | Ficha de carrera + recomendaciones | 3 |
| 5 | `clubs-directory` | Listado de clubs + filtros | 3 |
| 6 | `club-detail` | Ficha de club | 3 |
| 7 | `recurring-runs` | Carreras recurrentes + cron | 2 |
| 8 | `global-search` | Búsqueda ⌘K + /api/search | 3 |
| 9 | `geolocation` | "Usar mi ubicación" | 3 |
| 10 | `auth` | NextAuth magic link + Google | 4 |
| 11 | `membership-attendance` | Unirse a club / apuntarse | 4 |
| 12 | `club-onboarding` | Alta de club multipaso | 4 |
| 13 | `awards-badges` | Premios/insignias de clubs | 4 |
| 14 | `newsletter` | Suscripción + footer | 4 |
| 15 | `city-pages` | Página de ciudad (calendario, FAQ) | 5 |
| 16 | `weather-widget` | Clima 7 días (Open-Meteo) | 5 |
| 17 | `races-competitions` | Competiciones + "Sugerir carrera" | 5 |
| 18 | `advertising` | /anunciate + AdCards + partnerships | 5 |
| 19 | `blog` | Blog + artículos | 5 |
| 20 | `seo-foundation` | JSON-LD, sitemap, metadatos, páginas tipo/día | 5 |
| 21 | `legal-and-consent` | Privacidad, términos, cookies (RGPD) | 5 |
| 22 | `error-pages` | 404 genérica / club / carrera | 5 |
| 23 | `user-account` | /cuenta | 4 |
| 24 | `admin-panel` | Superadmin oculto en /login | 4 |
| 25 | `monetization-billing` | Planes SaaS, Stripe, listings | 6 |
| 26 | `home-page` | Portada pública (hero, contadores, destacados) | 3 |

---

## Catálogo de changes (con sus 3 ficheros)

> Cada fila genera una carpeta `openspec/changes/<change-id>/` con
> `proposal.md` + `design.md` + `tasks.md` + `specs/<capability>/spec.md`.

### Fase 1 — Base

#### `add-design-system`
- **Capability:** `design-system` · **Fuente:** doc 1 §3, doc 2 §2-3, §8-9
- **proposal.md:** sistema visual base (tokens HSL/HEX, Tailwind config, fuentes
  Instrument Serif + Inter), primitivas shadcn/ui (Button, Card, Dialog, Accordion,
  Input, Badge, Avatar, Toggle), layout raíz, `Header` pill flotante, `Footer`,
  `FeedbackWidget`, `Container`, `SectionLabel`, `ViewToggle`.
- **design.md:** estructura `globals.css`, `tailwind.config.ts`, `app/fonts.ts`,
  convención de clases utilitarias, árbol de componentes `components/`.
- **tasks.md:** scaffold Next.js+TS+Tailwind+animate → tokens → fuentes → primitivas →
  Header/Footer/FeedbackWidget → diccionario i18n `lib/i18n/es.ts` + `RUN_TYPES` + `CITIES`.

#### `add-data-model`
- **Capability:** `data-model` · **Fuente:** doc 2 §6-7, doc 3 §7, doc 4 §12
- **proposal.md:** modelo de dominio y persistencia: enums (Pace, MemberRole,
  RunStatus), modelos User, City, Club, RunTypeTag, ClubType, ClubAward, ClubMember,
  RecurringRun, Run, RunType, RunAttendee, NewsletterSubscriber, Race (+ campos de
  signup externo/organizador en Run). Tipos TypeScript de dominio. Seed inicial.
- **design.md:** decisiones de claves/índices, slugs, relaciones, estrategia de seed
  (20 ciudades, 11 tipos, 20 clubs ficticios, carreras recurrentes).
- **tasks.md:** Prisma + Postgres → schema + migraciones → `types/index.ts` →
  `prisma/seed.ts` → ejecutar seed.

### Fase 2 — Recurrencias

#### `add-recurring-runs-generation`
- **Capability:** `recurring-runs` · **Fuente:** doc 2 §11
- **proposal.md:** generación automática de instancias `Run` desde `RecurringRun`
  para las próximas N semanas; resumen "Cada miércoles y domingo"; endpoint cron.
- **design.md:** algoritmo `generateRuns(weeksAhead)`, `nextWeekday`, `slugify`,
  idempotencia con `upsert`, `POST /api/cron/generate-runs`, Vercel Cron `0 4 * * *`.
- **tasks.md:** `lib/recurring.ts` → endpoint cron protegido → configurar Vercel Cron →
  derivación del texto-resumen de días → tests del generador.

### Fase 3 — Páginas públicas y descubrimiento

#### `add-runs-directory`
- **Capability:** `runs-directory` · **Fuente:** doc 1 §6, doc 2 §10, §12
- **proposal.md:** `/carreras` con título/subtítulo, toggle lista/cuadrícula,
  `FilterSidebar` (ciudad, tipo, ritmo, día, fecha), `ResultsSummary`, paginación.
- **design.md:** `GET /api/runs` con filtros, estado de filtros en URL
  (`useRunFilters`), `RunCard`/`RunCardGrid`, `DateBlock`, `TypeChip`, `AvatarStack`.
- **tasks.md:** endpoint → hook de filtros → tarjetas → toggle vista → contadores →
  CTA "Calendarios por ciudad".

#### `add-run-detail`
- **Capability:** `run-detail` · **Fuente:** doc 1 §6, doc 4 §4, §11
- **proposal.md:** `/carreras/[slug]` con cabecera, "Organizado por" (club +
  organizador individual), "Sobre esta carrera", asistentes con avatares, sidebar
  (Apuntarse / Inscripción externa, Compartir, FECHA/HORA/UBICACIÓN/DISTANCIA/RITMO),
  recomendaciones "Más carreras en [ciudad]" y "Carreras cerca de esta fecha".
- **design.md:** `GET /api/runs/[slug]`, `signupType` interno/externo,
  `ExternalSignupButton`, `OrganizerCard`, `MoreRunsInCity`, `RunsAroundDate`,
  JSON-LD `Event`.
- **tasks.md:** endpoint detalle → cabecera/meta → hosted-by + organizador →
  asistentes → botón interno/externo + compartir → recomendaciones cruzadas → JSON-LD.

#### `add-clubs-directory`
- **Capability:** `clubs-directory` · **Fuente:** doc 1 §6, doc 2 §10, §12
- **proposal.md:** `/clubs` con título/subtítulo, grid/list, filtros (ciudad, ritmo,
  tipo, día), "Añade tu club", soporte de `?day=saturday|sunday`.
- **design.md:** `GET /api/clubs`, `ClubCard`, reutilización de `FilterSidebar`.
- **tasks.md:** endpoint → tarjetas → filtros compartidos → vista grid/list → CTA alta.

#### `add-club-detail`
- **Capability:** `club-detail` · **Fuente:** doc 1 §6, doc 2 §9
- **proposal.md:** `/clubs/[slug]` con cover+logo+nombre+badge "Usa RunClubs.es",
  miembros con avatares, descripción "Leer más", próximas carreras, sidebar (Unirse,
  Seguir en Instagram, metadatos), clubs cercanos.
- **design.md:** `GET /api/clubs/[slug]`, `ClubHeader`, `ClubMeta`, `ClubDescription`,
  `JoinClubButton`, "Más clubs cerca", JSON-LD `SportsClub`.
- **tasks.md:** endpoint → header → meta → descripción colapsable → próximas carreras →
  sidebar → clubs cercanos → JSON-LD.

#### `add-global-search`
- **Capability:** `global-search` · **Fuente:** doc 1 §7, doc 2 §9.6, §10
- **proposal.md:** búsqueda global con command palette (⌘K / Ctrl+K) sobre clubs y
  carreras; `SearchTrigger` en hero/header.
- **design.md:** `SearchModal` con debounce, `GET /api/search?q=`, formato de
  resultados (kind, title, href).
- **tasks.md:** endpoint de búsqueda → modal + atajo de teclado → trigger en header y hero.

#### `add-geolocation`
- **Capability:** `geolocation` · **Fuente:** doc 1 §7, doc 2 §9.7
- **proposal.md:** tarjeta "¿Dónde corres?" + "Usar mi ubicación" para ordenar por
  cercanía.
- **design.md:** `GeolocationCard`, uso de `navigator.geolocation`, cálculo de
  distancia con coords de ciudad, fallback sin permiso.
- **tasks.md:** componente → handler de geolocalización → orden por proximidad → fallback.

#### `add-home-page`
- **Capability:** `home-page` · **Fuente:** PRD §6 "Páginas: Home"
- **proposal.md:** reemplaza `app/page.tsx` (actualmente demostración del design-system)
  con la portada real: hero con vídeo de fondo + titular editorial + buscador rápido
  (navega a `/carreras?q=`), bloque de contadores (clubs activos, carreras próximas,
  ciudades cubiertas), sección "Próximas carreras" (listado parcial de hasta 6 runs,
  enlace a `/carreras`), sección "Clubs destacados" (grid de hasta 6 clubs,
  enlace a `/clubs`), y Footer. Depende de `runs-directory` y `clubs-directory` para
  los componentes de tarjeta y los datos de portada.
  Non-goals: búsqueda con command-palette (esa integración pertenece a `global-search`),
  widget de clima (pertenece a `weather-widget`/`city-pages`), secciones de login/cuenta.
- **design.md:** `HeroSection` con `<video>` de fondo (autoplay, muted, loop, poster
  fallback), `QuickSearchBar` como `<form>` nativo que redirige a `/carreras?q=`,
  `CountersStrip` como RSC (query agregada a DB: COUNT clubs, runs próximas, ciudades
  distintas), `UpcomingRunsStrip` (≤ 6 runs ordenadas por fecha, reutiliza `RunCard`
  de `runs-directory`), `FeaturedClubsGrid` (≤ 6 clubs con `featured: true` o criterio
  de seed, reutiliza `ClubCard` de `clubs-directory`), ISR `revalidate: 3600`. Metadatos
  de la raíz (`title`, `description`, OG) en `app/layout.tsx` o `app/page.tsx`.
- **tasks.md:** reemplazar `app/page.tsx` → `HeroSection` (vídeo + headline + subhead)
  → `QuickSearchBar` (`<form action="/carreras">`) → `CountersStrip` (RSC, 3 queries
  paralelas con `Promise.all`) → `UpcomingRunsStrip` (RSC, reutiliza `RunCard`) →
  `FeaturedClubsGrid` (RSC, reutiliza `ClubCard`) → añadir ISR `export const revalidate`
  → metadatos de página raíz → smoke test de rutas (`/` → 200).

### Fase 4 — Cuentas, interacción y admin

#### `add-auth-magic-link`
- **Capability:** `auth` · **Fuente:** doc 4 §5
- **proposal.md:** autenticación sin contraseña (magic link) + Google, pantalla
  `/acceso` con vídeo de fondo, parámetro `next=` para volver al destino.
- **design.md:** NextAuth (GoogleProvider + EmailProvider/Resend), `MagicLinkForm`,
  sesión, callbacks de `next`, protección de acciones.
- **tasks.md:** configurar NextAuth → proveedores → pantalla login → flujo `next` →
  guardas en acciones (join, onboarding).

#### `add-membership-and-attendance`
- **Capability:** `membership-attendance` · **Fuente:** doc 1 §7, doc 2 §10
- **proposal.md:** "Unirse al club" y "Apuntarse a carrera" con recuento de
  miembros/asistentes y avatares.
- **design.md:** `POST /api/clubs/[slug]/join`, `POST /api/runs/[slug]/join`,
  unicidad (ClubMember/RunAttendee), estados optimistas, requiere auth.
- **tasks.md:** endpoints join → botones con estado → recuentos/avatares → manejo no-auth.

#### `add-club-onboarding`
- **Capability:** `club-onboarding` · **Fuente:** doc 1 §6, doc 3 §5, doc 4 §1
- **proposal.md:** `/onboarding/club` formulario multipaso (datos, recurrencias,
  estilo, enlaces, publicar). Requiere login.
- **design.md:** pasos y validación, `POST /api/clubs`, creación de club + recurrencias,
  asignación de owner.
- **tasks.md:** wizard UI → validación por paso → endpoint crear club → recurrencias →
  pantalla "¡Listo!".

#### `add-awards-badges`
- **Capability:** `awards-badges` · **Fuente:** doc 1 §7, doc 2 §6
- **proposal.md:** premios/insignias de clubs (Fundadores, Verificado, Top) visibles
  en tarjeta y ficha.
- **design.md:** modelo `ClubAward`, render de iconos/tooltips, "Ver premios del club".
- **tasks.md:** seed de awards → render en `ClubCard`/ficha → tooltip/labels.

#### `add-newsletter`
- **Capability:** `newsletter` · **Fuente:** doc 1 §8, doc 2 §9.8
- **proposal.md:** suscripción a newsletter desde footer y CTAs.
- **design.md:** `POST /api/newsletter`, `NewsletterSubscriber`, doble opt-in opcional,
  validación email.
- **tasks.md:** form footer → endpoint → almacenamiento → feedback de éxito/errores.

#### `add-user-account`
- **Capability:** `user-account` · **Fuente:** doc 1 §5, doc 2 §4
- **proposal.md:** `/cuenta` con datos de perfil, clubs a los que pertenece, carreras
  a las que asiste, ciudad preferida.
- **design.md:** lectura de sesión, secciones de cuenta, edición básica de perfil.
- **tasks.md:** página cuenta → secciones → edición perfil → cerrar sesión.

#### `add-admin-panel`
- **Capability:** `admin-panel` · **Fuente:** doc 6
- **proposal.md:** panel de administración para **superadmin** en ruta **oculta**
  `/login` (sin enlaces en la web): ver todos los clubs, dar de alta, dar de baja y
  **asignar usuarios como owner** de un club.
- **design.md:** rol superadmin, guard de ruta, layout admin, acciones CRUD de clubs,
  asignación de owner (cambia `Club.ownerId` / `ClubMember.role = OWNER`), auditoría.
- **tasks.md:** rol + guard → layout admin → tabla de clubs → alta/baja → buscador de
  usuarios + asignar owner → registro de acciones.

### Fase 5 — Ciudad, competiciones, contenido y SEO

#### `add-city-pages`
- **Capability:** `city-pages` · **Fuente:** doc 4 §3, §10, doc 2 §13
- **proposal.md:** `/ciudad/[ciudad]` rica para SEO: cabecera dinámica, buscador,
  contador, toggle Calendario/Lista, sidebar (tipos, ritmo, clima actual, AdCard,
  "Añade tu club"), "Races in [ciudad]", "Run clubs in [ciudad]", FAQ por ciudad.
- **design.md:** `GET /api/city/[slug]` (runs+clubs+weather+races+faq), `CalendarView`,
  `FAQAccordion`, `getCityFAQ`, JSON-LD `FAQPage`, metadatos por ciudad.
- **tasks.md:** agregador de datos de ciudad → cabecera/meta → toggle calendario →
  secciones clubs/competiciones → FAQ + JSON-LD.

#### `add-weather-widget`
- **Capability:** `weather-widget` · **Fuente:** doc 4 §3.7, §9
- **proposal.md:** clima actual + previsión a 7 días por ciudad para planificar salidas.
- **design.md:** `GET /api/weather?city=`, Open-Meteo, `CITY_COORDS`, mapa WMO→condición,
  `WeatherWidget`/`WeatherDay`, cache `revalidate: 3600`.
- **tasks.md:** `lib/weather.ts` → endpoint con cache → widget 7 días → integración en ciudad.

#### `add-races-competitions`
- **Capability:** `races-competitions` · **Fuente:** doc 4 §2, doc 2
- **proposal.md:** `/competiciones` (Races) con filtros ciudad/distancia, secciones
  UPCOMING/PAST, badge "Popular", `/competiciones/[slug]`, CTA "Sugerir una carrera".
- **design.md:** modelo `Race`, `GET /api/races`, `GET /api/races/[slug]`,
  `POST /api/races/suggest`, `RaceCard`/`RaceList`, `SuggestRaceForm`, afiliación en CTA inscripción.
- **tasks.md:** modelo+seed races → endpoints → tarjetas/listado → ficha → formulario sugerir.

#### `add-advertising`
- **Capability:** `advertising` · **Fuente:** doc 4 §6, doc 5 §1
- **proposal.md:** `/anunciate` con propuesta de valor (4 puntos), formulario de
  contacto, `AdCard` en sidebars, enlace a `/colaboraciones`.
- **design.md:** `AdvertiseForm`, `AdCard`, formatos de anuncio (lateral, hero,
  club/carrera destacada), página partnerships.
- **tasks.md:** landing → formulario → AdCards en listados/ciudad → partnerships.

#### `add-blog`
- **Capability:** `blog` · **Fuente:** doc 3 §6, doc 4 §7
- **proposal.md:** `/blog` + `/blog/[slug]` con artículos propios (guías de ciudad,
  tutoriales, producto).
- **design.md:** fuente de contenido (MDX/CMS), listado y ficha, metadatos/OG, JSON-LD `Article`.
- **tasks.md:** estructura de contenidos → listado → ficha → SEO de artículos → borradores iniciales.

#### `add-seo-foundation`
- **Capability:** `seo-foundation` · **Fuente:** doc 2 §13, doc 4 §12
- **proposal.md:** páginas SEO por ciudad/tipo/día, `sitemap.xml` dinámico,
  `robots.txt`, metadatos y OG, ISR.
- **design.md:** `app/sitemap.ts`, `generateMetadata`/`generateStaticParams`,
  `/ciudades/[ciudad]`, `/tipos/[tipo]`, `/tipos/sabados|domingos`, datos estructurados.
- **tasks.md:** sitemap+robots → páginas tipo/día/ciudad → metadatos+OG → ISR → validación.

#### `add-legal-and-consent`
- **Capability:** `legal-and-consent` · **Fuente:** doc 1 §10, doc 2 §14
- **proposal.md:** `/privacidad`, `/terminos`, banner de cookies y analítica respetuosa (RGPD).
- **design.md:** contenido legal, consentimiento de cookies, integración Plausible/Simple Analytics.
- **tasks.md:** páginas legales → banner de cookies → analítica → enlaces en footer.

#### `add-error-pages`
- **Capability:** `error-pages` · **Fuente:** doc 4 §8
- **proposal.md:** 404 genérica + "Club no encontrado" + "Carrera no encontrada" con copys propios.
- **design.md:** `not-found.tsx` global y por sección, botones de recuperación.
- **tasks.md:** 404 global → not-found de club → not-found de carrera → CTAs.

### Fase 6 — Monetización

#### `add-monetization-billing`
- **Capability:** `monetization-billing` · **Fuente:** doc 5
- **proposal.md:** planes para clubs (Gratuito/Pro/Business), badge "Verificado",
  posición mejorada, estadísticas; listings de pago de competiciones; comisiones de
  inscripción (marketplace). Alineado con la hoja de ruta de fases del doc 5.
- **design.md:** modelos Plan/Subscription, Stripe (Checkout + Connect), gating de
  features por plan, dashboards de estadísticas, webhooks.
- **tasks.md:** integrar Stripe → modelos de plan/suscripción → checkout → gating de
  features → estadísticas de club → listings competiciones → comisiones inscripción.

---

## Orden de implementación recomendado

1. `add-design-system` → `add-data-model`
2. `add-recurring-runs-generation`
3. `add-runs-directory` → `add-run-detail` → `add-clubs-directory` → `add-club-detail`
   → `add-global-search` → `add-geolocation` → `add-home-page`
4. `add-auth-magic-link` → `add-membership-and-attendance` → `add-club-onboarding`
   → `add-awards-badges` → `add-newsletter` → `add-user-account` → `add-admin-panel`
5. `add-weather-widget` → `add-city-pages` → `add-races-competitions` → `add-advertising`
   → `add-blog` → `add-seo-foundation` → `add-legal-and-consent` → `add-error-pages`
6. `add-monetization-billing`

> Dependencias clave: casi todo depende de `data-model` y `design-system`;
> `home-page` depende de `runs-directory` y `clubs-directory` (componentes de tarjeta y datos de portada);
> `membership-attendance`, `club-onboarding`, `user-account` y `admin-panel` dependen de `auth`;
> `city-pages` depende de `weather-widget`, `clubs-directory`, `runs-directory` y `races-competitions`.
