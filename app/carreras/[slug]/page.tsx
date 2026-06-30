import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { Container } from "@/components/common/Container";
import { SectionLabel } from "@/components/common/SectionLabel";
import { ExternalSignupButton } from "@/components/run/ExternalSignupButton";
import { HostedByCard } from "@/components/run/HostedByCard";
import { JoinRunButton } from "@/components/run/JoinRunButton";
import { MoreRunsInCity } from "@/components/run/MoreRunsInCity";
import { RunAttendees } from "@/components/run/RunAttendees";
import { RunHeader } from "@/components/run/RunHeader";
import { RunMeta } from "@/components/run/RunMeta";
import { RunsAroundDate } from "@/components/run/RunsAroundDate";
import { ShareRunButton } from "@/components/run/ShareRunButton";
import { CITY_DETAILS } from "@/lib/cities";
import { es } from "@/lib/i18n/es";
import { prisma } from "@/lib/prisma";
import {
  getRunBySlug,
  getRuns,
  getRunsAroundDate,
} from "@/lib/runs";

const SITE_URL = "https://runclubs.es";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const run = await getRunBySlug(slug);

  if (!run) {
    return { title: "Carrera no encontrada" };
  }

  const description =
    run.description ?? `${run.title} — ${run.club.name}, ${run.club.city}`;

  return {
    title: run.title,
    description,
    alternates: {
      canonical: `/carreras/${run.slug}`,
    },
    openGraph: {
      type: "website",
      locale: "es_ES",
      title: run.title,
      description,
      url: `/carreras/${run.slug}`,
    },
  };
}

function buildEventJsonLd(run: NonNullable<Awaited<ReturnType<typeof getRunBySlug>>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: run.title,
    startDate: new Date(run.startAt).toISOString(),
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: run.location,
      address: {
        "@type": "PostalAddress",
        addressCountry: "ES",
      },
    },
    organizer: {
      "@type": "Organization",
      name: run.club.name,
      url: `${SITE_URL}/clubs/${run.club.slug}`,
    },
    description: run.description,
  };
}

export default async function RunDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const run = await getRunBySlug(slug);

  if (!run) {
    notFound();
  }

  const session = await auth();

  const isAttending = session?.user?.id
    ? !!(await prisma.runAttendee.findUnique({
        where: { runId_userId: { runId: run.id, userId: session.user.id } },
        select: { id: true },
      }))
    : false;

  const citySlug = CITY_DETAILS.find((c) => c.name === run.club.city)?.slug;
  const moreInCity = citySlug
    ? (await getRuns({ city: citySlug })).items
        .filter((r) => r.id !== run.id)
        .slice(0, 3)
    : [];

  const aroundDate = await getRunsAroundDate(new Date(run.startAt), run.id, 3);

  const canonicalUrl = `${SITE_URL}/carreras/${run.slug}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildEventJsonLd(run)) }}
      />
      <Container className="py-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0 space-y-10">
            <RunHeader run={run} />

            <section className="space-y-4">
              <SectionLabel>{es.runDetail.aboutThisRun}</SectionLabel>
              {run.description ? (
                <p className="whitespace-pre-line text-muted-foreground">{run.description}</p>
              ) : (
                <p className="text-muted-foreground">{es.runDetail.notKnownYet}</p>
              )}
            </section>

            <section className="space-y-4">
              <RunMeta run={run} />
            </section>

            <section className="space-y-3">
              <RunAttendees count={run.attendeeCount} avatars={run.attendeeAvatars} />
            </section>

            <HostedByCard run={run} />

            <div className="space-y-10 border-t border-border pt-10 lg:hidden">
              {run.signupType === "external" && run.externalSignupUrl ? (
                <ExternalSignupButton url={run.externalSignupUrl} />
              ) : (
                <JoinRunButton
                  runSlug={run.slug}
                  userId={session?.user?.id ?? null}
                  isAttending={isAttending}
                />
              )}
              <ShareRunButton url={canonicalUrl} title={run.title} />
            </div>

            <div className="space-y-10 border-t border-border pt-10">
              <MoreRunsInCity city={run.club.city} runs={moreInCity} />
              <RunsAroundDate runs={aroundDate} />
            </div>
          </div>

          <aside className="hidden space-y-4 lg:sticky lg:top-28 lg:block lg:self-start">
            {run.signupType === "external" && run.externalSignupUrl ? (
              <ExternalSignupButton url={run.externalSignupUrl} />
            ) : (
              <JoinRunButton
                runSlug={run.slug}
                userId={session?.user?.id ?? null}
                isAttending={isAttending}
              />
            )}
            <ShareRunButton url={canonicalUrl} title={run.title} />
          </aside>
        </div>
      </Container>
    </>
  );
}
