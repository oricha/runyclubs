import type { Pace } from "@/types";

export interface RecurrenciaInput {
  title: string;
  weekday: number;
  time: string;
  location: string;
  distanceKm: string;
  pace: string;
  typeIds: string[];
}

export interface WizardState {
  name: string;
  citySlug: string;
  description: string;
  pace: Pace;
  typeIds: string[];
  recurrencias: RecurrenciaInput[];
  logoUrl: string;
  coverUrl: string;
  instagramUrl: string;
  stravaUrl: string;
  website: string;
}

export const EMPTY_RECURRENCIA: RecurrenciaInput = {
  title: "",
  weekday: 1,
  time: "07:30",
  location: "",
  distanceKm: "",
  pace: "",
  typeIds: [],
};

export const INITIAL_WIZARD_STATE: WizardState = {
  name: "",
  citySlug: "",
  description: "",
  pace: "ALL_PACES",
  typeIds: [],
  recurrencias: [],
  logoUrl: "",
  coverUrl: "",
  instagramUrl: "",
  stravaUrl: "",
  website: "",
};

/** Orden español; valores 0–6 según Date.getDay() (0=domingo). */
export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
] as const;

export function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (!/^https?:\/\//.test(trimmed)) return false;
  try {
    return URL.canParse(trimmed);
  } catch {
    return false;
  }
}

export function weekdayLabel(weekday: number): string {
  return WEEKDAY_OPTIONS.find((d) => d.value === weekday)?.label ?? String(weekday);
}
