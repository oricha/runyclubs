# PROMPT: Implementar capability `races-competitions`

## Contexto frío — lée esto antes de tocar cualquier archivo

Estás en el repo **RunClubs.es** (`/Users/zion/dev/project/runclub`).  
Stack: **Next.js 16.2.9** App Router · **React 19** · **TypeScript** · **Prisma 7.8.0** con driver adapter · **Tailwind CSS v3.4.19**.

El proyecto usa **Spec-Driven Development con OpenSpec**. Cada requirement en tus spec files MUST use `MUST` o `SHALL` (RFC 2119). Corre `openspec validate --strict` antes del commit.

### Archivos críticos que DEBES leer antes de empezar

```
prisma/schema.prisma          — modelo Race (ya existe), City
lib/cities.ts                 — CITY_DETAILS, getCityBySlug()
lib/prisma.ts                 — singleton Prisma con driver adapter
lib/i18n/es.ts               — para añadir claves races.*
app/carreras/page.tsx         — patrón de listado de runs (referencia de filtros)
types/index.ts                — tipos existentes para referencia
```

---

## Estado actual del repo

### Modelo `Race` en Prisma (ya existe, NO modificar)

```prisma
model Race {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  cityId      String
  city        City     @relation(fields: [cityId], references: [id])
  date        DateTime
  description String?  @db.Text
  distances   String[] // ["5K", "10K", "21K", "42K", "trail"]
  isPopular   Boolean  @default(false)
  status      String   @default("upcoming") // "upcoming" | "past"
  externalUrl String?
  createdAt   DateTime @default(now())
}
```

**No existe** `RaceLead` ni `SuggestedRace` — lo crearás.

**No existe** `app/competiciones/` — lo crearás.

---

## Qué DEBES implementar

### 1. Modelo `RaceLead` en `prisma/schema.prisma`

Añade al schema:
```prisma
model RaceLead {
  id          String   @id @default(cuid())
  name        String
  city        String
  date        String   // texto libre (ej. "15 noviembre 2026")
  distances   String[] // ["10K", "21K"]
  website     String?
  email       String?  // email del que sugiere (opcional)
  notes       String?  @db.Text
  status      String   @default("pending") // "pending" | "reviewed" | "published"
  createdAt   DateTime @default(now())
}
```

Genera la migración:
```bash
npx prisma migrate dev --name add-race-lead
```

### 2. Página principal `app/competiciones/page.tsx`

**Server Component** con filtros via `searchParams`.

**IMPORTANTE — Next.js 16 searchParams es Promise:**
```typescript
export default async function CompeticionesPage({
  searchParams,
}: {
  searchParams: Promise<{ ciudad?: string; distancia?: string }>;
}) {
  const { ciudad, distancia } = await searchParams;
  // ...
}
```

**Lógica de datos:**

```typescript
const now = new Date();

// Competiciones UPCOMING
const upcoming = await prisma.race.findMany({
  where: {
    date: { gte: now },
    ...(ciudad ? { city: { slug: ciudad } } : {}),
    ...(distancia ? { distances: { has: distancia } } : {}),
  },
  include: { city: { select: { name: true, slug: true } } },
  orderBy: { date: "asc" },
});

// Competiciones PAST (máx. 20 más recientes)
const past = await prisma.race.findMany({
  where: {
    date: { lt: now },
    ...(ciudad ? { city: { slug: ciudad } } : {}),
    ...(distancia ? { distances: { has: distancia } } : {}),
  },
  include: { city: { select: { name: true, slug: true } } },
  orderBy: { date: "desc" },
  take: 20,
});
```

**Layout:**

```
/competiciones
├── Cabecera: "Competiciones de running en España"
│   └── Subtítulo: "Maratones, medias maratones y carreras populares"
│
├── Filtros (Client Component)
│   ├── Selector ciudad (CITY_DETAILS, valor vacío = todas)
│   └── Selector distancia: "5K" | "10K" | "21K" | "42K" | "Trail" | "Todas"
│   └── Los filtros MUST actualizar la URL (router.push con searchParams)
│
├── Sección "PRÓXIMAS" (con contador)
│   └── RaceCard list
│
├── Sección "PASADAS" (colapsable por defecto si > 5)
│   └── RaceCard list
│
└── Panel lateral / sección inferior "Sugerir una carrera"
    └── Formulario SuggestRaceForm
```

### 3. Componente `components/race/RaceCard.tsx`

```typescript
interface RaceCardProps {
  race: {
    id: string;
    name: string;
    date: Date;
    city: { name: string; slug: string };
    distances: string[];
    isPopular: boolean;
    externalUrl: string | null;
    description: string | null;
  };
}
```

**Elementos visuales:**
- Fecha formateada: `"Sáb, 15 nov 2026"` (Intl.DateTimeFormat es-ES)
- Nombre de la carrera (h3)
- Ciudad + región
- Chips de distancias: `distances.map(d => <Badge>{d}</Badge>)`
- Badge "Popular" (con icono ⭐) si `isPopular: true` — color amber/yellow
- CTA: si `externalUrl` → `<a href={externalUrl} target="_blank">Inscribirse →</a>`, si no → botón deshabilitado "Inscripción no disponible"
- Estilo: `border border-border rounded-xl p-4 hover:shadow-sm transition-shadow`

### 4. Componente filtros `components/race/RaceFilters.tsx`

Client Component. Usa `useRouter` y `useSearchParams` de `next/navigation`:

```typescript
"use client";
import { useRouter, useSearchParams } from "next/navigation";
```

Al cambiar cualquier filtro, MUST hacer `router.push("/competiciones?" + params.toString())` para reflejar filtros en URL (SSR-friendly).

### 5. Server Action `subscribeRaceLead`

Crea `lib/actions/races.ts`:

```typescript
"use server";

export async function suggestRace(data: {
  name: string;
  city: string;
  date: string;
  distances: string[];
  website?: string;
  email?: string;
  notes?: string;
}): Promise<{ success: boolean; error?: string }>;
```

- MUST validar que `name` y `city` y `date` no estén vacíos
- MUST crear `RaceLead` en BD con `status: "pending"`
- MUST retornar `{ success: true }` o `{ success: false, error: "..." }`
- NO notificar por email en esta fase (solo guardar en BD)

### 6. Formulario `components/race/SuggestRaceForm.tsx`

Client Component. Campos:
- Nombre de la carrera (text, required)
- Ciudad (text libre — no dropdown — para admitir ciudades no listadas)
- Fecha aproximada (text libre: "noviembre 2026")
- Distancias (checkboxes: 5K, 10K, 21K, 42K, Trail, Otro)
- URL oficial (url, opcional)
- Tu email para seguimiento (email, opcional)
- Notas adicionales (textarea, opcional)

Al enviar: llama `suggestRace(data)` → muestra "¡Gracias! Revisaremos tu sugerencia." si éxito.

### 7. Claves i18n en `lib/i18n/es.ts`

```typescript
races: {
  title: "Competiciones de running en España",
  subtitle: "Maratones, medias maratones y carreras populares",
  upcoming: "Próximas",
  past: "Pasadas",
  filterCity: "Ciudad",
  filterDistance: "Distancia",
  allCities: "Todas las ciudades",
  allDistances: "Todas las distancias",
  popularBadge: "Popular",
  registerCta: "Inscribirse",
  noUpcoming: "No hay competiciones próximas con estos filtros.",
  noPast: "No hay competiciones pasadas.",
  suggestTitle: "¿Conoces una carrera que falta?",
  suggestSubtitle: "Ayúdanos a completar el directorio.",
  suggestCta: "Sugerir carrera",
  suggestSuccess: "¡Gracias! Revisaremos tu sugerencia.",
  suggestNameLabel: "Nombre de la carrera",
  suggestCityLabel: "Ciudad",
  suggestDateLabel: "Fecha aproximada",
  suggestDistancesLabel: "Distancias",
  suggestUrlLabel: "URL oficial (opcional)",
  suggestEmailLabel: "Tu email (opcional)",
  suggestNotesLabel: "Notas adicionales (opcional)",
  suggestSubmit: "Enviar sugerencia",
},
```

---

## Lo que EXPLÍCITAMENTE no debes implementar

- Página de detalle de competición `/competiciones/[slug]` (no está en el roadmap MVP)
- Pago de listing de competición (pertenece a `monetization-billing`)
- Admin para publicar RaceLeads (pertenece a `admin-panel` futura iteración)
- Mapa de competiciones
- Calendario de competiciones por mes (pertenece a `city-pages`)
- Sistema de inscripción nativo (solo link externo)

---

## Decisiones de diseño ya tomadas

| Decisión | Elección |
|----------|----------|
| Modelo lead | `RaceLead` en BD con status "pending" |
| Fecha de competición | `DateTime` en Race; `String` libre en RaceLead |
| Filtros | URL searchParams (SSR-friendly, compartibles) |
| Pasadas | Colapsables si > 5, máx. 20 más recientes |
| Inscripción | Solo link externo; sin sistema propio |
| Ciudad en suggest | Text libre (no dropdown) para admitir cualquier ciudad |

---

## Verificación

- [ ] `npx prisma migrate dev` sin errores (crea tabla `RaceLead`)
- [ ] `npx openspec validate --strict` pasa
- [ ] `npx tsc --noEmit` sin errores
- [ ] `/competiciones` carga sin errores
- [ ] Filtro por ciudad actualiza URL y filtra resultados
- [ ] Filtro por distancia filtra resultados
- [ ] RaceCard muestra badge "Popular" para races con `isPopular: true`
- [ ] CTA de inscripción enlaza a `externalUrl` si existe
- [ ] Formulario "Sugerir carrera" guarda `RaceLead` en BD
- [ ] Tras submit exitoso se muestra mensaje de confirmación
