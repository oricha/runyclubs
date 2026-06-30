import { RunCard } from "@/components/cards/RunCard";
import { es } from "@/lib/i18n/es";
import type { RunSummary } from "@/types";

export function RunsAroundDate({ runs }: { runs: RunSummary[] }) {
  if (runs.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-2xl">{es.runDetail.runsAroundDate}</h2>
      <div className="space-y-3">
        {runs.map((run) => (
          <RunCard key={run.id} run={run} />
        ))}
      </div>
    </section>
  );
}
