"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { disableClub, enableClub } from "@/lib/actions/admin";
import { es } from "@/lib/i18n/es";

export function ClubVerifiedToggle({
  clubId,
  verified,
}: {
  clubId: string;
  verified: boolean;
}) {
  const [pending, setPending] = useState(false);

  const handleDisable = async () => {
    if (!window.confirm(es.admin.disableConfirm)) return;
    setPending(true);
    await disableClub(clubId);
    setPending(false);
  };

  const handleEnable = async () => {
    setPending(true);
    await enableClub(clubId);
    setPending(false);
  };

  if (verified) {
    return (
      <Button size="sm" variant="outline" disabled={pending} onClick={handleDisable}>
        {es.admin.disableClub}
      </Button>
    );
  }

  return (
    <Button size="sm" variant="secondary" disabled={pending} onClick={handleEnable}>
      {es.admin.enableClub}
    </Button>
  );
}
