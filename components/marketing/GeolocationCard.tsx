"use client";

import { useCallback, useState } from "react";
import { MapPin, Navigation } from "lucide-react";

import { findNearestCity } from "@/lib/geolocation";
import type { CityInfo } from "@/lib/cities";
import { es, t } from "@/lib/i18n/es";

type GeoState = "idle" | "locating" | "error" | "success";

export function GeolocationCard({
  onNearestCity,
}: {
  onNearestCity: (city: CityInfo) => void;
}) {
  const [state, setState] = useState<GeoState>("idle");
  const [nearestCity, setNearestCity] = useState<CityInfo | null>(null);

  const locate = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("error");
      return;
    }

    setState("locating");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const city = findNearestCity({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });

        if (!city) {
          setState("error");
          return;
        }

        setNearestCity(city);
        setState("success");
        onNearestCity(city);
      },
      () => {
        setState("error");
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [onNearestCity]);

  return (
    <div className="mb-6 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 font-medium">
        <MapPin size={18} className="shrink-0 text-primary" />
        {es.geo.title}
      </div>

      <button
        type="button"
        onClick={locate}
        disabled={state === "locating"}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Navigation size={16} />
        {es.geo.useLocation}
      </button>

      {state === "locating" && (
        <p className="mt-3 text-sm text-muted-foreground">{es.geo.locating}</p>
      )}

      {state === "error" && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {es.geo.permissionDenied}
        </p>
      )}

      {state === "success" && nearestCity && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {t(es.geo.located, { city: nearestCity.name })}
        </p>
      )}
    </div>
  );
}
