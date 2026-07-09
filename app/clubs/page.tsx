import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { es } from "@/lib/i18n/es";

const CLUBS_DESCRIPTION = "Descubre clubs de running por toda España. Encuentra tu grupo.";

export const metadata: Metadata = {
  title: es.clubsPage.title,
  description: CLUBS_DESCRIPTION,
  alternates: { canonical: "/clubs" },
  openGraph: {
    title: es.clubsPage.title,
    description: CLUBS_DESCRIPTION,
    url: "/clubs",
  },
};

export default async function ClubsPage() {
  const session = await auth();
  const addClubHref = session?.user ? "/onboarding/club" : "/acceso?next=/onboarding/club";

  return (
    <Container className="py-10">
      <h1 className="font-serif text-4xl tracking-tight md:text-5xl">{es.clubsPage.title}</h1>
      <p className="mt-3 text-muted-foreground">{CLUBS_DESCRIPTION}</p>

      <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 p-6 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div>
          <p className="font-medium">{es.clubsPage.addClubCta}</p>
          <p className="mt-1 text-sm text-muted-foreground">{es.clubsPage.addClubSubtitle}</p>
        </div>
        <Button asChild className="mt-4 shrink-0 sm:mt-0">
          <Link href={addClubHref}>{es.clubsPage.addClubCta}</Link>
        </Button>
      </div>
    </Container>
  );
}
