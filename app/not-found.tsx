import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = {
  title: { absolute: "Página no encontrada | RunClubs.es" },
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-8xl text-muted-foreground">404</p>
      <h1 className="mt-4 text-2xl font-bold">{es.errors.notFoundTitle}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{es.errors.notFoundSubtitle}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/carreras">{es.errors.seeAllRuns}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">{es.errors.backHome}</Link>
        </Button>
      </div>
    </main>
  );
}
