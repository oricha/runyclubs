"use client";

import { useState } from "react";

import { resolveClubAwards, type ClubAwardDisplay } from "@/lib/awards";
import { es } from "@/lib/i18n/es";

import { AwardBadge } from "./AwardBadge";

interface AwardStackProps {
  awards: ClubAwardDisplay[];
  verified?: boolean;
  variant?: "compact" | "expanded";
}

export function AwardStack({
  awards,
  verified,
  variant = "compact",
}: AwardStackProps) {
  const resolved = resolveClubAwards(awards, verified);

  if (resolved.length === 0) {
    return null;
  }

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-1" aria-label="Premios del club">
        {resolved.map((award) => (
          <AwardBadge key={award.key} award={award} size="sm" />
        ))}
      </div>
    );
  }

  return <AwardStackExpanded awards={resolved} />;
}

function AwardStackExpanded({ awards }: { awards: ClubAwardDisplay[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-sm text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-expanded={open}
      >
        {open ? es.common.hideAwards : es.common.showAwards}
      </button>
      {open ? (
        <div className="mt-2 flex flex-col items-start gap-2">
          {awards.map((award) => (
            <AwardBadge key={award.key} award={award} size="md" showLabel />
          ))}
        </div>
      ) : null}
    </div>
  );
}
