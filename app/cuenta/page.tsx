import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountHeader } from "@/components/account/AccountHeader";
import { ClubMembershipCard } from "@/components/account/ClubMembershipCard";
import { RunAttendanceCard } from "@/components/account/RunAttendanceCard";
import { UpgradeClubCard } from "@/components/billing/UpgradeClubCard";
import { Container } from "@/components/common/Container";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { es } from "@/lib/i18n/es";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: `${es.account.title} | RunClubs.es`,
};

type PageProps = {
  searchParams: Promise<{ checkout?: string; club?: string }>;
};

export default async function CuentaPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const { checkout } = await searchParams;
  const userId = session.user.id;
  const now = new Date();

  const [user, memberships, ownedClubs, attendances] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { city: true, name: true },
    }),
    prisma.clubMember.findMany({
      where: { userId },
      include: {
        club: {
          select: {
            id: true,
            slug: true,
            name: true,
            logoUrl: true,
            city: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.clubMember.findMany({
      where: { userId, role: "OWNER" },
      include: {
        club: {
          select: {
            slug: true,
            name: true,
            subscription: { select: { tier: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    prisma.runAttendee.findMany({
      where: { userId },
      include: {
        run: {
          select: {
            id: true,
            slug: true,
            title: true,
            startAt: true,
            location: true,
            club: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { run: { startAt: "desc" } },
    }),
  ]);

  const upcomingRuns = attendances
    .filter((a) => a.run.startAt >= now)
    .sort((a, b) => a.run.startAt.getTime() - b.run.startAt.getTime());
  const pastRuns = attendances.filter((a) => a.run.startAt < now);

  const checkoutBanner =
    checkout === "success"
      ? es.billing.checkoutSuccess
      : checkout === "canceled"
        ? es.billing.checkoutCanceled
        : null;

  return (
    <Container className="py-10">
      <SectionLabel as="p" className="mb-2">
        {es.account.title}
      </SectionLabel>

      {checkoutBanner ? (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            checkout === "success"
              ? "border-primary/30 bg-primary/5 text-foreground"
              : "border-border bg-muted/50 text-muted-foreground"
          }`}
          role="status"
        >
          {checkoutBanner}
        </div>
      ) : null}

      <AccountHeader
        name={user?.name ?? session.user.name ?? null}
        email={session.user.email ?? null}
        image={session.user.image ?? null}
        city={user?.city ?? null}
      />

      {ownedClubs.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-serif text-xl">{es.billing.myPlans}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {ownedClubs.map((m) => (
              <li key={m.club.slug}>
                <UpgradeClubCard
                  clubSlug={m.club.slug}
                  clubName={m.club.name}
                  tier={m.club.subscription?.tier ?? "FREE"}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-xl">{es.account.myClubs}</h2>
          <Button asChild variant="link" className="h-auto p-0">
            <Link href="/precios">{es.billing.pricingLabel}</Link>
          </Button>
        </div>
        {memberships.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">{es.account.myClubsEmpty}</p>
            <Button asChild className="mt-4">
              <Link href="/clubs">{es.account.exploreClubs}</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {memberships.map((m) => (
              <li key={m.id}>
                <ClubMembershipCard
                  slug={m.club.slug}
                  name={m.club.name}
                  logoUrl={m.club.logoUrl}
                  cityName={m.club.city.name}
                  role={m.role}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl">{es.account.upcomingRuns}</h2>
        {upcomingRuns.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="text-muted-foreground">{es.account.upcomingRunsEmpty}</p>
            <Button asChild className="mt-4">
              <Link href="/carreras">{es.account.discoverRuns}</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {upcomingRuns.map((a) => (
              <li key={a.id}>
                <RunAttendanceCard
                  slug={a.run.slug}
                  title={a.run.title}
                  startAt={a.run.startAt}
                  location={a.run.location}
                  clubName={a.run.club.name}
                  isUpcoming
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {pastRuns.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-serif text-xl text-muted-foreground">{es.account.pastRuns}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {pastRuns.map((a) => (
              <li key={a.id}>
                <RunAttendanceCard
                  slug={a.run.slug}
                  title={a.run.title}
                  startAt={a.run.startAt}
                  location={a.run.location}
                  clubName={a.run.club.name}
                  isUpcoming={false}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
