"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { assignClubOwner } from "@/lib/actions/admin";
import { es } from "@/lib/i18n/es";

export function AssignOwnerForm({ clubId }: { clubId: string }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(undefined);
    const result = await assignClubOwner(clubId, email);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-start gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={es.admin.ownerEmailPlaceholder}
        className="h-9 w-44"
        required
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {es.admin.assignOwner}
      </Button>
      {error ? <p className="w-full text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
