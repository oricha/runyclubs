import Link from "next/link";
import { Calendar, Clock, MapPin } from "lucide-react";

import { DateBlock } from "./DateBlock";
import { TypeChip } from "./TypeChip";
import type { RunSummary } from "@/types";

export function RunCardGrid({ run }: { run: RunSummary }) {
  const d = new Date(run.startAt);
  const hora = d.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link
      href={`/carreras/${run.slug}`}
      className="flex flex-col rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <DateBlock date={d} />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-medium">{run.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{run.club.name}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock size={14} />
          {hora}
        </span>
        <span className="inline-flex items-center gap-1 truncate">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{run.location}</span>
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {run.types.slice(0, 2).map((t) => (
          <TypeChip key={t.key} type={t} />
        ))}
        {run.types.length > 2 ? (
          <span className="text-xs text-muted-foreground">
            +{run.types.length - 2}
          </span>
        ) : null}
      </div>
      {run.attendeeCount > 0 ? (
        <div className="mt-auto pt-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar size={12} />
            {run.attendeeCount} apuntados
          </span>
        </div>
      ) : null}
    </Link>
  );
}
