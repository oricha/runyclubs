"use client";

import { useState } from "react";

import { sendCollaborationEmail } from "@/lib/actions/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { es } from "@/lib/i18n/es";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormStatus = "idle" | "loading" | "success" | "error";

export function ContactForm() {
  const [company, setCompany] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [area, setArea] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!company.trim() || !contactName.trim() || !email.trim() || !message.trim()) {
      setStatus("error");
      setErrorMessage(es.collaborations.requiredError);
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setStatus("error");
      setErrorMessage(es.collaborations.emailError);
      return;
    }

    setStatus("loading");
    setErrorMessage(null);

    const result = await sendCollaborationEmail({
      company,
      contactName,
      email,
      area: area || undefined,
      message,
    });

    if (!result.success) {
      setStatus("error");
      setErrorMessage(result.error ?? es.collaborations.sendError);
      return;
    }

    setStatus("success");
    setCompany("");
    setContactName("");
    setEmail("");
    setArea("");
    setMessage("");
  }

  if (status === "success") {
    return (
      <p className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm" role="status">
        {es.collaborations.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="company" className="text-sm font-medium">
            {es.collaborations.companyLabel} *
          </label>
          <Input
            id="company"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="contactName" className="text-sm font-medium">
            {es.collaborations.contactLabel} *
          </label>
          <Input
            id="contactName"
            required
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">
            {es.collaborations.emailLabel} *
          </label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === "loading"}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="area" className="text-sm font-medium">
            {es.collaborations.areaLabel}
          </label>
          <Input
            id="area"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder={es.collaborations.areaPlaceholder}
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="message" className="text-sm font-medium">
          {es.collaborations.messageLabel} *
        </label>
        <textarea
          id="message"
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
        {status === "loading" ? es.collaborations.sending : es.collaborations.submit}
      </Button>
    </form>
  );
}
