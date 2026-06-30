"use client";

import { Input } from "@/components/ui/input";
import { es } from "@/lib/i18n/es";

import { isValidHttpUrl, type WizardState } from "../types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

interface Step3EstiloProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
}

export function Step3Estilo({ state, onChange, errors }: Step3EstiloProps) {
  const showLogoPreview = state.logoUrl.trim() && isValidHttpUrl(state.logoUrl);
  const showCoverPreview = state.coverUrl.trim() && isValidHttpUrl(state.coverUrl);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">{es.onboarding.logoUrlHint}</p>

      <div className="space-y-2">
        <FieldLabel>{es.onboarding.logoUrl}</FieldLabel>
        <Input
          value={state.logoUrl}
          onChange={(e) => onChange({ logoUrl: e.target.value })}
          placeholder="https://..."
          type="url"
        />
        <FieldError message={errors.logoUrl} />
        {showLogoPreview ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{es.onboarding.imagePreview}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.logoUrl.trim()}
              alt=""
              className="h-20 w-20 rounded-full border border-border object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <FieldLabel>{es.onboarding.coverUrl}</FieldLabel>
        <Input
          value={state.coverUrl}
          onChange={(e) => onChange({ coverUrl: e.target.value })}
          placeholder="https://..."
          type="url"
        />
        <FieldError message={errors.coverUrl} />
        {showCoverPreview ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">{es.onboarding.imagePreview}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={state.coverUrl.trim()}
              alt=""
              className="h-40 w-full rounded-lg border border-border object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
