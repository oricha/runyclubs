import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { es } from "@/lib/i18n/es";
import { cn } from "@/lib/utils";

type RunAttendanceCardProps = {
  slug: string;
  title: string;
  startAt: Date;
  location: string;
  clubName: string;
  isUpcoming: boolean;
};

function formatRunDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

export function RunAttendanceCard({
  slug,
  title,
  startAt,
  location,
  clubName,
  isUpcoming,
}: RunAttendanceCardProps) {
  const dateStr = formatRunDate(new Date(startAt));

  return (
    <Link
      href={`/carreras/${slug}`}
      className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        <Badge
          variant={isUpcoming ? "default" : "secondary"}
          className={cn(
            isUpcoming
              ? "border-transparent bg-emerald-600 text-white"
              : "text-muted-foreground"
          )}
        >
          {isUpcoming ? es.account.upcomingBadge : "Pasada"}
        </Badge>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Calendar size={14} />
          {dateStr}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin size={14} />
          {location}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{clubName}</p>
    </Link>
  );
}
