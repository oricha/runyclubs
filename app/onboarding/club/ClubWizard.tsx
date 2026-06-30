"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { es } from "@/lib/i18n/es";
import type { CityInfo } from "@/lib/cities";

import { createClub } from "./actions";
import { Step1Datos } from "./steps/Step1Datos";
import { Step2Recurrencias } from "./steps/Step2Recurrencias";
import { Step3Estilo } from "./steps/Step3Estilo";
import { Step4Enlaces } from "./steps/Step4Enlaces";
import { Step5Publicar } from "./steps/Step5Publicar";
import {
  INITIAL_WIZARD_STATE,
  isValidHttpUrl,
  type WizardState,
} from "./types";

const STEPS = [
  es.onboarding.stepDatos,
  es.onboarding.stepCarreras,
  es.onboarding.stepEstilo,
  es.onboarding.stepRedes,
  es.onboarding.stepPublicar,
] as const;

const TIME_REGEX = /^\d{2}:\d{2}$/;

interface ClubWizardProps {
  cities: CityInfo[];
}

export function ClubWizard({ cities }: ClubWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>(INITIAL_WIZARD_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | undefined>();
  const [successSlug, setSuccessSlug] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);

  const patchState = (patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }));
    setErrors({});
  };

  const validateStep = (currentStep: number): Record<string, string> => {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (state.name.trim().length < 2) {
        nextErrors.name = es.onboarding.errorMinName;
      }
      if (!state.citySlug) {
        nextErrors.citySlug = es.onboarding.errorCityRequired;
      }
      if (state.description.trim().length < 20) {
        nextErrors.description = es.onboarding.errorMinDescription;
      }
    }

    if (currentStep === 1) {
      if (state.recurrencias.length === 0) {
        nextErrors.recurrencias = es.onboarding.errorMinRecurrencias;
      }
      state.recurrencias.forEach((r, index) => {
        if (!r.title.trim()) {
          nextErrors[`recurrencias.${index}.title`] = es.onboarding.errorRecurrenciaTitle;
        }
        if (!r.location.trim()) {
          nextErrors[`recurrencias.${index}.location`] = es.onboarding.errorRecurrenciaLocation;
        }
        if (!TIME_REGEX.test(r.time)) {
          nextErrors[`recurrencias.${index}.time`] = es.onboarding.errorRecurrenciaTime;
        }
      });
    }

    if (currentStep === 2) {
      if (state.logoUrl.trim() && !isValidHttpUrl(state.logoUrl)) {
        nextErrors.logoUrl = es.onboarding.errorUrlFormat;
      }
      if (state.coverUrl.trim() && !isValidHttpUrl(state.coverUrl)) {
        nextErrors.coverUrl = es.onboarding.errorUrlFormat;
      }
    }

    if (currentStep === 3) {
      if (state.instagramUrl.trim() && !isValidHttpUrl(state.instagramUrl)) {
        nextErrors.instagramUrl = es.onboarding.errorUrlFormat;
      }
      if (state.stravaUrl.trim() && !isValidHttpUrl(state.stravaUrl)) {
        nextErrors.stravaUrl = es.onboarding.errorUrlFormat;
      }
      if (state.website.trim() && !isValidHttpUrl(state.website)) {
        nextErrors.website = es.onboarding.errorUrlFormat;
      }
    }

    return nextErrors;
  };

  const handleNext = () => {
    const nextErrors = validateStep(step);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handlePublish = async () => {
    const nextErrors = validateStep(0);
    const step2Errors = validateStep(1);
    const step3Errors = validateStep(2);
    const step4Errors = validateStep(3);
    const allErrors = { ...nextErrors, ...step2Errors, ...step3Errors, ...step4Errors };
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setPublishing(true);
    setPublishError(undefined);

    const result = await createClub({
      name: state.name,
      citySlug: state.citySlug,
      description: state.description,
      pace: state.pace,
      typeIds: state.typeIds,
      recurrencias: state.recurrencias,
      logoUrl: state.logoUrl || undefined,
      coverUrl: state.coverUrl || undefined,
      instagramUrl: state.instagramUrl || undefined,
      stravaUrl: state.stravaUrl || undefined,
      website: state.website || undefined,
    });

    setPublishing(false);

    if (result.success) {
      setSuccessSlug(result.slug);
      return;
    }

    setPublishError(result.error);
  };

  const handleCopyLink = async () => {
    if (!successSlug) return;
    const url = `${window.location.origin}/clubs/${successSlug}`;
    await navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (successSlug) {
    const clubUrl = `/clubs/${successSlug}`;
    return (
      <div className="mx-auto max-w-lg space-y-8 text-center">
        <div className="space-y-2">
          <p className="text-4xl">🏃</p>
          <h1 className="font-serif text-3xl">{es.onboarding.successTitle}</h1>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{state.name}</span>{" "}
            {es.onboarding.successText}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={() => router.push(clubUrl)}>{es.onboarding.viewClub}</Button>
          <Button variant="outline" onClick={handleCopyLink}>
            {linkCopied ? es.onboarding.linkCopied : es.onboarding.copyLink}
          </Button>
          <Button variant="ghost" onClick={() => router.push("/")}>
            {es.onboarding.backToHome}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl">{es.onboarding.pageTitle}</h1>
        <p className="text-sm text-muted-foreground">{es.onboarding.pageSubtitle}</p>
      </div>

      <nav aria-label="Progreso del wizard" className="flex flex-wrap justify-center gap-2">
        {STEPS.map((label, index) => (
          <span
            key={label}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              index === step
                ? "bg-primary text-primary-foreground"
                : index < step
                  ? "bg-secondary text-foreground"
                  : "border border-border text-muted-foreground",
            )}
          >
            {index + 1}. {label}
          </span>
        ))}
      </nav>

      <div className="rounded-xl border border-border bg-card p-6">
        {step === 0 && (
          <Step1Datos state={state} onChange={patchState} errors={errors} cities={cities} />
        )}
        {step === 1 && (
          <Step2Recurrencias state={state} onChange={patchState} errors={errors} />
        )}
        {step === 2 && (
          <Step3Estilo state={state} onChange={patchState} errors={errors} />
        )}
        {step === 3 && (
          <Step4Enlaces state={state} onChange={patchState} errors={errors} />
        )}
        {step === 4 && (
          <Step5Publicar state={state} cities={cities} publishError={publishError} />
        )}
      </div>

      <div className="flex justify-between gap-4">
        <Button type="button" variant="outline" onClick={handleBack} disabled={step === 0}>
          {es.onboarding.back}
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            {es.onboarding.next}
          </Button>
        ) : (
          <Button type="button" onClick={handlePublish} disabled={publishing}>
            {publishing ? es.onboarding.publishing : es.onboarding.publishButton}
          </Button>
        )}
      </div>
    </div>
  );
}
