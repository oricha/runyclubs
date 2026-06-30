# RunClubs.es — Documento técnico y de producto completo

> Especificación detallada para construir **https://www.runclubs.es/**, replicando estilo, menús, funcionalidades y estructura de RunClubs.nl, adaptado a España.
> Incluye: textos de interfaz en español listos para pegar, esquema de base de datos, modelos de datos, árbol de componentes React, código de componentes clave, configuración de Tailwind y tokens de diseño.

**Índice**
1. Visión de producto
2. Tokens de diseño y configuración de Tailwind
3. Tipografías y carga de fuentes
4. Sistema de navegación y rutas
5. Textos de interfaz en español (i18n, listos para pegar)
6. Esquema de base de datos (Prisma)
7. Tipos TypeScript / modelos de dominio
8. Árbol de componentes React
9. Código de componentes clave
10. API / endpoints
11. Lógica de carreras recurrentes
12. Filtros y búsqueda
13. SEO y páginas generadas
14. Checklist de implementación
15. Nota legal

---

## 1. Visión de producto

RunClubs.es es un directorio social para **descubrir clubs de running y carreras grupales** en ciudades de España. Funciones principales:

- Descubrir clubs por ciudad, ritmo, tipo y día de la semana.
- Ver carreras próximas en lista o cuadrícula.
- Ficha detallada de cada club y de cada carrera.
- Apuntarse a carreras y unirse a clubs ("Unirse al club" / "Apuntarse").
- Onboarding para que organizadores publiquen su club y carreras recurrentes.
- Espacios publicitarios y newsletter.
- Geolocalización para encontrar lo más cercano.
- Sistema de premios/insignias de clubs.

Estética: minimalista, cálida, editorial. Fondo blanco hueso, titulares serif, botones oscuros tipo pill.


---

## 2. Tokens de diseño y configuración de Tailwind

Tokens reales extraídos del sitio original (formato HSL + equivalente HEX).

\`\`\`css
/* app/globals.css */
@layer base {
  :root {
    --background: 40 20% 98%;        /* #FBFAF9 blanco hueso cálido */
    --foreground: 30 10% 10%;        /* #1C1A17 casi negro cálido */
    --primary: 30 10% 10%;           /* botones oscuros */
    --primary-foreground: 40 20% 98%;
    --secondary: 35 15% 93%;         /* #EEEAE5 fondos suaves */
    --muted: 35 15% 93%;
    --muted-foreground: 30 8% 52%;   /* #8A847C texto gris */
    --accent: 35 15% 93%;
    --accent-foreground: 30 10% 10%;
    --border: 35 15% 90%;            /* #E7E2DC bordes sutiles */
    --input: 35 15% 90%;
    --ring: 30 10% 10%;
    --card: 0 0% 100%;               /* tarjetas blancas */
    --card-foreground: 30 10% 10%;
    --popover: 0 0% 100%;
    --popover-foreground: 30 10% 10%;
    --destructive: 0 84.2% 60.2%;    /* #EF4444 */
    --destructive-foreground: 40 20% 98%;
    --brand-accent: 0 49% 16%;       /* #3B1414 rojo oscuro de marca */
    --radius: 0.5rem;
  }
}

body {
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-feature-settings: "rlig" 1, "calt" 1;
}
\`\`\`

\`\`\`ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1.5rem", screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent: { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        brand: "hsl(var(--brand-accent))",
      },
      borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
      fontFamily: {
        serif: ["var(--font-instrument-serif)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
      },
      animation: { "fade-in": "fade-in 0.4s ease-out" },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
\`\`\`


---

## 3. Tipografías y carga de fuentes

- **Titulares:** Instrument Serif (serif editorial). Usar cursiva para resaltar parte del título (ej. "Encuentra tu *club de running*").
- **Cuerpo / UI:** Inter. Etiquetas de sección en MAYÚSCULAS, 11px, peso 500, letter-spacing ~0.06em.

\`\`\`ts
// app/fonts.ts
import { Inter, Instrument_Serif } from "next/font/google";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
\`\`\`

\`\`\`tsx
// app/layout.tsx (extracto)
import { inter, instrumentSerif } from "./fonts";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={\`\${inter.variable} \${instrumentSerif.variable}\`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
\`\`\`

Clases utilitarias recomendadas:
- Titular grande: \`font-serif text-5xl md:text-6xl font-normal tracking-tight\`
- Titular con cursiva parcial: envolver la palabra en \`<em className="italic">\`
- Etiqueta de sección: \`text-[11px] font-medium uppercase tracking-wider text-muted-foreground\`
- Botón primario (pill): \`rounded-full bg-primary px-6 py-3 text-primary-foreground\`


---

## 4. Sistema de navegación y rutas

### Header (pill flotante)
Header centrado sobre el contenido, fondo claro translúcido con sombra suave y esquinas redondeadas.

- Logo "RUNCLUBS®" → \`/\`
- "Descubrir carreras" → \`/carreras\`
- "Clubs" → \`/clubs\`
- Icono calendario → \`/calendarios\`
- Icono lupa → abre modal de búsqueda (atajo ⌘K / Ctrl+K)
- Icono usuario → menú de cuenta / login

### Mapa de rutas (App Router)

\`\`\`
app/
  page.tsx                         -> Home "/"
  carreras/page.tsx                -> Listado de carreras "/carreras"
  carreras/[slug]/page.tsx         -> Ficha de carrera
  clubs/page.tsx                   -> Listado de clubs "/clubs"
  clubs/[slug]/page.tsx            -> Ficha de club
  calendarios/page.tsx             -> Calendarios por ciudad
  calendarios/[ciudad]/page.tsx    -> Calendario de una ciudad
  ciudades/[ciudad]/page.tsx       -> Página SEO de ciudad
  tipos/[tipo]/page.tsx            -> Página SEO por tipo (ej. clubs-sociales)
  anunciate/page.tsx               -> Landing publicidad "/anunciate"
  onboarding/club/page.tsx         -> Alta de club "/onboarding/club"
  blog/page.tsx                    -> Blog
  blog/[slug]/page.tsx             -> Artículo
  privacidad/page.tsx              -> Privacidad
  terminos/page.tsx                -> Términos
  cuenta/page.tsx                  -> Cuenta de usuario
  api/...                          -> Endpoints (ver sección 10)
\`\`\`

Equivalencia con el original (.nl): \`/runs\`→\`/carreras\`, \`/runclubs\`→\`/clubs\`, \`/advertise\`→\`/anunciate\`, \`/onboarding/runclub\`→\`/onboarding/club\`.


---

## 5. Textos de interfaz en español (listos para pegar)

Diccionario i18n centralizado. Puedes usarlo con next-intl, i18next o como objeto plano.

\`\`\`ts
// lib/i18n/es.ts
export const es = {
  nav: {
    discover: "Descubrir carreras",
    clubs: "Clubs",
    calendars: "Calendarios",
    search: "Buscar",
    account: "Mi cuenta",
    login: "Iniciar sesión",
  },
  home: {
    heroTitlePre: "Encuentra tu",
    heroTitleEm: "club de running",
    heroSubtitle:
      "Te ayudamos a encontrar los mejores clubs de running de tu ciudad. Vengas a charlar o a sudar, aquí tienes tu sitio.",
    searchPlaceholder: "Busca clubs y carreras...",
    clubsCount: "{count} clubs",
    runsCount: "{count} carreras próximas",
    videoCredit: "Vídeo de cottonbro studio",
    upcomingRuns: "Próximas carreras",
    runClubs: "Clubs de running",
    viewAll: "Ver todo",
    viewAllRuns: "Ver las {count} carreras",
  },
  geo: {
    title: "¿Dónde corres?",
    useLocation: "Usar mi ubicación",
  },
  ad: {
    title: "¿Tu marca aquí?",
    text: "Promociona tu carrera, tu tienda de running o tu marca entre corredores de toda España.",
    cta: "Anúnciate aquí",
  },
  filters: {
    title: "Filtros",
    clearAll: "Borrar todo",
    resultsSummary: "{clubs} clubs · {runs} carreras",
    city: "Ciudad",
    typeOfRun: "Tipo de carrera",
    pace: "Ritmo",
    dayOfWeek: "Día de la semana",
    date: "Fecha",
    thisWeek: "Esta semana",
    thisMonth: "Este mes",
    findRuns: "Buscar carreras",
    findClubs: "Buscar clubs",
    searchRuns: "Buscar carreras...",
    searchClubs: "Buscar clubs...",
  },
  runsPage: {
    title: "Próximas carreras",
    subtitle:
      "Descubre carreras grupales por toda España. Filtra por ciudad, ritmo o tipo para encontrar tu próxima salida.",
    gridView: "Vista cuadrícula",
    listView: "Vista lista",
    cityCalendarsTitle: "¿Buscas carreras en tu ciudad?",
    cityCalendarsText: "Consulta los calendarios por ciudad para ver todas las carreras cerca de ti.",
    cityCalendarsCta: "Calendarios por ciudad",
  },
  clubsPage: {
    title: "Descubre clubs de running",
    subtitle: "{count} clubs por toda España. Encuentra tu grupo.",
    addClub: "Añade tu club",
  },
  clubDetail: {
    backToClubs: "Todos los clubs",
    usesPlatform: "Usa RunClubs.es para inscripciones",
    members: "{count} miembros",
    readMore: "Leer más",
    readLess: "Leer menos",
    upcomingRuns: "Próximas carreras",
    joinClub: "Unirse al club",
    followInstagram: "Seguir en Instagram",
    runs: "CARRERAS",
    pace: "RITMO",
    type: "TIPO",
    membersLabel: "MIEMBROS",
    city: "CIUDAD",
    moreClubsNearby: "Más clubs cerca",
  },
  runDetail: {
    backToRuns: "Todas las carreras",
    hostedBy: "ORGANIZADO POR",
    aboutThisRun: "SOBRE ESTA CARRERA",
    runnersGoing: "{count} corredores apuntados",
    joinRun: "Apuntarse",
    shareRun: "Compartir carrera",
    date: "FECHA",
    time: "HORA",
    location: "UBICACIÓN",
    distance: "DISTANCIA",
    paceLabel: "RITMO",
    notKnownYet: "Aún sin definir",
  },
  footer: {
    newsletterTitle: "No te pierdas las nuevas carreras de los clubs",
    newsletterText:
      "Un único correo semanal, práctico, con las próximas carreras de la comunidad. Sin ruido.",
    subscribe: "Suscribirme",
    emailPlaceholder: "tu@email.com",
    discover: "DESCUBRIR",
    runTypes: "TIPOS DE CARRERA",
    cities: "CIUDADES",
    company: "EMPRESA",
    followUs: "SÍGUENOS",
    home: "Inicio",
    cityCalendars: "Calendarios por ciudad",
    saturdayClubs: "Clubs de los sábados",
    sundayClubs: "Clubs de los domingos",
    blog: "Blog",
    partnerships: "Colaboraciones",
    addClub: "Añade tu club",
    advertise: "Publicidad",
    runnedBy: "Gestionado por",
    privacy: "Privacidad",
    terms: "Términos",
  },
  common: {
    perWeek: "{n}x/semana",
    allPaces: "Todos los ritmos",
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
    km: "km",
    feedback: "Sugerencias",
    showAwards: "Ver premios del club",
    join: "Unirse",
    going: "Voy",
  },
} as const;
\`\`\`

### Tipos de carrera (taxonomía con etiquetas en español)

\`\`\`ts
// lib/run-types.ts
export const RUN_TYPES = [
  { id: "social",    emoji: "😊", label: "Social" },
  { id: "founders",  emoji: "🏆", label: "Fundadores" },
  { id: "performance", emoji: "⏱️", label: "Rendimiento" },
  { id: "trail",     emoji: "🏔️", label: "Trail" },
  { id: "beginner",  emoji: "😊", label: "Apto principiantes" },
  { id: "long-run",  emoji: "🏃", label: "Tirada larga" },
  { id: "girls-only", emoji: "🙋‍♀️", label: "Solo chicas" },
  { id: "lgbtqi",    emoji: "🏳️‍🌈", label: "LGTBIQ+" },
  { id: "singles",   emoji: "❤️", label: "Solteros" },
  { id: "international", emoji: "🌍", label: "Internacional" },
  { id: "beer-run",  emoji: "🍺", label: "Cervecera" },
] as const;
\`\`\`

### Ciudades por defecto (España)

\`\`\`ts
export const CITIES = [
  "Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao",
  "Málaga", "Zaragoza", "Granada", "Murcia", "Palma",
  "Alicante", "A Coruña", "Valladolid", "Vigo", "Santander",
];
\`\`\`


---

## 6. Esquema de base de datos (Prisma)

\`\`\`prisma
// prisma/schema.prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Pace { ALL_PACES BEGINNER INTERMEDIATE ADVANCED }
enum MemberRole { OWNER ADMIN MEMBER }
enum RunStatus { SCHEDULED CANCELLED COMPLETED }

model User {
  id            String   @id @default(cuid())
  name          String?
  email         String   @unique
  emailVerified DateTime?
  image         String?
  city          String?
  createdAt     DateTime @default(now())
  memberships   ClubMember[]
  attendances   RunAttendee[]
  ownedClubs    Club[]   @relation("ClubOwner")
}

model City {
  id      String  @id @default(cuid())
  name    String  @unique
  slug    String  @unique
  region  String?
  lat     Float?
  lng     Float?
  clubs   Club[]
}

model Club {
  id            String   @id @default(cuid())
  slug          String   @unique
  name          String
  description   String   @db.Text
  logoUrl       String?
  coverUrl      String?
  instagramUrl  String?
  stravaUrl     String?
  website       String?
  cityId        String
  city          City     @relation(fields: [cityId], references: [id])
  pace          Pace     @default(ALL_PACES)
  frequency     Int      @default(1)        // veces por semana
  usesPlatform  Boolean  @default(false)    // "Usa RunClubs.es para inscripciones"
  verified      Boolean  @default(false)
  ownerId       String
  owner         User     @relation("ClubOwner", fields: [ownerId], references: [id])
  types         ClubType[]
  awards        ClubAward[]
  members       ClubMember[]
  runs          Run[]
  recurringRuns RecurringRun[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([cityId])
  @@index([pace])
}

model RunTypeTag {
  id     String @id @default(cuid())
  key    String @unique   // "social", "performance", ...
  emoji  String
  label  String
  clubs  ClubType[]
  runs   RunType[]
}

model ClubType {
  clubId String
  typeId String
  club   Club       @relation(fields: [clubId], references: [id], onDelete: Cascade)
  type   RunTypeTag @relation(fields: [typeId], references: [id], onDelete: Cascade)
  @@id([clubId, typeId])
}

model ClubAward {
  id        String   @id @default(cuid())
  clubId    String
  club      Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  key       String   // "founders", "verified", "top-club"
  label     String
  icon      String   // emoji o nombre de icono
  awardedAt DateTime @default(now())
}

model ClubMember {
  id       String     @id @default(cuid())
  clubId   String
  userId   String
  role     MemberRole @default(MEMBER)
  club     Club       @relation(fields: [clubId], references: [id], onDelete: Cascade)
  user     User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt DateTime   @default(now())
  @@unique([clubId, userId])
}

model RecurringRun {
  id          String   @id @default(cuid())
  clubId      String
  club        Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  title       String
  description String?  @db.Text
  weekday     Int      // 0=domingo ... 6=sábado
  time        String   // "HH:mm"
  location    String
  lat         Float?
  lng         Float?
  distanceKm  Float?
  pace        String?  // "6:00/km"
  types       String[] // claves de tipo
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  runs        Run[]
}

model Run {
  id             String   @id @default(cuid())
  slug           String   @unique
  clubId         String
  club           Club     @relation(fields: [clubId], references: [id], onDelete: Cascade)
  recurringRunId String?
  recurringRun   RecurringRun? @relation(fields: [recurringRunId], references: [id])
  title          String
  description    String?  @db.Text
  startAt        DateTime
  location       String
  lat            Float?
  lng            Float?
  distanceKm     Float?
  pace           String?
  status         RunStatus @default(SCHEDULED)
  types          RunType[]
  attendees      RunAttendee[]
  createdAt      DateTime @default(now())

  @@index([startAt])
  @@index([clubId])
}

model RunType {
  runId  String
  typeId String
  run    Run        @relation(fields: [runId], references: [id], onDelete: Cascade)
  type   RunTypeTag @relation(fields: [typeId], references: [id], onDelete: Cascade)
  @@id([runId, typeId])
}

model RunAttendee {
  id      String   @id @default(cuid())
  runId   String
  userId  String
  run     Run      @relation(fields: [runId], references: [id], onDelete: Cascade)
  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinedAt DateTime @default(now())
  @@unique([runId, userId])
}

model NewsletterSubscriber {
  id        String   @id @default(cuid())
  email     String   @unique
  city      String?
  createdAt DateTime @default(now())
}
\`\`\`


---

## 7. Tipos TypeScript / modelos de dominio

\`\`\`ts
// types/index.ts
export type Pace = "ALL_PACES" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface RunTypeTag { key: string; emoji: string; label: string; }

export interface ClubSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  logoUrl?: string;
  pace: Pace;
  frequency: number;          // veces/semana
  types: RunTypeTag[];
  awards: { key: string; icon: string; label: string }[];
}

export interface ClubDetail extends ClubSummary {
  description: string;
  coverUrl?: string;
  instagramUrl?: string;
  usesPlatform: boolean;
  memberCount: number;
  memberAvatars: string[];
  runsSummary: string;        // "Cada miércoles y domingo"
  upcomingRuns: RunSummary[];
  nearbyClubs: ClubSummary[];
}

export interface RunSummary {
  id: string;
  slug: string;
  title: string;
  startAt: string;            // ISO
  location: string;
  club: { name: string; logoUrl?: string; slug: string };
  distanceKm?: number;
  pace?: string;
  types: RunTypeTag[];
  attendeeCount: number;
}

export interface RunDetail extends RunSummary {
  description?: string;
  attendeeAvatars: string[];
  club: ClubSummary & { name: string; logoUrl?: string; slug: string };
}

export interface RunFilters {
  city?: string;
  types?: string[];
  pace?: Pace[];
  weekday?: number[];
  dateRange?: "week" | "month";
  q?: string;
}
\`\`\`


---

## 8. Árbol de componentes React

\`\`\`
components/
  layout/
    Header.tsx              // pill flotante con nav + iconos
    Footer.tsx              // newsletter + columnas
    FeedbackWidget.tsx      // botón flotante de sugerencias
  search/
    SearchModal.tsx         // command palette (⌘K)
    SearchTrigger.tsx       // input/botón que lo abre
  filters/
    FilterSidebar.tsx       // contenedor de filtros
    FilterAccordion.tsx     // sección colapsable con contador
    ResultsSummary.tsx      // "100 clubs · 143 carreras"
    ClearAllButton.tsx
  cards/
    RunCard.tsx             // tarjeta de carrera (lista)
    RunCardGrid.tsx         // variante cuadrícula
    ClubCard.tsx            // tarjeta de club (grid/list)
    DateBlock.tsx           // bloque día/mes
    TypeChip.tsx            // emoji + texto
    AvatarStack.tsx         // avatares apilados +N
  club/
    ClubHeader.tsx          // cover + logo + nombre + badge
    ClubMeta.tsx            // lista de metadatos
    ClubDescription.tsx     // con "Leer más"
    JoinClubButton.tsx
  run/
    RunHeader.tsx
    RunMeta.tsx             // FECHA/HORA/UBICACIÓN/...
    HostedByCard.tsx
    JoinRunButton.tsx
    ShareRunButton.tsx
  marketing/
    Hero.tsx                // vídeo de fondo + título + buscador
    AdCard.tsx              // "¿Tu marca aquí?"
    GeolocationCard.tsx     // "¿Dónde corres?"
    NewsletterForm.tsx
  ui/                       // primitivas (shadcn/ui)
    Button.tsx  Card.tsx  Dialog.tsx  Accordion.tsx
    Input.tsx   Badge.tsx  Avatar.tsx  Toggle.tsx
  common/
    SectionLabel.tsx        // etiqueta MAYÚSCULAS
    ViewToggle.tsx          // grid/list
    Container.tsx
\`\`\`


---

## 9. Código de componentes clave

### 9.1 Header (pill flotante)

\`\`\`tsx
// components/layout/Header.tsx
"use client";
import Link from "next/link";
import { Calendar, Search, User } from "lucide-react";
import { es } from "@/lib/i18n/es";

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="pointer-events-auto flex items-center gap-6 rounded-full border border-border
                      bg-background/80 px-5 py-2.5 shadow-sm backdrop-blur-md">
        <Link href="/" className="text-lg font-black tracking-tight">
          RUNCLUBS<sup className="text-[10px]">®</sup>
        </Link>
        <div className="hidden items-center gap-5 text-sm md:flex">
          <Link href="/carreras" className="hover:opacity-70">{es.nav.discover}</Link>
          <Link href="/clubs" className="hover:opacity-70">{es.nav.clubs}</Link>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/calendarios" aria-label={es.nav.calendars}
                className="rounded-full p-2 hover:bg-secondary"><Calendar size={18} /></Link>
          <button onClick={onOpenSearch} aria-label={es.nav.search}
                  className="rounded-full p-2 hover:bg-secondary"><Search size={18} /></button>
          <Link href="/cuenta" aria-label={es.nav.account}
                className="rounded-full bg-secondary p-2"><User size={18} /></Link>
        </div>
      </nav>
    </header>
  );
}
\`\`\`

### 9.2 Hero

\`\`\`tsx
// components/marketing/Hero.tsx
"use client";
import { es } from "@/lib/i18n/es";
import { SearchTrigger } from "@/components/search/SearchTrigger";

export function Hero({ clubs, runs }: { clubs: number; runs: number }) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl">
      <video autoPlay muted loop playsInline
             className="absolute inset-0 h-full w-full object-cover"
             src="/media/hero.mp4" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 mx-auto max-w-2xl px-6 py-28 text-center text-white">
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          {es.home.heroTitlePre} <em className="italic">{es.home.heroTitleEm}</em>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/90">{es.home.heroSubtitle}</p>
        <div className="mt-8"><SearchTrigger placeholder={es.home.searchPlaceholder} /></div>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-white/90">
          <span>{es.home.clubsCount.replace("{count}", String(clubs))}</span>
          <span>{es.home.runsCount.replace("{count}", String(runs))}</span>
        </div>
      </div>
    </section>
  );
}
\`\`\`


### 9.3 RunCard (tarjeta de carrera)

\`\`\`tsx
// components/cards/RunCard.tsx
import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";
import { DateBlock } from "./DateBlock";
import { TypeChip } from "./TypeChip";
import type { RunSummary } from "@/types";

export function RunCard({ run }: { run: RunSummary }) {
  const d = new Date(run.startAt);
  const fecha = d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  const hora = d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  return (
    <Link href={\`/carreras/\${run.slug}\`}
          className="flex gap-4 rounded-xl border border-border bg-card p-4 transition hover:shadow-md">
      <DateBlock date={d} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium">{run.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Calendar size={14} />{fecha}</span>
          <span className="inline-flex items-center gap-1"><Clock size={14} />{hora}</span>
          <span className="inline-flex items-center gap-1"><MapPin size={14} />{run.location}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{run.club.name}</span>
          {run.distanceKm && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{run.distanceKm} km</span>}
          {run.pace && <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{run.pace}</span>}
          {run.types.map((t) => <TypeChip key={t.key} type={t} />)}
        </div>
      </div>
    </Link>
  );
}
\`\`\`

### 9.4 DateBlock y TypeChip

\`\`\`tsx
// components/cards/DateBlock.tsx
export function DateBlock({ date }: { date: Date }) {
  const dia = date.getDate();
  const mes = date.toLocaleDateString("es-ES", { month: "short" }).toUpperCase().replace(".", "");
  return (
    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-secondary">
      <span className="text-lg font-semibold leading-none">{dia}</span>
      <span className="text-[10px] font-medium tracking-wide text-muted-foreground">{mes}</span>
    </div>
  );
}

// components/cards/TypeChip.tsx
import type { RunTypeTag } from "@/types";
export function TypeChip({ type }: { type: RunTypeTag }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-xs">
      <span>{type.emoji}</span>{type.label}
    </span>
  );
}
\`\`\`

### 9.5 ClubCard

\`\`\`tsx
// components/cards/ClubCard.tsx
import Link from "next/link";
import { MapPin, CalendarDays, Gauge } from "lucide-react";
import type { ClubSummary } from "@/types";
import { es } from "@/lib/i18n/es";

const paceLabel: Record<string,string> = {
  ALL_PACES: es.common.allPaces, BEGINNER: es.common.beginner,
  INTERMEDIATE: es.common.intermediate, ADVANCED: es.common.advanced,
};

export function ClubCard({ club }: { club: ClubSummary }) {
  return (
    <Link href={\`/clubs/\${club.slug}\`}
          className="group relative rounded-xl border border-border bg-card p-5 transition hover:shadow-md">
      {club.awards.length > 0 && (
        <div className="absolute right-3 top-3 flex gap-1">
          {club.awards.map((a) => <span key={a.key} title={a.label}>{a.icon}</span>)}
        </div>
      )}
      <div className="flex flex-col items-center text-center">
        <img src={club.logoUrl ?? "/placeholder-club.png"} alt={club.name}
             className="h-20 w-20 rounded-2xl object-cover" />
        <h3 className="mt-4 font-medium">{club.name}</h3>
        <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin size={14} />{club.city}</span>
          <span className="inline-flex items-center gap-1"><CalendarDays size={14} />{es.common.perWeek.replace("{n}", String(club.frequency))}</span>
          <span className="inline-flex items-center gap-1"><Gauge size={14} />{paceLabel[club.pace]}</span>
        </div>
      </div>
    </Link>
  );
}
\`\`\`


### 9.6 SearchModal (command palette ⌘K)

\`\`\`tsx
// components/search/SearchModal.tsx
"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function SearchModal({ open, onOpenChange }:{ open:boolean; onOpenChange:(v:boolean)=>void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); onOpenChange(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onOpenChange]);

  useEffect(() => {
    if (!q) { setResults([]); return; }
    const t = setTimeout(async () => {
      const r = await fetch(\`/api/search?q=\${encodeURIComponent(q)}\`).then(r => r.json());
      setResults(r.items);
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0">
        <input autoFocus value={q} onChange={(e)=>setQ(e.target.value)}
               placeholder="Busca clubs y carreras..."
               className="w-full border-b border-border bg-transparent px-4 py-4 outline-none" />
        <ul className="max-h-80 overflow-auto p-2">
          {results.map((it) => (
            <li key={it.id}>
              <a href={it.href} className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary">
                <span className="text-xs uppercase text-muted-foreground">{it.kind}</span>
                <span>{it.title}</span>
              </a>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
\`\`\`

### 9.7 GeolocationCard

\`\`\`tsx
// components/marketing/GeolocationCard.tsx
"use client";
import { MapPin, Navigation } from "lucide-react";
import { es } from "@/lib/i18n/es";

export function GeolocationCard({ onLocate }:{ onLocate:(c:{lat:number;lng:number})=>void }) {
  const locate = () => navigator.geolocation.getCurrentPosition(
    (pos) => onLocate({ lat: pos.coords.latitude, lng: pos.coords.longitude })
  );
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 font-medium"><MapPin size={18} />{es.geo.title}</div>
      <button onClick={locate}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground">
        <Navigation size={16} />{es.geo.useLocation}
      </button>
    </div>
  );
}
\`\`\`

### 9.8 Footer

\`\`\`tsx
// components/layout/Footer.tsx
import { es } from "@/lib/i18n/es";
import { RUN_TYPES } from "@/lib/run-types";
import { CITIES } from "@/lib/cities";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="mb-10 max-w-xl">
          <h3 className="font-serif text-2xl">{es.footer.newsletterTitle}</h3>
          <p className="mt-2 text-muted-foreground">{es.footer.newsletterText}</p>
          <NewsletterForm />
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 text-sm">
          <Col title={es.footer.discover} links={[
            { label: es.footer.home, href: "/" },
            { label: es.nav.discover, href: "/carreras" },
            { label: es.nav.clubs, href: "/clubs" },
            { label: es.footer.cityCalendars, href: "/calendarios" },
            { label: es.footer.saturdayClubs, href: "/tipos/sabados" },
            { label: es.footer.sundayClubs, href: "/tipos/domingos" },
            { label: es.footer.blog, href: "/blog" },
          ]} />
          <Col title={es.footer.runTypes} links={RUN_TYPES.map(t => ({
            label: \`\${t.emoji} \${t.label}\`, href: \`/tipos/\${t.id}\` }))} />
          <Col title={es.footer.cities} links={CITIES.slice(0,8).map(c => ({
            label: c, href: \`/ciudades/\${c.toLowerCase()}\` }))} />
          <Col title={es.footer.company} links={[
            { label: es.footer.partnerships, href: "/colaboraciones" },
            { label: es.footer.addClub, href: "/onboarding/club" },
            { label: es.footer.advertise, href: "/anunciate" },
          ]} />
          <Col title={es.footer.followUs} links={[
            { label: "Instagram", href: "#" }, { label: "LinkedIn", href: "#" }, { label: "Strava", href: "#" },
          ]} />
        </div>
        <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>{es.footer.runnedBy} RunClubs.es</span>
          <a href="/privacidad">{es.footer.privacy}</a>
          <a href="/terminos">{es.footer.terms}</a>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }:{ title:string; links:{label:string;href:string}[] }) {
  return (
    <div>
      <h4 className="mb-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{title}</h4>
      <ul className="space-y-2">
        {links.map(l => <li key={l.href+l.label}><a href={l.href} className="hover:opacity-70">{l.label}</a></li>)}
      </ul>
    </div>
  );
}
\`\`\`


---

## 10. API / Endpoints

\`\`\`
GET  /api/runs            ?city=&types=&pace=&weekday=&date=&q=&view=   -> lista de carreras filtradas
GET  /api/runs/[slug]                                                  -> detalle de carrera
POST /api/runs/[slug]/join                                            -> apuntarse (auth)
GET  /api/clubs           ?city=&pace=&types=&q=                       -> lista de clubs
GET  /api/clubs/[slug]                                                 -> detalle de club
POST /api/clubs/[slug]/join                                           -> unirse al club (auth)
POST /api/clubs           (onboarding, auth)                          -> crear club
GET  /api/search          ?q=                                         -> búsqueda global (clubs + carreras)
POST /api/newsletter                                                   -> suscripción
GET  /api/cities                                                       -> ciudades con conteos
\`\`\`

### Ejemplo: handler de listado de carreras

\`\`\`ts
// app/api/runs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const types = sp.getAll("types");
  const pace = sp.getAll("pace");
  const weekday = sp.getAll("weekday").map(Number);
  const date = sp.get("date"); // "week" | "month"
  const city = sp.get("city");

  const now = new Date();
  const upper = new Date(now);
  if (date === "week") upper.setDate(now.getDate() + 7);
  if (date === "month") upper.setMonth(now.getMonth() + 1);

  const runs = await prisma.run.findMany({
    where: {
      status: "SCHEDULED",
      startAt: { gte: now, ...(date ? { lte: upper } : {}) },
      ...(city ? { club: { city: { slug: city } } } : {}),
      ...(types.length ? { types: { some: { type: { key: { in: types } } } } } : {}),
      ...(pace.length ? { pace: { in: pace } } : {}),
    },
    include: { club: true, types: { include: { type: true } }, _count: { select: { attendees: true } } },
    orderBy: { startAt: "asc" },
    take: 200,
  });

  const filtered = weekday.length
    ? runs.filter((r) => weekday.includes(r.startAt.getDay()))
    : runs;

  return NextResponse.json({ count: filtered.length, items: filtered });
}
\`\`\`


---

## 11. Lógica de carreras recurrentes

Un club define carreras recurrentes (\`RecurringRun\`: día de la semana + hora + ubicación). Un job genera instancias \`Run\` para las próximas N semanas.

\`\`\`ts
// lib/recurring.ts
import { prisma } from "@/lib/prisma";

/** Genera instancias Run para las próximas \`weeksAhead\` semanas. */
export async function generateRuns(weeksAhead = 20) {
  const recurring = await prisma.recurringRun.findMany({ where: { active: true } });
  const today = new Date();

  for (const r of recurring) {
    for (let w = 0; w < weeksAhead; w++) {
      const d = nextWeekday(today, r.weekday, w);
      const [h, m] = r.time.split(":").map(Number);
      d.setHours(h, m, 0, 0);
      if (d < today) continue;

      const slug = \`\${slugify(r.title)}-\${d.toISOString().slice(0,10)}\`;
      await prisma.run.upsert({
        where: { slug },
        update: {},
        create: {
          slug, clubId: r.clubId, recurringRunId: r.id,
          title: r.title, description: r.description ?? undefined,
          startAt: d, location: r.location, lat: r.lat, lng: r.lng,
          distanceKm: r.distanceKm, pace: r.pace, status: "SCHEDULED",
          types: { create: r.types.map((key) => ({ type: { connect: { key } } })) },
        },
      });
    }
  }
}

function nextWeekday(from: Date, weekday: number, addWeeks: number) {
  const d = new Date(from);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + diff + addWeeks * 7);
  return d;
}
function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")
          .replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}
\`\`\`

Ejecutar con un cron (Vercel Cron / GitHub Actions) cada día:
\`\`\`
0 4 * * *  ->  POST /api/cron/generate-runs
\`\`\`

El resumen "Cada miércoles y domingo" se deriva agrupando los \`weekday\` de las recurrentes activas del club y traduciéndolos:
\`["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"]\`.


---

## 12. Filtros y búsqueda (estado en la URL)

Mantener los filtros sincronizados con los query params para que sean compartibles e indexables.

\`\`\`tsx
// hooks/useRunFilters.ts
"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useRunFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const toggle = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    const current = next.getAll(key);
    if (current.includes(value)) {
      next.delete(key);
      current.filter(v => v !== value).forEach(v => next.append(key, v));
    } else {
      next.append(key, value);
    }
    router.push(\`\${pathname}?\${next.toString()}\`, { scroll: false });
  }, [params, pathname, router]);

  const clearAll = useCallback(() => router.push(pathname, { scroll: false }), [pathname, router]);

  return { params, toggle, clearAll };
}
\`\`\`

### FilterAccordion (con contador, igual que el original)

\`\`\`tsx
// components/filters/FilterAccordion.tsx
"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FilterAccordion({ title, count, children }:{
  title: string; count?: number; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border py-3">
      <button onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between text-sm font-medium">
        <span className="flex items-center gap-2">
          {title}
          {count ? <span className="rounded-full bg-secondary px-2 text-xs text-muted-foreground">{count}</span> : null}
        </span>
        <ChevronDown size={16} className={open ? "rotate-180 transition" : "transition"} />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}
\`\`\`

Filtros disponibles (igual que el original):
- **Ciudad** (select/lista)
- **Tipo de carrera** (multi, ~10-12 opciones con emoji)
- **Ritmo** (multi: Todos / Principiante / Intermedio / Avanzado)
- **Día de la semana** (7 opciones)
- **Fecha** (Esta semana / Este mes) — solo en /carreras
- Botón **Borrar todo** + resumen "X clubs · Y carreras"


---

## 13. SEO y páginas generadas

El original genera muchas páginas SEO. Replicar:

- **Por ciudad:** \`/ciudades/madrid\`, \`/ciudades/barcelona\`… (clubs y carreras de esa ciudad).
- **Calendarios por ciudad:** \`/calendarios/madrid\` (todas las carreras próximas de la ciudad).
- **Por tipo:** \`/tipos/sociales\`, \`/tipos/trail\`, \`/tipos/principiantes\`…
- **Por día:** "Clubs de los sábados" (\`/tipos/sabados\`), "Clubs de los domingos" (\`/tipos/domingos\`).
- **Blog:** \`/blog\` y artículos.

\`\`\`tsx
// app/ciudades/[ciudad]/page.tsx (extracto)
import type { Metadata } from "next";

export async function generateMetadata({ params }:{ params:{ ciudad:string } }): Promise<Metadata> {
  const ciudad = capitalize(params.ciudad);
  return {
    title: \`Clubs de running en \${ciudad} | RunClubs.es\`,
    description: \`Descubre los mejores clubs de running y carreras grupales en \${ciudad}. Filtra por ritmo, tipo y día.\`,
    alternates: { canonical: \`https://www.runclubs.es/ciudades/\${params.ciudad}\` },
    openGraph: { type: "website", locale: "es_ES" },
  };
}

export function generateStaticParams() {
  return ["madrid","barcelona","valencia","sevilla","bilbao","malaga","zaragoza"].map(ciudad => ({ ciudad }));
}
\`\`\`

Buenas prácticas:
- \`lang="es"\`, datos estructurados JSON-LD (\`Event\` para carreras, \`SportsClub\`/\`Organization\` para clubs).
- ISR (\`revalidate\`) en listados y fichas.
- \`sitemap.xml\` dinámico con todas las ciudades, clubs, carreras y tipos.
- URLs limpias y en español.


---

## 14. Checklist de implementación

**Fase 1 — Base**
- [ ] Proyecto Next.js (App Router) + TypeScript + Tailwind + tailwindcss-animate.
- [ ] Tokens de color/tipografía (sección 2 y 3) y \`globals.css\`.
- [ ] Cargar Instrument Serif + Inter con next/font.
- [ ] Primitivas ui/ (shadcn/ui): Button, Card, Dialog, Accordion, Input, Badge, Avatar.
- [ ] Layout raíz + Header (pill) + Footer + FeedbackWidget.

**Fase 2 — Datos**
- [ ] Prisma + Postgres (Supabase/Neon). Migraciones del esquema (sección 6).
- [ ] Seed: ciudades de España, tipos de carrera, clubs y carreras de ejemplo (datos propios, NO copiados del .nl).
- [ ] Job de carreras recurrentes (sección 11) + cron.

**Fase 3 — Páginas públicas**
- [ ] Home con Hero + listados + tarjetas.
- [ ] /carreras con filtros, toggle lista/cuadrícula y paginación.
- [ ] /clubs con grid/list y "Añade tu club".
- [ ] Ficha de club y ficha de carrera.
- [ ] Modal de búsqueda (⌘K) + endpoint /api/search.
- [ ] Geolocalización ("Usar mi ubicación").

**Fase 4 — Cuentas e interacción**
- [ ] Auth (NextAuth / email + social).
- [ ] "Unirse al club" / "Apuntarse" + recuento de miembros/asistentes.
- [ ] Onboarding de club (formulario multi-paso) en /onboarding/club.
- [ ] Sistema de premios/insignias.
- [ ] Newsletter (/api/newsletter).

**Fase 5 — SEO y pulido**
- [ ] Páginas por ciudad / tipo / día + calendarios.
- [ ] JSON-LD, sitemap, metadatos, OG images.
- [ ] Blog.
- [ ] Páginas legales (privacidad, términos).
- [ ] Analítica respetuosa (p.ej. Plausible/Simple Analytics) y banner de cookies.

---

## 15. Nota legal

Puedes replicar libremente la **estructura, el diseño general, las funcionalidades y la disposición**. Pero NO copies activos protegidos del sitio original: su logotipo, el vídeo del hero, sus textos de marketing exactos ni los datos reales de clubs/carreras neerlandeses.

Para tu .es debes:
- Crear tu propia marca, logotipo y multimedia.
- Redactar tus propios textos (los de este documento son adaptaciones genéricas que puedes ajustar).
- Generar tus propios datos de clubs y carreras de España (con permiso de los organizadores).
- Revisar los Términos de RunClubs.nl antes de reutilizar cualquier contenido.

Este documento describe el patrón de producto para construir una plataforma equivalente con identidad y contenido propios.
