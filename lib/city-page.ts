import type { RunSummary, RunTypeTag } from "@/types";

export function formatCityRunDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

export function mapCityRunToSummary(run: {
  id: string;
  slug: string;
  title: string;
  startAt: Date;
  location: string;
  distanceKm: number | null;
  pace: string | null;
  signupType: string;
  externalSignupUrl: string | null;
  organizerName: string | null;
  organizerRole: string | null;
  priceCents: number | null;
  club: { name: string; logoUrl: string | null; slug: string };
  types: { type: { key: string; emoji: string; label: string } }[];
  _count: { attendees: number };
}): RunSummary {
  const types: RunTypeTag[] = run.types.map(({ type }) => ({
    key: type.key,
    emoji: type.emoji,
    label: type.label,
  }));

  return {
    id: run.id,
    slug: run.slug,
    title: run.title,
    startAt: run.startAt.toISOString(),
    location: run.location,
    club: {
      name: run.club.name,
      logoUrl: run.club.logoUrl ?? undefined,
      slug: run.club.slug,
    },
    distanceKm: run.distanceKm ?? undefined,
    pace: run.pace ?? undefined,
    types,
    attendeeCount: run._count.attendees,
    signupType: run.signupType as "internal" | "external",
    externalSignupUrl: run.externalSignupUrl ?? undefined,
    organizerName: run.organizerName ?? undefined,
    organizerRole: run.organizerRole ?? undefined,
    priceCents: run.priceCents,
  };
}

export type CityFaq = { q: string; a: string };

export function buildCityFaqs(
  cityName: string,
  clubCount: number,
  upcomingRuns: RunSummary[],
): CityFaq[] {
  return [
    {
      q: `¿Cuántos clubs de running hay en ${cityName}?`,
      a: `En ${cityName} hay ${clubCount} clubs de running verificados en RunClubs.es, con salidas regulares cada semana.`,
    },
    {
      q: `¿Cuál es la mejor época para correr en ${cityName}?`,
      a: `En ${cityName} se puede correr todo el año. La primavera (marzo-mayo) y el otoño (septiembre-noviembre) son las épocas más agradables por temperatura.`,
    },
    {
      q: `¿Hay clubs de running para principiantes en ${cityName}?`,
      a: `Sí, varios clubs de ${cityName} organizan salidas para todos los niveles, incluyendo grupos de iniciación.`,
    },
    {
      q: `¿Cuándo son las próximas carreras en ${cityName}?`,
      a:
        upcomingRuns.length > 0
          ? `La próxima carrera en ${cityName} es "${upcomingRuns[0].title}" el ${formatCityRunDate(new Date(upcomingRuns[0].startAt))}.`
          : `Consulta el calendario de carreras de ${cityName} para ver las próximas salidas.`,
    },
  ];
}

export function buildFaqJsonLd(faqs: CityFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}
