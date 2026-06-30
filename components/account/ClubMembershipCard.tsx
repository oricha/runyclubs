import Link from "next/link";
import type { MemberRole } from "@prisma/client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { es } from "@/lib/i18n/es";

type ClubMembershipCardProps = {
  slug: string;
  name: string;
  logoUrl: string | null;
  cityName: string;
  role: MemberRole;
};

function getClubInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function ClubMembershipCard({
  slug,
  name,
  logoUrl,
  cityName,
  role,
}: ClubMembershipCardProps) {
  return (
    <Link
      href={`/clubs/${slug}`}
      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:shadow-md"
    >
      <Avatar className="h-12 w-12 shrink-0">
        {logoUrl ? <AvatarImage src={logoUrl} alt={name} /> : null}
        <AvatarFallback className="bg-muted text-sm font-medium">
          {getClubInitials(name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-medium">{name}</h3>
          {role === "OWNER" ? (
            <Badge variant="secondary">{es.account.ownerBadge}</Badge>
          ) : role === "ADMIN" ? (
            <Badge variant="outline">{es.account.adminBadge}</Badge>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{cityName}</p>
      </div>
    </Link>
  );
}
