"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Aquí se reportaría a Sentry cuando se integre
    console.error("Runtime error:", error);
  }, [error]);

  return (
    <main className="container flex min-h-[70vh] flex-col items-center justify-center text-center">
      <p className="font-serif text-6xl text-muted-foreground">500</p>
      <h1 className="mt-4 text-2xl font-bold">{es.errors.serverErrorTitle}</h1>
      <p className="mt-2 max-w-md text-muted-foreground">{es.errors.serverErrorSubtitle}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={reset}>
          {es.errors.tryAgain}
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">{es.errors.backHome}</Link>
        </Button>
      </div>
    </main>
  );
}
