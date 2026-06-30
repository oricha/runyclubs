# PROMPT: Implementar capability `city-pages`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Prisma 7.8.0** con driver adapter · **Tailwind CSS v3.4.19**.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
prisma/schema.prisma          — modelos City, Club, Run, Race
lib/cities.ts                 — CityInfo con lat/lng; getCityBySlug(); CITY_DETAILS (20 ciudades)
lib/geolocation.ts            — getDistanceKm(a, b); findNearestCity(coords)
lib/i18n/es.ts               — para añadir claves cityPage.*
lib/prisma.ts                 — singleton Prisma
components/weather/WeatherWidget.tsx — integrar si existe (creado por weather-widget agent)
components/weather/WeatherWidgetSkeleton.tsx — skeleton si WeatherWidget existe
app/clubs/page.tsx            — patrón de listado de clubs para referencia
app/carreras/page.tsx         — patrón de listado de carreras para referencia
types/index.ts                — tipos ClubSummary, RunSummary existentes
```

---

## Estado actual del repo

No existe `app/ciudades/` — lo crearás desde cero.

`lib/cities.ts` tiene `CITY_DETAILS` con las 20 ciudades y sus coordenadas. El modelo `City` en Prisma tiene `slug` único y relaciones con `Club[]` y `Race[]`.

**Nota sobre `WeatherWidget`:** el agente `weather-widget` debería haberlo creado en `components/weather/WeatherWidget.tsx`. Si el archivo existe, úsalo. Si no existe, crea un placeholder `WeatherPlaceholder` que muestra "Clima próximamente" y deja un TODO.

---

## Qué DEBES implementar

### 1. Página de ciudad `app/ciudades/[ciudad]/page.tsx`

**Server Component.** El parámetro `ciudad` es el slug de la ciudad (ej. `"madrid"`).

**IMPORTANTE — Next.js 16 params es Promise:**
```typescript
export default async function CityPage({
  params,
}: {
  params: Promise<{ ciudad: string }>;
}) {
  const { ciudad } = await params;
  // ...
}
```

**Datos a cargar:**

```typescript
// 1. Obtener city de lib/cities.ts (sin BD — solo para coords y metadatos UI)
const cityInfo = getCityBySlug(ciudad);
if (!cityInfo) notFound();

// 2. Obtener city de BD (para relations con clubs y races)
const city = await prisma.city.findUnique({
  where: { slug: ciudad },
  include: {
    clubs: {
      where: { verified: true },
      select: {
        id: true, slug: true, name: true, logoUrl: true,
        pace: true, frequency: true,
        awards: { select: { key: true, icon: true, label: true } },
        types: { select: { typeId: true } },
      },
      orderBy: { name: "asc" },
    },
    races: {
      where: { date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 5,
    },
  },
});

// 3. Próximas carreras (Run) de clubs en esta ciudad
const upcomingRuns = await prisma.run.findMany({
  where: {
    club: { cityId: city?.id ?? "__none__" },
    startAt: { gte: new Date() },
    status: "SCHEDULED",
  },
  include: {
    club: { select: { name: true, slug: true } },
  },
  orderBy: { startAt: "asc" },
  take: 20,
});
```

**Si `city` es null en BD pero `cityInfo` existe:** mostrar la página con datos de `cityInfo` pero con clubs/carreras vacíos (ciudad existente en `lib/cities.ts` pero sin datos en BD aún). NO hacer `notFound()` en este caso.

**Layout de la página (PRD §6.13 US-19):**

```
<main>
  ├── Hero / Cabecera
  │   ├── Título: "Carreras en [Ciudad]" (h1)
  │   ├── Subtítulo: "X clubs · Y carreras próximas"
  │   └── Buscador (reutiliza componente de búsqueda global si existe, o link a /buscar)
  │
  ├── Layout lg:grid-cols-[1fr_320px]
  │   ├── Columna principal
  │   │   ├── Toggle "Calendario / Lista" (Client Component)
  │   │   ├── Vista Lista: RunCard list (upcomingRuns)
  │   │   ├── Sección "Clubs en [Ciudad]" (clubs de la ciudad)
  │   │   └── Sección "Competiciones en [Ciudad]" (races de la ciudad)
  │   │
  │   └── Sidebar (320px)
  │       ├── WeatherWidget (Suspense + Skeleton)
  │       ├── AdCard placeholder ("Anúnciate aquí" → /anunciate)
  │       └── CTA "Añade tu club" → /onboarding/club
  │
  └── Sección FAQ (acordeón) + JSON-LD FAQPage
```

### 2. Componente `components/city/CityCalendarToggle.tsx`

Client Component. Toggle entre vista "Calendario" y "Lista".

Vista **Lista**: renderiza las carreras como tarjetas verticales (igual que `app/carreras/page.tsx`).

Vista **Calendario**: vista simple mensual — agrupa `upcomingRuns` por semana o por mes. NO instales una librería de calendario compleja. Implementa un grid de semanas con los runs del mes actual:

```
Semana  Lun  Mar  Mié  Jue  Vie  Sáb  Dom
1         ·    ·    ·    ·    ·  🏃   ·
2         ·    ·    ·    ·    ·    ·  🏃
```

Cada celda con carrera MUST mostrar el título truncado o solo el emoji. Click → ir a `/carreras/[slug]`.

### 3. Sección FAQ con JSON-LD

FAQ específica por ciudad. Genera preguntas dinámicas:

```typescript
const faqs = [
  {
    q: `¿Cuántos clubs de running hay en ${cityInfo.name}?`,
    a: `En ${cityInfo.name} hay ${clubs.length} clubs de running verificados en RunClubs.es, con salidas regulares cada semana.`,
  },
  {
    q: `¿Cuál es la mejor época para correr en ${cityInfo.name}?`,
    a: `En ${cityInfo.name} se puede correr todo el año. La primavera (marzo-mayo) y el otoño (septiembre-noviembre) son las épocas más agradables por temperatura.`,
  },
  {
    q: `¿Hay clubs de running para principiantes en ${cityInfo.name}?`,
    a: `Sí, varios clubs de ${cityInfo.name} organizan salidas para todos los niveles, incluyendo grupos de iniciación.`,
  },
  {
    q: `¿Cuándo son las próximas carreras en ${cityInfo.name}?`,
    a: upcomingRuns.length > 0
      ? `La próxima carrera en ${cityInfo.name} es "${upcomingRuns[0].title}" el ${formatDate(upcomingRuns[0].startAt)}.`
      : `Consulta el calendario de carreras de ${cityInfo.name} para ver las próximas salidas.`,
  },
];
```

**JSON-LD FAQPage:**
```typescript
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};
// Inyectar en <script type="application/ld+json"> via next/head o en layout
```

Usa `@radix-ui/react-accordion` (ya instalado) para el acordeón visual.

### 4. `generateStaticParams` y `generateMetadata`

```typescript
export async function generateStaticParams() {
  return CITY_DETAILS.map((c) => ({ ciudad: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ciudad: string }>;
}): Promise<Metadata> {
  const { ciudad } = await params;
  const cityInfo = getCityBySlug(ciudad);
  if (!cityInfo) return {};
  return {
    title: `Carreras y clubs de running en ${cityInfo.name} | RunClubs.es`,
    description: `Encuentra clubs de running, carreras y eventos deportivos en ${cityInfo.name}. Únete a la comunidad runner de ${cityInfo.region ?? "España"}.`,
    alternates: { canonical: `/ciudades/${ciudad}` },
  };
}
```

### 5. AdCard placeholder

Crea `components/common/AdCard.tsx` si no existe:
```typescript
export function AdCard({ city }: { city?: string }) {
  return (
    <a
      href="/anunciate"
      className="block rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
    >
      <span className="block text-lg mb-1">📣</span>
      {city ? `Anúnciate en ${city}` : "Anúnciate aquí"}
    </a>
  );
}
```

### 6. Claves i18n en `lib/i18n/es.ts`

```typescript
cityPage: {
  title: "Carreras en",
  subtitle: (clubs: number, runs: number) =>
    `${clubs} club${clubs !== 1 ? "s" : ""} · ${runs} carrera${runs !== 1 ? "s" : ""} próxima${runs !== 1 ? "s" : ""}`,
  clubsSection: "Clubs en",
  racesSection: "Competiciones en",
  calendarView: "Calendario",
  listView: "Lista",
  addClub: "Añade tu club",
  advertise: "Anúnciate aquí",
  noClubs: "Todavía no hay clubs registrados en esta ciudad.",
  noRuns: "No hay carreras próximas programadas.",
  noRaces: "No hay competiciones próximas.",
  faqTitle: "Preguntas frecuentes",
},
```

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Filtros avanzados en ciudad (pertenece a `clubs-directory`)
- Comparación entre ciudades
- Mapa interactivo de la ciudad (fuera de scope MVP)
- Contenido editorial por ciudad (copy estático)
- Rutas de running (fuera de scope)
- AdCard con contenido real de anunciantes (pertenece a `advertising`)

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| Ruta | `/ciudades/[ciudad]` (slug de ciudad) |
| Generación | `generateStaticParams` con CITY_DETAILS (ISR) |
| Ciudad sin BD | Mostrar página vacía, no 404 |
| Vista calendario | Grid de semanas simple, sin librería externa |
| AdCard | Placeholder → `/anunciate` (sin contenido real aún) |
| FAQ | Dinámico con datos reales, JSON-LD FAQPage |
| Weather | Integrar WeatherWidget si existe, placeholder si no |

---

## Verificación

- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `/ciudades/madrid` carga sin errores
- [ ] `/ciudades/barcelona` carga sin errores
- [ ] `/ciudades/ciudad-inventada` → 404
- [ ] WeatherWidget visible en sidebar (o placeholder)
- [ ] Toggle Calendario / Lista funciona
- [ ] FAQ visible con acordeón
- [ ] JSON-LD `FAQPage` en el HTML de la página
- [ ] `<title>` correcto para cada ciudad
- [ ] AdCard enlaza a `/anunciate`
- [ ] CTA "Añade tu club" enlaza a `/onboarding/club`
