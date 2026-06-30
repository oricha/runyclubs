"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Calendar, List } from "lucide-react";

import { RunCard } from "@/components/cards/RunCard";
import { cn } from "@/lib/utils";
import { es } from "@/lib/i18n/es";
import type { RunSummary } from "@/types";

type ViewMode = "list" | "calendar";

const WEEKDAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function CityRunCalendar({ runs }: { runs: RunSummary[] }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const runsByDate = useMemo(() => {
    const map = new Map<string, RunSummary[]>();
    for (const run of runs) {
      const d = new Date(run.startAt);
      if (d.getFullYear() !== year || d.getMonth() !== month) continue;
      const key = dateKey(d);
      const list = map.get(key) ?? [];
      list.push(run);
      map.set(key, list);
    }
    return map;
  }, [runs, year, month]);

  const weeks = useMemo(() => {
    const firstOfMonth = new Date(year, month, 1);
    const gridStart = new Date(firstOfMonth);
    const mondayOffset = (firstOfMonth.getDay() + 6) % 7;
    gridStart.setDate(firstOfMonth.getDate() - mondayOffset);

    const rows: Date[][] = [];
    const cursor = new Date(gridStart);

    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      rows.push(week);
    }

    return rows;
  }, [year, month]);

  const monthLabel = new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <p className="border-b border-border px-4 py-2 text-sm font-medium capitalize">
        {monthLabel}
      </p>
      <table className="w-full min-w-[480px] border-collapse text-xs">
        <thead>
          <tr>
            <th className="border-b border-border px-2 py-2 text-left font-medium text-muted-foreground">
              Semana
            </th>
            {WEEKDAY_LABELS.map((label) => (
              <th
                key={label}
                className="border-b border-border px-1 py-2 text-center font-medium text-muted-foreground"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => {
            const hasMonthDay = week.some((d) => d.getMonth() === month);
            if (!hasMonthDay) return null;

            return (
              <tr key={weekIndex} className="border-b border-border last:border-0">
                <td className="px-2 py-2 align-top text-muted-foreground">{weekIndex + 1}</td>
                {week.map((day) => {
                  const inMonth = day.getMonth() === month;
                  const key = dateKey(day);
                  const dayRuns = runsByDate.get(key) ?? [];
                  const isToday = dateKey(now) === key;

                  return (
                    <td
                      key={key}
                      className={cn(
                        "min-h-[3rem] border-l border-border px-1 py-1 align-top",
                        !inMonth && "bg-muted/30 text-muted-foreground/50",
                        isToday && inMonth && "bg-primary/5",
                      )}
                    >
                      <span className="block text-[10px] font-medium">{day.getDate()}</span>
                      <div className="mt-0.5 space-y-0.5">
                        {dayRuns.map((run) => (
                          <Link
                            key={run.id}
                            href={`/carreras/${run.slug}`}
                            className="block truncate rounded bg-secondary px-0.5 py-0.5 text-[10px] leading-tight hover:bg-primary/10"
                            title={run.title}
                          >
                            🏃 {run.title}
                          </Link>
                        ))}
                        {inMonth && dayRuns.length === 0 ? (
                          <span className="text-muted-foreground/40">·</span>
                        ) : null}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CityCalendarToggle({ runs }: { runs: RunSummary[] }) {
  const [view, setView] = useState<ViewMode>("list");

  return (
    <div className="space-y-4">
      <div
        role="group"
        aria-label={`${es.cityPage.listView} / ${es.cityPage.calendarView}`}
        className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
      >
        <button
          type="button"
          aria-pressed={view === "list"}
          onClick={() => setView("list")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            view === "list"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary",
          )}
        >
          <List className="h-4 w-4" />
          {es.cityPage.listView}
        </button>
        <button
          type="button"
          aria-pressed={view === "calendar"}
          onClick={() => setView("calendar")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            view === "calendar"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary",
          )}
        >
          <Calendar className="h-4 w-4" />
          {es.cityPage.calendarView}
        </button>
      </div>

      {view === "list" ? (
        runs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{es.cityPage.noRuns}</p>
        ) : (
          <ul className="space-y-3">
            {runs.map((run) => (
              <li key={run.id}>
                <RunCard run={run} />
              </li>
            ))}
          </ul>
        )
      ) : (
        <CityRunCalendar runs={runs} />
      )}
    </div>
  );
}
