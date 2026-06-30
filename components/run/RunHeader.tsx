import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DateBlock } from "@/components/cards/DateBlock";
import { TypeChip } from "@/components/cards/TypeChip";
import { es } from "@/lib/i18n/es";
import type { RunDetail } from "@/types";

export function RunHeader({ run }: { run: RunDetail }) {
  const startDate = new Date(run.startAt);

  return (
    <header className="space-y-4">
      <Link
        href="/carreras"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {es.runDetail.backToRuns}
      </Link>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <DateBlock date={startDate} />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-3xl leading-tight md:text-4xl">{run.title}</h1>
          <p className="mt-2 text-muted-foreground">{run.location}</p>
          {run.types.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {run.types.map((type) => (
                <TypeChip key={type.key} type={type} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
