import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";

import { DateBlock } from "./DateBlock";
import { TypeChip } from "./TypeChip";
import { AvatarStack } from "./AvatarStack";
import type { RunSummary } from "@/types";

export function RunCard({ run }: { run: RunSummary }) {
  const d = new Date(run.startAt);
  const fecha = d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hora = d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/carreras/${run.slug}`}
      className="flex gap-4 rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
    >
      <DateBlock date={d} />
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium">{run.title}</h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar size={14} />
            {fecha}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={14} />
            {hora}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {run.location}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">{run.club.name}</span>
          {run.distanceKm ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
              {run.distanceKm} km
            </span>
          ) : null}
          {run.pace ? (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs">
              {run.pace}
            </span>
          ) : null}
          {run.types.map((t) => (
            <TypeChip key={t.key} type={t} />
          ))}
        </div>
        {run.attendeeCount > 0 ? (
          <div className="mt-2">
            <AvatarStack count={run.attendeeCount} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
