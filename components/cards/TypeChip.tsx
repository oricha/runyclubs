import type { RunTypeTag } from "@/types";

export function TypeChip({ type }: { type: RunTypeTag }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-xs">
      <span>{type.emoji}</span>
      {type.label}
    </span>
  );
}
