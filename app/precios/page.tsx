import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";

import { PricingFaq } from "@/components/billing/PricingFaq";
import { Container } from "@/components/common/Container";
import { SectionLabel } from "@/components/common/SectionLabel";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "Planes para clubs de running en RunClubs.es. Empieza gratis y crece con Pro o Business.",
  alternates: { canonical: "/precios" },
};

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PreciosPage() {
  return (
    <Container className="py-10">
      <div className="mx-auto max-w-3xl text-center">
        <SectionLabel as="p" className="mb-2">
          {es.billing.pricingLabel}
        </SectionLabel>
        <h1 className="font-serif text-3xl md:text-4xl">{es.billing.pricingTitle}</h1>
        <p className="mt-3 text-muted-foreground">{es.billing.pricingSubtitle}</p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>{es.billing.plans.free}</CardTitle>
            <CardDescription>{es.billing.freePrice}</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList items={es.billing.freeFeatures} />
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/onboarding/club">{es.billing.startFree}</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-primary shadow-md md:-mt-2 md:mb-2">
          <CardHeader>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {es.billing.recommended}
            </p>
            <CardTitle>{es.billing.plans.pro}</CardTitle>
            <CardDescription>{es.billing.proPrice}</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList items={es.billing.proFeatures} />
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/cuenta">{es.billing.startPro}</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{es.billing.plans.business}</CardTitle>
            <CardDescription>{es.billing.businessPrice}</CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureList items={es.billing.businessFeatures} />
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <a href="mailto:hola@runclubs.es">{es.billing.contactBusiness}</a>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <section className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-center font-serif text-2xl">{es.billing.faqTitle}</h2>
        <div className="mt-6">
          <PricingFaq />
        </div>
      </section>
    </Container>
  );
}
