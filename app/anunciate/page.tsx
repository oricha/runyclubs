import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdForm } from "./AdForm";
import { Container } from "@/components/common/Container";
import { SectionLabel } from "@/components/common/SectionLabel";
import { auth } from "@/auth";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = {
  title: "Anúnciate",
  description:
    "Solicita información sobre espacios publicitarios en RunClubs.es para marcas y organizadores.",
  alternates: { canonical: "/anunciate" },
  robots: { index: true, follow: true },
};

export default async function AnunciatePage() {
  const session = await auth();
  if (!session?.user) redirect("/acceso?next=/anunciate");

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-2xl">
        <SectionLabel as="p" className="mb-2">
          {es.advertise.label}
        </SectionLabel>
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">{es.advertise.title}</h1>
        <p className="mt-4 text-muted-foreground">{es.advertise.intro}</p>

        <div className="mt-10 rounded-xl border border-border bg-card p-6">
          <AdForm defaultEmail={session.user.email} />
        </div>
      </div>
    </Container>
  );
}
