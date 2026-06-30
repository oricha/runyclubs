"use client";

import { useCallback, useState, useTransition } from "react";
import { Search } from "lucide-react";

import { Container } from "@/components/common/Container";
import { ViewToggle } from "@/components/common/ViewToggle";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { GeolocationCard } from "@/components/marketing/GeolocationCard";
import { ResultsSummary } from "@/components/filters/ResultsSummary";
import { ClearAllButton } from "@/components/filters/ClearAllButton";
import { RunCard } from "@/components/cards/RunCard";
import { RunCardGrid } from "@/components/cards/RunCardGrid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRunFilters } from "@/hooks/useRunFilters";
import type { CityInfo } from "@/lib/cities";
import { es, t } from "@/lib/i18n/es";
import type { RunSummary } from "@/types";

const MAX_RESULTS = 200;

export function RunsDirectoryClient({
  runs,
  count,
  initialQuery,
}: {
  runs: RunSummary[];
  count: number;
  initialQuery?: string;
}) {
  const { setView, clearAll, view, params, setSingle } = useRunFilters();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [, startTransition] = useTransition();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      startTransition(() => {
        setSingle("q", query.trim() || null);
      });
    },
    [query, setSingle],
  );

  const handleNearestCity = useCallback(
    (city: CityInfo) => {
      startTransition(() => {
        setSingle("city", city.slug);
      });
    },
    [setSingle],
  );

  const hasFilters =
    params.get("city") ||
    params.getAll("types").length > 0 ||
    params.getAll("pace").length > 0 ||
    params.getAll("weekday").length > 0 ||
    params.get("date") ||
    params.get("q");

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl">{es.runsPage.title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{es.runsPage.subtitle}</p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="lg:w-64 lg:shrink-0">
          <GeolocationCard onNearestCity={handleNearestCity} />
          <FilterSidebar />
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <ResultsSummary count={count} />
            <ViewToggle value={view} onChange={setView} />
          </div>

          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={es.filters.searchRuns}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              {es.filters.findRuns}
            </Button>
          </form>

          {count >= MAX_RESULTS ? (
            <p className="text-sm text-muted-foreground">
              {t(es.runsPage.limitReached, { count: MAX_RESULTS })}
            </p>
          ) : null}

          {count === 0 ? (
            <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
              <h2 className="font-serif text-2xl">{es.runsPage.emptyTitle}</h2>
              <p className="mt-2 text-muted-foreground">{es.runsPage.emptyText}</p>
              {hasFilters ? (
                <div className="mt-6">
                  <ClearAllButton onClick={clearAll} />
                </div>
              ) : null}
            </div>
          ) : view === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {runs.map((run) => (
                <RunCardGrid key={run.id} run={run} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => (
                <RunCard key={run.id} run={run} />
              ))}
            </div>
          )}

          <section className="mt-12 rounded-xl border border-border bg-secondary/30 px-6 py-8 text-center">
            <h2 className="font-serif text-2xl">{es.runsPage.cityCalendarsTitle}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {es.runsPage.cityCalendarsText}
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a href="/calendarios">{es.runsPage.cityCalendarsCta}</a>
            </Button>
          </section>
        </div>
      </div>
    </Container>
  );
}
