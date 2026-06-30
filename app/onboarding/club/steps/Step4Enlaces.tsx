"use client";

import { Input } from "@/components/ui/input";
import { es } from "@/lib/i18n/es";

import type { WizardState } from "../types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

interface Step4EnlacesProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
}

export function Step4Enlaces({ state, onChange, errors }: Step4EnlacesProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FieldLabel>{es.onboarding.instagramUrl}</FieldLabel>
        <Input
          value={state.instagramUrl}
          onChange={(e) => onChange({ instagramUrl: e.target.value })}
          placeholder="https://instagram.com/tuclub"
          type="url"
        />
        <FieldError message={errors.instagramUrl} />
      </div>

      <div className="space-y-2">
        <FieldLabel>{es.onboarding.stravaUrl}</FieldLabel>
        <Input
          value={state.stravaUrl}
          onChange={(e) => onChange({ stravaUrl: e.target.value })}
          placeholder="https://www.strava.com/clubs/..."
          type="url"
        />
        <FieldError message={errors.stravaUrl} />
      </div>

      <div className="space-y-2">
        <FieldLabel>{es.onboarding.website}</FieldLabel>
        <Input
          value={state.website}
          onChange={(e) => onChange({ website: e.target.value })}
          placeholder="https://tuclub.es"
          type="url"
        />
        <FieldError message={errors.website} />
      </div>
    </div>
  );
}
