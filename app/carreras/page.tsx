import type { Metadata } from "next";
import { Suspense } from "react";

import { RunsDirectoryClient } from "@/components/runs/RunsDirectoryClient";
import { es } from "@/lib/i18n/es";
import { getRuns, parseRunFilters } from "@/lib/runs";

export const metadata: Metadata = {
  title: es.runsPage.title,
  description: es.runsPage.subtitle,
  alternates: { canonical: "/carreras" },
  openGraph: {
    title: es.runsPage.title,
    description: es.runsPage.subtitle,
    url: "/carreras",
  },
};

export default async function CarrerasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((v) => urlParams.append(key, v));
    } else if (value !== undefined) {
      urlParams.set(key, value);
    }
  }

  const filters = parseRunFilters(urlParams);
  const { count, items } = await getRuns(filters);

  return (
    <Suspense>
      <RunsDirectoryClient
        runs={items}
        count={count}
        initialQuery={filters.q}
      />
    </Suspense>
  );
}
