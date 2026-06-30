import { es, t } from "@/lib/i18n/es";

export function ResultsSummary({ count }: { count: number }) {
  return (
    <p className="text-sm text-muted-foreground">
      {t(es.home.runsCount, { count })}
    </p>
  );
}
