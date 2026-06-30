import { Calendar, Clock, Gauge, MapPin, Route } from "lucide-react";

import { es } from "@/lib/i18n/es";
import type { RunDetail } from "@/types";

function MetaItem({
  label,
  icon,
  value,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="flex items-center gap-2 text-sm font-medium">
        {icon}
        {value}
      </p>
    </div>
  );
}

export function RunMeta({ run }: { run: RunDetail }) {
  const startDate = new Date(run.startAt);
  const fecha = startDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const hora = startDate.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MetaItem
        label={es.runDetail.date}
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        value={fecha}
      />
      <MetaItem
        label={es.runDetail.time}
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        value={hora}
      />
      <MetaItem
        label={es.runDetail.location}
        icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
        value={run.location}
      />
      <MetaItem
        label={es.runDetail.distance}
        icon={<Route className="h-4 w-4 text-muted-foreground" />}
        value={
          run.distanceKm
            ? `${run.distanceKm} ${es.common.km}`
            : es.runDetail.notKnownYet
        }
      />
      <MetaItem
        label={es.runDetail.paceLabel}
        icon={<Gauge className="h-4 w-4 text-muted-foreground" />}
        value={run.pace ?? es.runDetail.notKnownYet}
      />
    </div>
  );
}
