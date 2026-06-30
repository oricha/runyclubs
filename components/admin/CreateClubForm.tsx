"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClubAsAdmin } from "@/lib/actions/admin";
import { CITY_DETAILS } from "@/lib/cities";
import { es } from "@/lib/i18n/es";

export function CreateClubForm() {
  const [name, setName] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const result = await createClubAsAdmin({ name, citySlug, ownerEmail });
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setCitySlug("");
    setOwnerEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="admin-club-name" className="text-sm font-medium">
            {es.admin.clubName}
          </label>
          <Input
            id="admin-club-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={es.admin.clubNamePlaceholder}
            required
            minLength={2}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-club-city" className="text-sm font-medium">
            {es.admin.city}
          </label>
          <select
            id="admin-club-city"
            value={citySlug}
            onChange={(e) => setCitySlug(e.target.value)}
            required
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">{es.admin.cityPlaceholder}</option>
            {CITY_DETAILS.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-club-owner" className="text-sm font-medium">
            {es.admin.ownerEmail}
          </label>
          <Input
            id="admin-club-owner"
            type="email"
            value={ownerEmail}
            onChange={(e) => setOwnerEmail(e.target.value)}
            placeholder={es.admin.ownerEmailPlaceholder}
            required
          />
        </div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? es.admin.creating : es.admin.createClub}
      </Button>
    </form>
  );
}
