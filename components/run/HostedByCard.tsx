import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { es } from "@/lib/i18n/es";
import type { RunDetail } from "@/types";

function OrganizerCard({
  name,
  role,
}: {
  name: string;
  role?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <Avatar className="h-10 w-10">
        <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{name}</p>
        {role ? <p className="text-sm text-muted-foreground">{role}</p> : null}
      </div>
    </div>
  );
}

export function HostedByCard({ run }: { run: RunDetail }) {
  return (
    <section className="space-y-3">
      <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {es.runDetail.hostedBy}
      </h2>
      <Link
        href={`/clubs/${run.club.slug}`}
        className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
      >
        <Avatar className="h-12 w-12 rounded-xl">
          {run.club.logoUrl ? (
            <AvatarImage src={run.club.logoUrl} alt={run.club.name} />
          ) : null}
          <AvatarFallback className="rounded-xl">
            {run.club.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{run.club.name}</p>
          <p className="text-sm text-muted-foreground">{run.club.city}</p>
        </div>
      </Link>
      {run.organizerName ? (
        <OrganizerCard
          name={run.organizerName}
          role={run.organizerRole}
        />
      ) : null}
    </section>
  );
}
