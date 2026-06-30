"use client";

import { cn } from "@/lib/utils";
import { CITY_DETAILS } from "@/lib/cities";
import { RUN_TYPES } from "@/lib/run-types";
import { PACE_LABELS, PACE_OPTIONS } from "@/lib/pace-labels";
import { es } from "@/lib/i18n/es";
import { useRunFilters } from "@/hooks/useRunFilters";
import { FilterAccordion } from "./FilterAccordion";
import { ClearAllButton } from "./ClearAllButton";

const WEEKDAYS = [
  { value: "1", label: "Lunes" },
  { value: "2", label: "Martes" },
  { value: "3", label: "Miércoles" },
  { value: "4", label: "Jueves" },
  { value: "5", label: "Viernes" },
  { value: "6", label: "Sábado" },
  { value: "0", label: "Domingo" },
];

const PACES = PACE_OPTIONS;

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-secondary",
      )}
    >
      {children}
    </button>
  );
}

export function FilterSidebar() {
  const { params, toggle, setSingle, clearAll } = useRunFilters();

  const activeCity = params.get("city");
  const activeTypes = params.getAll("types");
  const activePace = params.getAll("pace");
  const activeWeekday = params.getAll("weekday");
  const activeDate = params.get("date");

  const hasFilters =
    activeCity ||
    activeTypes.length > 0 ||
    activePace.length > 0 ||
    activeWeekday.length > 0 ||
    activeDate;

  return (
    <aside className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{es.filters.title}</h2>
        {hasFilters ? <ClearAllButton onClick={clearAll} /> : null}
      </div>

      <FilterAccordion
        title={es.filters.city}
        count={activeCity ? 1 : undefined}
        value="city"
      >
        <div className="flex flex-wrap gap-2">
          {CITY_DETAILS.map((city) => (
            <FilterChip
              key={city.slug}
              active={activeCity === city.slug}
              onClick={() =>
                setSingle("city", activeCity === city.slug ? null : city.slug)
              }
            >
              {city.name}
            </FilterChip>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion
        title={es.filters.typeOfRun}
        count={activeTypes.length || undefined}
        value="types"
      >
        <div className="flex flex-wrap gap-2">
          {RUN_TYPES.map((type) => (
            <FilterChip
              key={type.id}
              active={activeTypes.includes(type.id)}
              onClick={() => toggle("types", type.id)}
            >
              {type.emoji} {type.label}
            </FilterChip>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion
        title={es.filters.pace}
        count={activePace.length || undefined}
        value="pace"
      >
        <div className="flex flex-wrap gap-2">
          {PACES.map((pace) => (
            <FilterChip
              key={pace}
              active={activePace.includes(pace)}
              onClick={() => toggle("pace", pace)}
            >
              {PACE_LABELS[pace]}
            </FilterChip>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion
        title={es.filters.dayOfWeek}
        count={activeWeekday.length || undefined}
        value="weekday"
      >
        <div className="flex flex-wrap gap-2">
          {WEEKDAYS.map((day) => (
            <FilterChip
              key={day.value}
              active={activeWeekday.includes(day.value)}
              onClick={() => toggle("weekday", day.value)}
            >
              {day.label}
            </FilterChip>
          ))}
        </div>
      </FilterAccordion>

      <FilterAccordion
        title={es.filters.date}
        count={activeDate ? 1 : undefined}
        value="date"
      >
        <div className="flex flex-wrap gap-2">
          <FilterChip
            active={activeDate === "week"}
            onClick={() =>
              setSingle("date", activeDate === "week" ? null : "week")
            }
          >
            {es.filters.thisWeek}
          </FilterChip>
          <FilterChip
            active={activeDate === "month"}
            onClick={() =>
              setSingle("date", activeDate === "month" ? null : "month")
            }
          >
            {es.filters.thisMonth}
          </FilterChip>
        </div>
      </FilterAccordion>
    </aside>
  );
}
