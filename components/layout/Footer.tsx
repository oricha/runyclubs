import Link from "next/link";

import { es } from "@/lib/i18n/es";
import { RUN_TYPES } from "@/lib/run-types";
import { CITY_DETAILS } from "@/lib/cities";
import { NewsletterForm } from "@/components/marketing/NewsletterForm";
import { SectionLabel } from "@/components/common/SectionLabel";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container py-12">
        <div className="mb-10 max-w-xl">
          <h3 className="font-serif text-2xl">{es.footer.newsletterTitle}</h3>
          <p className="mt-2 text-muted-foreground">{es.footer.newsletterText}</p>
          <NewsletterForm />
        </div>
        <div className="grid gap-8 text-sm sm:grid-cols-2 lg:grid-cols-5">
          <Col
            title={es.footer.discover}
            links={[
              { label: es.footer.home, href: "/" },
              { label: es.nav.discover, href: "/carreras" },
              { label: es.nav.clubs, href: "/clubs" },
              { label: es.footer.cityCalendars, href: "/calendarios" },
              { label: es.footer.saturdayClubs, href: "/tipos/sabados" },
              { label: es.footer.sundayClubs, href: "/tipos/domingos" },
              { label: es.footer.blog, href: "/blog" },
            ]}
          />
          <Col
            title={es.footer.runTypes}
            links={RUN_TYPES.map((t) => ({
              label: `${t.emoji} ${t.label}`,
              href: `/tipos/${t.id}`,
            }))}
          />
          <Col
            title={es.footer.cities}
            links={CITY_DETAILS.slice(0, 8).map((c) => ({
              label: c.name,
              href: `/ciudades/${c.slug}`,
            }))}
          />
          <Col
            title={es.footer.company}
            links={[
              { label: es.footer.partnerships, href: "/colaboraciones" },
              { label: es.footer.addClub, href: "/onboarding/club" },
              { label: es.footer.advertise, href: "/anunciate" },
            ]}
          />
          <Col
            title={es.footer.followUs}
            links={[
              { label: "Instagram", href: "#" },
              { label: "LinkedIn", href: "#" },
              { label: "Strava", href: "#" },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-wrap gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>
            {es.footer.runnedBy} RunClubs.es
          </span>
          <Link href="/privacidad" className="hover:opacity-70">
            {es.footer.privacy}
          </Link>
          <Link href="/terminos" className="hover:opacity-70">
            {es.footer.terms}
          </Link>
        </div>
      </div>
    </footer>
  );
}

function Col({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <SectionLabel as="h4" className="mb-3 block">
        {title}
      </SectionLabel>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link href={l.href} className="hover:opacity-70">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
