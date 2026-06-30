"use client";

import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RUN_TYPES } from "@/lib/run-types";
import { cn } from "@/lib/utils";
import { es } from "@/lib/i18n/es";

import { EMPTY_RECURRENCIA, WEEKDAY_OPTIONS, type RecurrenciaInput, type WizardState } from "../types";

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive">{message}</p>;
}

interface Step2RecurrenciasProps {
  state: WizardState;
  onChange: (patch: Partial<WizardState>) => void;
  errors: Record<string, string>;
}

function RecurrenciaCard({
  recurrencia,
  index,
  onUpdate,
  onRemove,
  errors,
}: {
  recurrencia: RecurrenciaInput;
  index: number;
  onUpdate: (patch: Partial<RecurrenciaInput>) => void;
  onRemove: () => void;
  errors: Record<string, string>;
}) {
  const toggleType = (typeId: string) => {
    const next = recurrencia.typeIds.includes(typeId)
      ? recurrencia.typeIds.filter((id) => id !== typeId)
      : [...recurrencia.typeIds, typeId];
    onUpdate({ typeIds: next });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">
          {es.onboarding.recurrenciaTitle} {index + 1}
        </CardTitle>
        <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
          {es.onboarding.removeRecurrencia}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <FieldLabel>{es.onboarding.recurrenciaTitle}</FieldLabel>
          <Input
            value={recurrencia.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Quedada de los martes"
          />
          <FieldError message={errors[`recurrencias.${index}.title`]} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>{es.onboarding.weekday}</FieldLabel>
            <select
              value={recurrencia.weekday}
              onChange={(e) => onUpdate({ weekday: Number(e.target.value) })}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {WEEKDAY_OPTIONS.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <FieldLabel>{es.onboarding.time}</FieldLabel>
            <Input
              type="time"
              value={recurrencia.time}
              onChange={(e) => onUpdate({ time: e.target.value })}
            />
            <FieldError message={errors[`recurrencias.${index}.time`]} />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>{es.onboarding.location}</FieldLabel>
          <Input
            value={recurrencia.location}
            onChange={(e) => onUpdate({ location: e.target.value })}
            placeholder="Puerta de Alcalá, Madrid"
          />
          <FieldError message={errors[`recurrencias.${index}.location`]} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <FieldLabel>{es.onboarding.distanceKm}</FieldLabel>
            <Input
              type="number"
              min={0}
              step={0.1}
              value={recurrencia.distanceKm}
              onChange={(e) => onUpdate({ distanceKm: e.target.value })}
              placeholder="5"
            />
          </div>
          <div className="space-y-2">
            <FieldLabel>{es.onboarding.pace_run}</FieldLabel>
            <Input
              value={recurrencia.pace}
              onChange={(e) => onUpdate({ pace: e.target.value })}
              placeholder="5:30/km"
            />
          </div>
        </div>

        <div className="space-y-2">
          <FieldLabel>{es.onboarding.types}</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {RUN_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => toggleType(type.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  recurrencia.typeIds.includes(type.id)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card hover:bg-secondary",
                )}
              >
                {type.emoji} {type.label}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function Step2Recurrencias({ state, onChange, errors }: Step2RecurrenciasProps) {
  const updateRecurrencia = (index: number, patch: Partial<RecurrenciaInput>) => {
    const next = state.recurrencias.map((r, i) => (i === index ? { ...r, ...patch } : r));
    onChange({ recurrencias: next });
  };

  const removeRecurrencia = (index: number) => {
    onChange({ recurrencias: state.recurrencias.filter((_, i) => i !== index) });
  };

  const addRecurrencia = () => {
    onChange({
      recurrencias: [...state.recurrencias, { ...EMPTY_RECURRENCIA }],
    });
  };

  return (
    <div className="space-y-4">
      {state.recurrencias.length === 0 ? (
        <p className="text-sm text-muted-foreground">{es.onboarding.errorMinRecurrencias}</p>
      ) : null}
      <FieldError message={errors.recurrencias} />

      {state.recurrencias.map((recurrencia, index) => (
        <RecurrenciaCard
          key={index}
          recurrencia={recurrencia}
          index={index}
          onUpdate={(patch) => updateRecurrencia(index, patch)}
          onRemove={() => removeRecurrencia(index)}
          errors={errors}
        />
      ))}

      <Button type="button" variant="outline" onClick={addRecurrencia}>
        {es.onboarding.addRecurrencia}
      </Button>
    </div>
  );
}
