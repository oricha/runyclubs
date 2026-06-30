"use client";

import { getAwardDefinition } from "@/lib/awards";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AwardBadgeProps {
  award: { key: string; icon: string; label: string };
  size?: "sm" | "md";
  showLabel?: boolean;
}

export function AwardBadge({ award, size = "sm", showLabel = false }: AwardBadgeProps) {
  const definition = getAwardDefinition(award.key);
  const label = definition?.label ?? award.label;
  const description = definition?.description;
  const tooltipText = description ? `${label} — ${description}` : label;

  const sizeClasses = size === "sm" ? "text-base leading-none" : "text-lg leading-none";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={label}
          className={cn(
            "inline-flex cursor-default items-center gap-1 rounded-full border border-border bg-card/90 backdrop-blur-sm",
            size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1",
            showLabel && "text-sm",
          )}
        >
          <span className={sizeClasses} aria-hidden>
            {award.icon}
          </span>
          {showLabel ? <span className="text-sm font-medium">{label}</span> : null}
        </span>
      </TooltipTrigger>
      {!showLabel ? (
        <TooltipContent side="top">{tooltipText}</TooltipContent>
      ) : description ? (
        <TooltipContent side="top">{description}</TooltipContent>
      ) : null}
    </Tooltip>
  );
}
