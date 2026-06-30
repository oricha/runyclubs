# Prompt de implementación — Capability `club-detail` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `club-detail` del proyecto RunClubs.es siguiendo
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

## 2. Contexto del proyecto y estado actual del repo

**RunClubs.es** es un directorio social de clubs de running y carreras grupales en
las 20 ciudades más importantes de España. Capabilities ya implementadas (confírmalo
con `openspec list --specs`): `design-system`, `data-model`, `recurring-runs`,
`runs-directory`, `run-detail`; posiblemente también `clubs-directory`,
`global-search` y `geolocation` según el avance del equipo paralelo.

### Stack exacto (no supongas versiones — lee `package.json` antes de añadir deps)

- **Next.js 16.2.9** App Router. No existe `pages/`.
- **React 19.2.7**, **TypeScript 5.9.3**
- **Prisma 7.8.0** con driver adapter (`@prisma/adapter-pg` + `pg.Pool`).
  Lee `lib/prisma.ts` antes de asumir cómo importar el cliente.
- **Tailwind CSS v3.4.19** (NO v4) — `tailwind.config.ts` con `hsl(var(--…))`.
- **shadcn/ui** (Radix primitives) + `lucide-react`.
- **`lib/i18n/es.ts`** con helper `t(template, vars)`.

### Qué ya existe y debes leer antes de escribir una línea

| Fichero | Relevancia para este change |
|---|---|
| `types/index.ts` | `ClubDetail` y `ClubSummary` ya definidos — úsalos sin modificar |
| `lib/cities.ts` | `CITY_DETAILS` con `lat`/`lng` reales, `getCityBySlug()`, `CITY_COORDS` |
| `lib/geolocation.ts` | `getDistanceKm(a, b)` — Haversine listo para ordenar ciudades por proximidad |
| `lib/recurring.ts` | `summarizeWeekdays(weekdays: number[]): string` — devuelve "Cada martes y jueves" |
| `lib/runs.ts` | `getRuns(filters)` — para cargar próximas carreras del club sin duplicar consulta Prisma |
| `lib/pace-labels.ts` | `getPaceLabel(pace)` — traduce enum a texto legible |
| `lib/i18n/es.ts` | Sección `clubDetail.*` ya completa (ver §4) |
| `app/carreras/[slug]/page.tsx` | Patrón de referencia: layout grid `[1fr_320px]`, JSON-LD, `notFound()`, `generateMetadata` |
| `components/run/JoinRunButton.tsx` | Patrón exacto para `JoinClubButton` (presentacional, disabled, comentario Fase 4) |
| `components/run/HostedByCard.tsx` | Ejemplo de tarjeta lateral con Avatar y link |
| `components/common/` | `Container`, `SectionLabel` — reutiliza directamente |
| `components/ui/` | `Button`, `Avatar`, `Badge`, `Card` — primitivas disponibles |
| `components/cards/AvatarStack.tsx` | Para mostrar avatares de miembros |
| `components/cards/TypeChip.tsx` | Para mostrar tipos del club |

### Dependencia crítica: `lib/clubs.ts`

Este fichero **puede o no existir** dependiendo de si el agente de
`clubs-directory` ya corrió. Antes de escribir nada:

```bash
ls lib/clubs.ts
```

**Si ya existe** (capability `clubs-directory` completada): añade a ese fichero
la función `getClubBySlug` descrita en §3 sin alterar `getClubs` ni
`parseClubFilters` que ya estarán allí.

**Si no existe** (capability `clubs-directory` pendiente): crea `lib/clubs.ts`
tú con al menos `getClubBySlug`. Añade también un stub de `getClubs` marcado
explícitamente con un comentario:

```ts
// STUB — será completado por la capability clubs-directory.
// No eliminar: global-search puede depender de esta firma.
export async function getClubs(/* filters: ClubFilters */): Promise<{ count: number; items: ClubSummary[] }> {
  throw new Error("getClubs: no implementado todavía. Implementar en capability clubs-directory.");
}
```

Documenta en `design.md` cuál de los dos escenarios encontraste.

---

## 3. Objetivo de este change

Implementar la **ficha individual de club** (`/clubs/[slug]`): cover, logo, nombre,
badge "Usa RunClubs.es", descripción colapsable, próximas carreras, metadatos del
club en sidebar, botón "Unirse al club" (presentacional), enlace a Instagram, y
sección "Más clubs cerca" ordenada por proximidad geográfica.

### 3.1 Capa de datos — `getClubBySlug` en `lib/clubs.ts`

```ts
export async function getClubBySlug(slug: string): Promise<ClubDetail | null>
```

La consulta Prisma debe incluir:

```ts
prisma.club.findUnique({
  where: { slug },
  include: {
    city: true,
    types: { include: { type: true } },
    awards: true,
    members: {
      include: { user: { select: { image: true } } },
      orderBy: { joinedAt: "asc" },
      take: 12,                          // para AvatarStack
    },
    _count: { select: { members: true } },
    recurringRuns: {
      where: { active: true },
      select: { weekday: true },         // solo weekdays para summarizeWeekdays
    },
    runs: {
      where: { status: "SCHEDULED", startAt: { gte: new Date() } },
      include: {
        types: { include: { type: true } },
        _count: { select: { attendees: true } },
      },
      orderBy: { startAt: "asc" },
      take: 5,
    },
  },
})
```

Mapeo a `ClubDetail` (tipo ya en `types/index.ts`):

```ts
{
  // campos de ClubSummary
  id, slug, name,
  city: club.city.name,
  logoUrl: club.logoUrl ?? undefined,
  pace: club.pace,
  frequency: club.frequency,
  types: club.types.map(…),
  awards: club.awards.map(…),

  // campos adicionales de ClubDetail
  description: club.description,
  coverUrl: club.coverUrl ?? undefined,
  instagramUrl: club.instagramUrl ?? undefined,
  usesPlatform: club.usesPlatform,
  memberCount: club._count.members,
  memberAvatars: club.members
    .map((m) => m.user.image)
    .filter((url): url is string => Boolean(url)),
  runsSummary: summarizeWeekdays(
    club.recurringRuns.map((r) => r.weekday)
  ),
  upcomingRuns: club.runs.map(mapRunToSummary),  // ver §3.2
  nearbyClubs: [],   // se resuelve por separado — ver §3.3
}
```

### 3.2 Mapeo de `Run` a `RunSummary` en `lib/clubs.ts`

**No importes** ni reutilices `mapRunToSummary` de `lib/runs.ts` — es privada
(no exportada). Escribe tu propia función privada en `lib/clubs.ts` con la misma
firma de salida `RunSummary` (tipo de `types/index.ts`). La lógica es idéntica;
la duplicación es intencional para no crear acoplamiento entre capas.

### 3.3 Lógica de "Más clubs cerca"

El campo `nearbyClubs: ClubSummary[]` se calcula **fuera de la consulta principal**,
en la propia función `getClubBySlug`, después de obtener el club:

1. Obtén la ciudad del club: `getCityBySlug(club.city.slug)`.
2. Ordena las 20 ciudades por `getDistanceKm(clubCity, otherCity)`.
3. Toma las 4 ciudades más cercanas (excluyendo la propia).
4. Consulta Prisma: clubs donde `city.slug in [mismaciudad, ...4cercanas]`,
   excluyendo el propio club, ordenados por ciudad (misma ciudad primero),
   `take: 6`.
5. Mapea a `ClubSummary[]`.

```ts
import { getCityBySlug, CITY_DETAILS } from "@/lib/cities";
import { getDistanceKm } from "@/lib/geolocation";
```

Ambos imports ya existen — no reinstales ni reimplementes Haversine.

---

## 4. Claves de i18n ya disponibles — úsalas todas

`lib/i18n/es.ts` ya tiene la sección `clubDetail` completa:

```ts
clubDetail: {
  backToClubs: "Todos los clubs",
  usesPlatform: "Usa RunClubs.es para inscripciones",
  members: "{count} miembros",      // usar t(es.clubDetail.members, { count })
  readMore: "Leer más",
  readLess: "Leer menos",
  upcomingRuns: "Próximas carreras",
  joinClub: "Unirse al club",
  followInstagram: "Seguir en Instagram",
  runs: "CARRERAS",                 // label de metadato
  pace: "RITMO",
  type: "TIPO",
  membersLabel: "MIEMBROS",
  city: "CIUDAD",
  moreClubsNearby: "Más clubs cerca",
}
```

Si necesitas más claves, añádelas al diccionario antes de usarlas. No hardcodees
textos en los componentes.

---

## 5. Página y componentes

### 5.1 `app/clubs/[slug]/page.tsx` — Server Component

Patrón exacto de `app/carreras/[slug]/page.tsx`:

```ts
type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata>
export default async function ClubDetailPage({ params }: PageProps)
```

- `await params` antes de usar `slug` (Next.js 16: `params` es una `Promise`).
- Si `getClubBySlug(slug)` devuelve `null`, llama a `notFound()`.
- Emite JSON-LD de tipo `SportsOrganization` (ver §5.7).
- Layout `<Container>` con grid `lg:grid-cols-[1fr_320px]` igual que `run-detail`.

### 5.2 `components/club/ClubHeader.tsx`

- Imagen de cover (`coverUrl`) a ancho completo, `aspect-video` o altura fija
  (`h-48 md:h-64`), con `object-cover`. Si no hay cover, usa un fondo sólido con
  el color `--secondary`.
- Logo superpuesto en la esquina inferior izquierda del cover (absoluto, circular,
  `h-20 w-20`, borde blanco).
- Nombre del club como `<h1 className="font-serif text-3xl">`.
- Ciudad con icono `MapPin` de `lucide-react`.
- Si `club.usesPlatform === true`, muestra un badge
  `es.clubDetail.usesPlatform` con el token `--brand-accent`.
- Link "Todos los clubs" → `/clubs` (breadcrumb) usando `es.clubDetail.backToClubs`.

### 5.3 `components/club/ClubDescription.tsx` — Client Component

Descripción colapsable: muestra los primeros ~200 caracteres con "Leer más"
(`es.clubDetail.readMore`) para expandir y "Leer menos" (`es.clubDetail.readLess`)
para colapsar. Usa `useState(false)`.

Si la descripción tiene ≤ 200 caracteres (o `description` es vacío), no renderices
el botón toggle — muestra el texto directamente.

### 5.4 `components/club/ClubMeta.tsx`

Grilla de metadatos del club, siguiendo el patrón de `RunMeta` de `run-detail`:

| Label | Valor |
|---|---|
| `es.clubDetail.membersLabel` | `t(es.clubDetail.members, { count: memberCount })` + `<AvatarStack>` |
| `es.clubDetail.runs` | `club.runsSummary` (e.g. "Cada martes y jueves") |
| `es.clubDetail.pace` | `getPaceLabel(club.pace)` |
| `es.clubDetail.type` | `<TypeChip>` por cada tipo |
| `es.clubDetail.city` | `club.city` |

### 5.5 `components/club/ClubUpcomingRuns.tsx`

Sección "Próximas carreras" (`es.clubDetail.upcomingRuns`) del club:
lista de hasta 5 `RunSummary` usando el componente `RunCard` ya existente en
`components/cards/RunCard.tsx`. Si no hay carreras programadas, muestra un estado
vacío (texto breve, sin ilustraciones).

### 5.6 `components/club/JoinClubButton.tsx`

Exactamente el mismo patrón que `JoinRunButton`:

```tsx
/**
 * Presentacional hasta Fase 4 (membership-attendance + auth).
 * POST /api/clubs/[slug]/join se conectará cuando existan esas capabilities.
 */
export function JoinClubButton() {
  return (
    <Button className="w-full" disabled title="Requiere iniciar sesión (próximamente)">
      {es.clubDetail.joinClub}
    </Button>
  );
}
```

No acepta props ahora — cuando llegue `membership-attendance`, añadirá
`{ slug: string; isMember: boolean }`.

### 5.7 `components/club/MoreClubsNearby.tsx`

Sección "Más clubs cerca" (`es.clubDetail.moreClubsNearby`):
recibe `clubs: ClubSummary[]` y los renderiza como tarjetas pequeñas (no el
`ClubCard` completo — una fila compacta: logo, nombre, ciudad). Cada tarjeta
enlaza a `/clubs/[slug]`.

Si `clubs` está vacío, no renderiza la sección.

### 5.8 Sidebar (dentro de `app/clubs/[slug]/page.tsx`)

```tsx
<aside className="hidden space-y-4 lg:sticky lg:top-28 lg:block lg:self-start">
  <JoinClubButton />
  {club.instagramUrl && (
    <Button variant="outline" className="w-full" asChild>
      <a href={club.instagramUrl} target="_blank" rel="noopener noreferrer">
        {es.clubDetail.followInstagram}
      </a>
    </Button>
  )}
  <ClubMeta club={club} />
</aside>
```

El sidebar debe mostrarse también en mobile bajo el contenido principal
(igual que `run-detail` repite las acciones con `lg:hidden` / `hidden lg:block`).

### 5.9 JSON-LD `SportsOrganization`

```ts
function buildClubJsonLd(club: ClubDetail, siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: club.name,
    url: `${siteUrl}/clubs/${club.slug}`,
    logo: club.logoUrl,
    image: club.coverUrl,
    description: club.description,
    address: {
      "@type": "PostalAddress",
      addressLocality: club.city,
      addressCountry: "ES",
    },
    sport: "Running",
    numberOfEmployees: { "@type": "QuantitativeValue", value: club.memberCount },
  };
}
```

Emítelo con `<script type="application/ld+json">` en el `<>` raíz de la página,
igual que hace `app/carreras/[slug]/page.tsx`.

---

## 6. Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance:**
- `lib/clubs.ts` — `getClubBySlug` (+ stub `getClubs` si el fichero no existe).
- `app/clubs/[slug]/page.tsx` — Server Component con `generateMetadata` y JSON-LD.
- Componentes en `components/club/`: `ClubHeader`, `ClubDescription`,
  `ClubMeta`, `ClubUpcomingRuns`, `JoinClubButton`, `MoreClubsNearby`.
- Lógica de "Más clubs cerca" vía `getDistanceKm` + `CITY_DETAILS`.

**Non-goals explícitos (no los implementes aquí):**
- **No implementes** el listado `/clubs` (`clubs-directory`) si no existe — ese
  change es independiente; este change solo necesita `/clubs/[slug]`.
- **No implementes** "Unirse al club" funcional — `JoinClubButton` es presentacional
  hasta `membership-attendance` (Fase 4, igual que `JoinRunButton` en `run-detail`).
- **No implementes** `GET /api/clubs/[slug]` como endpoint HTTP público — la página
  es un Server Component que llama `getClubBySlug` directamente, igual que
  `run-detail` llama `getRunBySlug` directamente (sin fetch interno).
- **No implementes** la edición del club, roles de admin, ni configuración —
  todo eso es `club-onboarding` y `admin-panel` (Fase 4).
- **No implementes** inscripción a newsletter desde la ficha — eso es `newsletter`.
- **No modifiques** `lib/runs.ts`, `hooks/useRunFilters.ts`, ni ningún componente
  de `run-detail` — capabilities ya archivadas.
- **No cambies** los tipos existentes en `types/index.ts` — solo adiciones si son
  estrictamente necesarias (que no deberían serlo, `ClubDetail` ya está completo).

---

## 7. Especificación funcional (PRD §6.4 — solo la parte de `club-detail`)

**US-8** (parcial — sin la lógica de "Unirse" que requiere auth):
> Como corredor, quiero ver la ficha de un club con toda la información relevante:
> descripción, frecuencia de carreras, miembros y próximas carreras.

- **Given** accedo a `/clubs/slug-del-club`
- **When** la página carga
- **Then** veo cover, logo, nombre, descripción (colapsable si es larga), metadatos
  (frecuencia, ritmo, tipo), avatares de miembros, próximas carreras del club,
  y una sección "Más clubs cerca".

**Reglas de negocio de este change:**
- Si el club no existe, la página devuelve 404 (`notFound()`).
- La descripción se trunca a ~200 caracteres con "Leer más"/"Leer menos".
- "Más clubs cerca" prioriza misma ciudad, luego ciudades más próximas por distancia
  geográfica (usar `getDistanceKm` de `lib/geolocation.ts`).
- `runsSummary` se genera con `summarizeWeekdays` sobre los `weekday` de las
  `RecurringRun` activas del club.
- `JoinClubButton` es presentacional hasta Fase 4 (sin lógica POST).

---

## 8. Decisiones que debes tomar tú (documéntalas en `design.md`)

- **Estado de `lib/clubs.ts`**: ¿ya existía de `clubs-directory` o lo creaste tú?
  ¿Qué encontraste y qué añadiste?
- **Número máximo de "clubs cercanos"** a mostrar (sugerencia: 4-6; decide y justifica).
- **Criterio "misma ciudad primero"**: ¿lo implementas con ordenación en memoria
  o con dos consultas Prisma separadas? Elige la opción más simple y documéntala.
- **Altura del cover**: `aspect-video` (flexible) vs altura fija (`h-48 md:h-64`)
  — elige según el design system y los tokens disponibles.
- **Umbral de truncado** de descripción (sugerencia: 200 caracteres; ajusta si
  el seed tiene descripciones más cortas y quedaría raro).

---

## 9. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea el change con sus 4 ficheros
openspec/changes/add-club-detail/proposal.md
openspec/changes/add-club-detail/design.md
openspec/changes/add-club-detail/tasks.md
openspec/changes/add-club-detail/specs/club-detail/spec.md

# 2. Valida antes de implementar
openspec validate add-club-detail --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §10) y vuelve a validar
openspec validate add-club-detail --strict

# 5. Archiva
openspec archive add-club-detail -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (completa Fase 3 junto con `clubs-directory`;
  `lib/clubs.ts` como capa de datos canónica de clubs; `JoinClubButton`
  presentacional hasta Fase 4), qué cambia, impacto, `## Non-goals` con los
  puntos del §6. Menciona el estado de dependencia con `clubs-directory`.

- **`design.md`**: las decisiones del §8, el contrato de `getClubBySlug`,
  la lógica de "clubs cercanos" (Haversine + CITY_DETAILS), el estado de
  `lib/clubs.ts` en el momento de implementar, y la decisión de no exponer
  `GET /api/clubs/[slug]` (Server Component directo).

- **`tasks.md`**: grupos sugeridos — (1) Capa de datos (`getClubBySlug` en
  `lib/clubs.ts`, lógica "cercanos"), (2) Página Server Component con metadata
  y JSON-LD, (3) `ClubHeader` + `ClubDescription`, (4) `ClubMeta` +
  `ClubUpcomingRuns`, (5) `JoinClubButton` + sidebar, (6) `MoreClubsNearby`,
  (7) Verificación.

- **`specs/club-detail/spec.md`**: formato OpenSpec (`## ADDED Requirements` →
  `### Requirement: ...` → `#### Scenario: ...` con **WHEN**/**THEN**).
  **Recuerda (lección de changes anteriores):** cada enunciado de requisito
  debe contener **`MUST`** o **`SHALL`** en inglés (RFC 2119) — aunque el
  resto esté en español — o `openspec validate --strict` fallará con
  «must contain SHALL or MUST».

  Requisitos mínimos: 404 para slug inexistente, ficha con metadatos completos,
  descripción colapsable, próximas carreras del club, "Más clubs cerca" ordenado
  por proximidad, `JoinClubButton` visible pero inactivo.

---

## 10. Implementación y verificación (no te limites a "compila")

1. **Confirma PostgreSQL real** disponible (mismo `.env`). Verifica que los 20
   clubs sembrados tienen datos suficientes (`description`, al menos algún
   `RecurringRun` activo, al menos alguna `Run` futura con `status=SCHEDULED`).
   Si faltan carreras futuras, ejecuta primero `generateRuns` de `lib/recurring.ts`
   o el endpoint cron.

2. **Con el dev server activo** (`npm run dev`), abre en el navegador
   `/clubs/<slug-real>` (toma un slug real de la BD: `SELECT slug FROM "Club" LIMIT 5`):
   - Cover, logo y nombre renderizan correctamente.
   - Si el club tiene `usesPlatform = true`, aparece el badge.
   - La descripción larga muestra "Leer más" y al pulsarlo se expande/colapsa.
   - Los metadatos (miembros, ritmo, tipos, `runsSummary`) son correctos.
   - Las próximas carreras aparecen como `RunCard`.
   - "Más clubs cerca" muestra clubs de la misma ciudad primero.
   - El sidebar tiene `JoinClubButton` desactivado e `Instagramlink` si el club
     tiene `instagramUrl`.
   - En mobile: el sidebar se colapsa bajo el contenido principal.
   - Sin errores ni warnings en consola del navegador.

3. **Verifica 404**: accede a `/clubs/slug-inexistente` → debe devolver 404
   (Next.js maneja la pantalla de error; no debe mostrar 500).

4. **Verifica JSON-LD**: en el código fuente de la página debe aparecer
   `<script type="application/ld+json">` con `"@type": "SportsOrganization"`.

5. **Verifica que las capabilities anteriores no se rompieron**:
   - `npm run build` y `npm run lint` pasan sin errores nuevos.
   - `/carreras` y `/carreras/[slug]` siguen funcionando.
   - Si `clubs-directory` ya existía: `/clubs` sigue funcionando.

6. Marca todas las casillas de `tasks.md`, ejecuta
   `openspec validate add-club-detail --strict` y archiva con
   `openspec archive add-club-detail -y`. Confirma con `openspec list --specs`.

---

## 11. Qué NO hacer

- No importes `mapRunToSummary` de `lib/runs.ts` — es privada. Escribe la tuya.
- No uses `getServerSession()` (NextAuth v4) ni `SessionProvider` para el botón
  de unirse — `JoinClubButton` es deliberadamente presentacional hasta Fase 4.
- No crees `app/clubs/page.tsx` (directorio raíz) — ese es `clubs-directory`.
  Solo debes crear `app/clubs/[slug]/page.tsx`.
- No marques una tarea como completada si no la has verificado de verdad.
- No reinstales Haversine ni `geolib` — `lib/geolocation.ts` ya tiene `getDistanceKm`.
- No modifiques los tipos de `types/index.ts` — `ClubDetail` y `ClubSummary` ya
  son correctos y otras capabilities dependen de ellos.

---

## 12. Formato de tu informe final al usuario

Resume: si `lib/clubs.ts` preexistía o lo creaste, qué datos reales encontraste
al verificar (nombre de un club real, su `runsSummary`, cantidad de clubs cercanos
mostrados), cómo implementaste "Más clubs cerca" (una consulta o dos, en memoria
o en BD), confirmación de 404 y JSON-LD verificados, confirmación de que
`openspec validate` y `openspec archive` se completaron, y propón `auth` (Fase 4,
si no está implementado) o `membership-attendance` (si `auth` ya está archivado)
como siguiente capability del roadmap.
