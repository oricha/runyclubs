"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserCity, updateUserName } from "@/lib/actions/account";
import { CITY_DETAILS, type CityInfo } from "@/lib/cities";
import { es } from "@/lib/i18n/es";

function getInitials(name?: string | null, email?: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "?";
}

export function AccountHeader({
  name,
  email,
  image,
  city,
  cities = CITY_DETAILS,
}: {
  name: string | null;
  email: string | null;
  image: string | null;
  city: string | null;
  cities?: CityInfo[];
}) {
  const [displayName, setDisplayName] = useState(name ?? "");
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name ?? "");
  const [nameError, setNameError] = useState<string | undefined>();
  const [savingName, setSavingName] = useState(false);
  const [selectedCity, setSelectedCity] = useState(city ?? "");
  const [savingCity, setSavingCity] = useState(false);

  const handleSaveName = async () => {
    setSavingName(true);
    setNameError(undefined);
    const result = await updateUserName(draftName);
    setSavingName(false);
    if (result.error) {
      setNameError(result.error);
      return;
    }
    setDisplayName(draftName.trim());
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setDraftName(displayName);
    setNameError(undefined);
    setEditing(false);
  };

  const handleCityChange = async (value: string) => {
    setSelectedCity(value);
    setSavingCity(true);
    await updateUserCity(value);
    setSavingCity(false);
  };

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <Avatar className="h-20 w-20">
        {image ? <AvatarImage src={image} alt={displayName || es.account.title} /> : null}
        <AvatarFallback className="bg-muted text-lg font-medium text-foreground">
          {getInitials(displayName, email)}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-4">
        <div>
          {editing ? (
            <div className="space-y-2">
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder={es.account.namePlaceholder}
                maxLength={80}
                autoFocus
              />
              {nameError ? <p className="text-sm text-destructive">{nameError}</p> : null}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleSaveName} disabled={savingName}>
                  {es.account.saveName}
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit} disabled={savingName}>
                  {es.account.cancel}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-2xl font-normal tracking-tight">
                {displayName || email}
              </h1>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1 px-2 text-muted-foreground"
                onClick={() => {
                  setDraftName(displayName);
                  setEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
                {es.account.editName}
              </Button>
            </div>
          )}
          {email ? <p className="mt-1 text-sm text-muted-foreground">{email}</p> : null}
        </div>

        <div className="max-w-xs space-y-2">
          <label htmlFor="account-city" className="text-sm font-medium">
            {es.account.cityLabel}
          </label>
          <select
            id="account-city"
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={savingCity}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <option value="">{es.account.noCitySelected}</option>
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
