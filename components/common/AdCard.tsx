import Link from "next/link";

import { es } from "@/lib/i18n/es";

export function AdCard({ city }: { city?: string }) {
  const label = city
    ? `${es.cityPage.advertiseIn} ${city}`
    : es.cityPage.advertise;

  return (
    <Link
      href="/anunciate"
      className="block rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
    >
      <span className="mb-1 block text-lg">📣</span>
      {label}
    </Link>
  );
}
