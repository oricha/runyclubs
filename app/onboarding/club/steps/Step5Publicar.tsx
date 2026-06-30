"use client";

import { Badge } from "@/components/ui/badge";
import { getPaceLabel } from "@/lib/pace-labels";
import { RUN_TYPES } from "@/lib/run-types";
import { es } from "@/lib/i18n/es";

import { weekdayLabel, type WizardState } from "../types";
import type { CityInfo } from "@/lib/cities";

interface Step5PublicarProps {
  state: WizardState;
  cities: CityInfo[];
  publishError?: string;
}

export function Step5Publicar({ state, cities, publishError }: Step5PublicarProps) {
  const cityName = cities.find((c) => c.slug === state.citySlug)?.name ?? state.citySlug;
  const typeLabels = state.typeIds
    .map((id) => RUN_TYPES.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-xl">{es.onboarding.reviewTitle}</h2>

      {publishError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {publishError}
        </p>
      ) : null}

      <section className="space-y-2 rounded-xl border border-border p-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {es.onboarding.stepDatos}
        </h3>
        <p className="font-serif text-lg">{state.name}</p>
        <p className="text-sm text-muted-foreground">{cityName}</p>
        <p className="text-sm">{getPaceLabel(state.pace)}</p>
        <div className="flex flex-wrap gap-2">
          {typeLabels.map((type) =>
            type ? (
              <Badge key={type.id} variant="secondary">
                {type.emoji} {type.label}
              </Badge>
            ) : null,
          )}
        </div>
        <p className="whitespace-pre-line text-sm text-muted-foreground">{state.description}</p>
      </section>

      <section className="space-y-2 rounded-xl border border-border p-4">
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {es.onboarding.stepCarreras}
        </h3>
        <ul className="space-y-2 text-sm">
          {state.recurrencias.map((r, i) => (
            <li key={i} className="flex flex-wrap gap-2">
              <span className="font-medium">{r.title}</span>
              <span className="text-muted-foreground">
                · {weekdayLabel(r.weekday)} {r.time}
              </span>
              <span className="text-muted-foreground">· {r.location}</span>
            </li>
          ))}
        </ul>
      </section>

      {(state.logoUrl || state.coverUrl) && (
        <section className="space-y-2 rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {es.onboarding.stepEstilo}
          </h3>
          {state.logoUrl ? <p className="truncate text-sm">{state.logoUrl}</p> : null}
          {state.coverUrl ? <p className="truncate text-sm">{state.coverUrl}</p> : null}
        </section>
      )}

      {(state.instagramUrl || state.stravaUrl || state.website) && (
        <section className="space-y-2 rounded-xl border border-border p-4">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {es.onboarding.stepRedes}
          </h3>
          {state.instagramUrl ? <p className="truncate text-sm">{state.instagramUrl}</p> : null}
          {state.stravaUrl ? <p className="truncate text-sm">{state.stravaUrl}</p> : null}
          {state.website ? <p className="truncate text-sm">{state.website}</p> : null}
        </section>
      )}
    </div>
  );
}
