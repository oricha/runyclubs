"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CONSENT_KEY, type ConsentStatus } from "@/hooks/useCookieConsent";
import { es } from "@/lib/i18n/es";

export function CookieBanner() {
  const [status, setStatus] = useState<ConsentStatus | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
    setStatus(saved ?? "pending");
  }, []);

  if (status !== "pending") return null;

  function accept() {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setStatus("accepted");
    // if (typeof window !== "undefined") window.__enableAnalytics?.();
  }

  function reject() {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setStatus("rejected");
  }

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background p-4 shadow-lg sm:p-6"
    >
      <div className="container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground">
          {es.legal.cookieBannerText}{" "}
          <Link href="/privacidad" className="underline hover:opacity-70">
            {es.legal.privacyLink}
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={reject}
            className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            {es.legal.essentialOnly}
          </button>
          <button
            type="button"
            onClick={accept}
            className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90"
          >
            {es.legal.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
