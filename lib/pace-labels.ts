import { es } from "@/lib/i18n/es";
import type { Pace } from "@/types";

export const PACE_LABELS: Record<Pace, string> = {
  ALL_PACES: es.common.allPaces,
  BEGINNER: es.common.beginner,
  INTERMEDIATE: es.common.intermediate,
  ADVANCED: es.common.advanced,
};

export function getPaceLabel(pace: Pace): string {
  return PACE_LABELS[pace];
}

export const PACE_OPTIONS: Pace[] = [
  "ALL_PACES",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];
