import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Search } from "lucide-react";

import { AdCard } from "@/components/common/AdCard";
import { Container } from "@/components/common/Container";
import { CityCalendarToggle } from "@/components/city/CityCalendarToggle";
import { CityClubCard } from "@/components/city/CityClubCard";
import { CityFaqSection } from "@/components/city/CityFaqSection";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { WeatherWidgetSkeleton } from "@/components/weather/WeatherWidgetSkeleton";
import { Button } from "@/components/ui/button";
import { CITY_DETAILS, getCityBySlug } from "@/lib/cities";
import {
  buildCityFaqs,
  buildFaqJsonLd,
  mapCityRunToSummary,
} from "@/lib/city-page";
import { es, t } from "@/lib/i18n/es";
import { prisma } from "@/lib/prisma";

const runInclude = {
  club: { select: { name: true, slug: true, logoUrl: true } },
  types: { include: { type: true } },
  _count: { select: { attendees: true } },
} as const;

type PageProps = {
  params: Promise<{ ciudad: string }>;
};

export async function generateStaticParams() {
  return CITY_DETAILS.map((c) => ({ ciudad: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { ciudad } = await params;
  const cityInfo = getCityBySlug(ciudad);
  if (!cityInfo) return {};

  return {
    title: `Carreras y clubs de running en ${cityInfo.name}`,
    description: `Encuentra clubs de running, carreras y eventos deportivos en ${cityInfo.name}. Únete a la comunidad runner de ${cityInfo.region ?? "España"}.`,
    alternates: { canonical: `/ciudades/${ciudad}` },
    openGraph: {
      title: `Carreras y clubs de running en ${cityInfo.name}`,
      description: `Encuentra clubs de running, carreras y eventos deportivos en ${cityInfo.name}.`,
      url: `/ciudades/${ciudad}`,
    },
  };
}

export default async function CityPage({ params }: PageProps) {
  const { ciudad } = await params;
  const cityInfo = getCityBySlug(ciudad);
  if (!cityInfo) notFound();

  const city = await prisma.city.findUnique({
    where: { slug: ciudad },
    include: {
      clubs: {
        where: { verified: true },
        select: {
          id: true,
          slug: true,
          name: true,
          logoUrl: true,
          pace: true,
          frequency: true,
          verified: true,
          awards: { select: { key: true, icon: true, label: true } },
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

  const upcomingRunsRaw = city
    ? await prisma.run.findMany({
        where: {
          club: { cityId: city.id },
          startAt: { gte: new Date() },
          status: "SCHEDULED",
        },
        include: runInclude,
        orderBy: { startAt: "asc" },
        take: 20,
      })
    : [];

  const clubs = city?.clubs ?? [];
  const races = city?.races ?? [];
  const upcomingRuns = upcomingRunsRaw.map(mapCityRunToSummary);
  const faqs = buildCityFaqs(cityInfo.name, clubs.length, upcomingRuns);
  const faqJsonLd = buildFaqJsonLd(faqs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Container className="py-10">
        <header className="mb-10 space-y-4">
          <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
            {es.cityPage.title} {cityInfo.name}
          </h1>
          <p className="text-muted-foreground">
            {t(es.cityPage.subtitle, {
              clubs: clubs.length,
              runs: upcomingRuns.length,
            })}
          </p>
          <Button variant="outline" asChild className="gap-2">
            <Link href={`/carreras?city=${ciudad}`}>
              <Search className="h-4 w-4" />
              {t(es.cityPage.searchInCity, { city: cityInfo.name })}
            </Link>
          </Button>
        </header>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-10">
            <section>
              <CityCalendarToggle runs={upcomingRuns} />
            </section>

            <section>
              <h2 className="font-serif text-xl">
                {es.cityPage.clubsSection} {cityInfo.name}
              </h2>
              {clubs.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">{es.cityPage.noClubs}</p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {clubs.map((club) => (
                    <li key={club.id}>
                      <CityClubCard
                        slug={club.slug}
                        name={club.name}
                        logoUrl={club.logoUrl}
                        pace={club.pace}
                        frequency={club.frequency}
                        verified={club.verified}
                        awards={club.awards}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="font-serif text-xl">
                {es.cityPage.racesSection} {cityInfo.name}
              </h2>
              {races.length === 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">{es.cityPage.noRaces}</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {races.map((race) => (
                    <li key={race.id}>
                      {race.externalUrl ? (
                        <a
                          href={race.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
                        >
                          <p className="font-medium">{race.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {new Intl.DateTimeFormat("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                            }).format(race.date)}
                          </p>
                        </a>
                      ) : (
                        <div className="rounded-xl border border-border bg-card p-4">
                          <p className="font-medium">{race.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {new Intl.DateTimeFormat("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "long",
                            }).format(race.date)}
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <Suspense fallback={<WeatherWidgetSkeleton />}>
              <WeatherWidget
                lat={cityInfo.lat}
                lng={cityInfo.lng}
                cityName={cityInfo.name}
              />
            </Suspense>
            <AdCard city={cityInfo.name} />
            <Button className="w-full" asChild>
              <Link href="/onboarding/club">{es.cityPage.addClub}</Link>
            </Button>
          </aside>
        </div>

        <CityFaqSection faqs={faqs} />
      </Container>
    </>
  );
}
