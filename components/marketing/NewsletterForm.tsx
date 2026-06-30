"use client";

import { useState } from "react";

import { subscribeToNewsletter } from "@/lib/actions/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { es } from "@/lib/i18n/es";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormStatus = "idle" | "loading" | "success" | "duplicate" | "error";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = email.trim();
    if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
      setStatus("error");
      setErrorMessage(es.footer.subscribeError);
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const result = await subscribeToNewsletter(trimmed);

    if (!result.success) {
      setStatus("error");
      setErrorMessage(result.error ?? es.footer.subscribeError);
      return;
    }

    if (result.alreadySubscribed) {
      setStatus("duplicate");
      return;
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <p className="mt-4 text-sm text-foreground">{es.footer.subscribeSuccess}</p>
    );
  }

  if (status === "duplicate") {
    return (
      <p className="mt-4 text-sm text-foreground">{es.footer.subscribeDuplicate}</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex max-w-sm flex-col gap-2 sm:flex-row">
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Input
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") {
              setStatus("idle");
              setErrorMessage(null);
            }
          }}
          placeholder={es.footer.emailPlaceholder}
          aria-label={es.footer.emailPlaceholder}
          aria-invalid={status === "error"}
          disabled={status === "loading"}
          className="rounded-full"
        />
        {status === "error" && errorMessage ? (
          <p className="text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
      <Button type="submit" className="shrink-0" disabled={status === "loading"}>
        {status === "loading" ? es.footer.subscribeSending : es.footer.subscribe}
      </Button>
    </form>
  );
}
