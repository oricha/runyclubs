"use client";

import { cn } from "@/lib/utils";
import { getPaceLabel } from "@/lib/pace-labels";
import { RUN_TYPES } from "@/lib/run-types";
import { es } from "@/lib/i18n/es";
import type { Pace } from "@/types";
import { Input } from "@/components/ui/input";

import type { CityInfo } from "@/lib/cities";
import type { WizardState } from "../types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

function TypeChip({
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

interface Step1DatosProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
  cities: CityInfo[];
}

export function Step1Datos({ state, onChange, errors, cities }: Step1DatosProps) {
  const toggleType = (typeId: string) => {
    const next = state.typeIds.includes(typeId)
      ? state.typeIds.filter((id) => id !== typeId)
      : [...state.typeIds, typeId];
    onChange({ typeIds: next });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FieldLabel>{es.onboarding.clubName}</FieldLabel>
        <Input
          value={state.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={es.onboarding.clubNamePlaceholder}
          maxLength={80}
        />
        <FieldError message={errors.name} />
      </div>

      <div className="space-y-2">
        <FieldLabel>{es.onboarding.city}</FieldLabel>
        <select
          value={state.citySlug}
          onChange={(e) => onChange({ citySlug: e.target.value })}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">—</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.citySlug} />
      </div>

      <div className="space-y-2">
        <FieldLabel>{es.onboarding.description}</FieldLabel>
        <textarea
          value={state.description}
          onChange={(e) => onChange({ description: e.target.value })}
          placeholder={es.onboarding.descriptionPlaceholder}
          maxLength={500}
          rows={5}
          className="flex w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <p className="text-xs text-muted-foreground">{state.description.length}/500</p>
        <FieldError message={errors.description} />
      </div>

      <div className="space-y-2">
        <FieldLabel>{es.onboarding.types}</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {RUN_TYPES.map((type) => (
            <TypeChip
              key={type.id}
              active={state.typeIds.includes(type.id)}
              onClick={() => toggleType(type.id)}
            >
              {type.emoji} {type.label}
            </TypeChip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel>{es.onboarding.pace}</FieldLabel>
        <select
          value={state.pace}
          onChange={(e) => onChange({ pace: e.target.value as Pace })}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {(["ALL_PACES", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as Pace[]).map((pace) => (
            <option key={pace} value={pace}>
              {getPaceLabel(pace)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
