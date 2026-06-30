import Link from "next/link";

import { AwardStack } from "@/components/club/AwardStack";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPaceLabel } from "@/lib/pace-labels";
import type { Pace } from "@/types";

type CityClubCardProps = {
  slug: string;
  name: string;
  logoUrl: string | null;
  pace: Pace;
  frequency: number;
  verified: boolean;
  awards: { key: string; icon: string; label: string }[];
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function CityClubCard({
  slug,
  name,
  logoUrl,
  pace,
  frequency,
  verified,
  awards,
}: CityClubCardProps) {
  return (
    <Link
      href={`/clubs/${slug}`}
      className="relative flex gap-4 rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
    >
      <div className="absolute right-3 top-3">
        <AwardStack awards={awards} verified={verified} variant="compact" />
      </div>
      <Avatar className="h-12 w-12 shrink-0">
        {logoUrl ? <AvatarImage src={logoUrl} alt={name} /> : null}
        <AvatarFallback className="bg-muted text-sm font-medium">
          {getInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1 pr-16">
        <h3 className="truncate font-medium">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {getPaceLabel(pace)} · {frequency}x/semana
        </p>
      </div>
    </Link>
  );
}
