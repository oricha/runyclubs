"use client";

import { useEffect, useState } from "react";

export type ConsentStatus = "pending" | "accepted" | "rejected";

export const CONSENT_KEY = "runclubs_cookie_consent";

export function useCookieConsent(): ConsentStatus {
  const [status, setStatus] = useState<ConsentStatus>("pending");

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
    setStatus(saved ?? "pending");

    function handleStorageChange(e: StorageEvent) {
      if (e.key === CONSENT_KEY) {
        setStatus((e.newValue as ConsentStatus) ?? "pending");
      }
    }
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return status;
}
