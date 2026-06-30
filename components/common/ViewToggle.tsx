"use client";

import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils";
import { es } from "@/lib/i18n/es";

export type ViewMode = "list" | "grid";

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div
      role="group"
      aria-label={`${es.common.list} / ${es.common.grid}`}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1"
    >
      <button
        type="button"
        aria-pressed={value === "list"}
        onClick={() => onChange("list")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          value === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
        )}
      >
        <List className="h-4 w-4" />
        {es.common.list}
      </button>
      <button
        type="button"
        aria-pressed={value === "grid"}
        onClick={() => onChange("grid")}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          value === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        {es.common.grid}
      </button>
    </div>
  );
}
