import type { Metadata } from "next";
import Link from "next/link";

import { ContactForm } from "./ContactForm";
import { Container } from "@/components/common/Container";
import { SectionLabel } from "@/components/common/SectionLabel";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = {
  title: "Colaboraciones",
  description:
    "Propón colaboraciones con RunClubs.es. Marcas, organizadores y partners del running en España.",
  alternates: { canonical: "/colaboraciones" },
};

export default function ColaboracionesPage() {
  return (
    <Container className="py-10">
      <div className="mx-auto max-w-2xl">
        <SectionLabel as="p" className="mb-2">
          {es.collaborations.label}
        </SectionLabel>
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
          {es.collaborations.title}
        </h1>
        <p className="mt-4 text-muted-foreground">{es.collaborations.intro}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          {es.collaborations.advertiseHint}{" "}
          <Link href="/anunciate" className="font-medium text-foreground underline-offset-4 hover:underline">
            {es.collaborations.advertiseLink}
          </Link>
        </p>

        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <ContactForm />
        </div>
      </div>
    </Container>
  );
}
