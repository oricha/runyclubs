"use client";

import { useState } from "react";

import {
  AD_TYPE_LABELS,
  AD_TYPES,
  sendAdvertiseEmail,
  type AdType,
} from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { es } from "@/lib/i18n/es";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormStatus = "idle" | "loading" | "success" | "error";

export function AdForm({ defaultEmail }: { defaultEmail?: string | null }) {
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [adType, setAdType] = useState<AdType | "">("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!company.trim() || !contactName.trim() || !email.trim() || !message.trim() || !adType) {
      setStatus("error");
      setErrorMessage(es.advertise.requiredError);
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setStatus("error");
      setErrorMessage(es.advertise.emailError);
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const result = await sendAdvertiseEmail({
      company,
      contactName,
      email,
      adType,
      budget: budget || undefined,
      message,
    });

    if (!result.success) {
      setStatus("error");
      setErrorMessage(result.error ?? es.advertise.sendError);
      return;
    }

    setStatus("success");
    setCompany("");
    setContactName("");
    setEmail(defaultEmail ?? "");
    setAdType("");
    setBudget("");
    setMessage("");
  }

  if (status === "success") {
    return (
      <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm" role="status">
        {es.advertise.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ad-company" className="text-sm font-medium">
            {es.advertise.companyLabel} *
          </label>
          <Input
            id="ad-company"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="ad-contact" className="text-sm font-medium">
            {es.advertise.contactLabel} *
          </label>
          <Input
            id="ad-contact"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="ad-email" className="text-sm font-medium">
            {es.advertise.emailLabel} *
          </label>
          <Input
            id="ad-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="ad-type" className="text-sm font-medium">
            {es.advertise.typeLabel} *
          </label>
          <select
            id="ad-type"
            required
            value={adType}
            onChange={(e) => setAdType(e.target.value as AdType)}
            disabled={status === "loading"}
            className="flex h-10 w-full rounded-full border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{es.advertise.typePlaceholder}</option>
            {AD_TYPES.map((type) => (
              <option key={type} value={type}>
                {AD_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ad-budget" className="text-sm font-medium">
          {es.advertise.budgetLabel}
        </label>
        <Input
          id="ad-budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder={es.advertise.budgetPlaceholder}
          disabled={status === "loading"}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="ad-message" className="text-sm font-medium">
          {es.advertise.messageLabel} *
        </label>
        <textarea
          id="ad-message"
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={status === "loading"}
          className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {status === "error" && errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" disabled={status === "loading"}>
        {status === "loading" ? es.advertise.sending : es.advertise.submit}
      </Button>
    </form>
  );
}
