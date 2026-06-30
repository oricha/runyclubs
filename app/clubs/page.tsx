import type { Metadata } from "next";

import { Container } from "@/components/common/Container";
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

export default function ClubsPage() {
  return (
    <Container className="py-10">
      <h1 className="font-serif text-4xl tracking-tight md:text-5xl">{es.clubsPage.title}</h1>
      <p className="mt-3 text-muted-foreground">{CLUBS_DESCRIPTION}</p>
    </Container>
  );
}
