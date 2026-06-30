"use client";

import { Check } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { joinClub, leaveClub } from "@/lib/actions/attendance";
import { es } from "@/lib/i18n/es";

/**
 * Integración en ficha de club: `club-detail` debe pasar
 * `clubSlug`, `userId={session?.user?.id ?? null}` e `isMember` (query ClubMember).
 *
 * Ejemplo en `app/clubs/[slug]/page.tsx`:
 * ```tsx
 * <JoinClubButton
 *   clubSlug={club.slug}
 *   userId={session?.user?.id ?? null}
 *   isMember={isMember}
 * />
 * ```
 */
function SubmitButton({
  label,
  variant,
  icon,
}: {
  label: string;
  variant?: "outline";
  icon?: React.ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" variant={variant} disabled={pending}>
      {pending ? (
        "…"
      ) : (
        <>
          {label}
          {icon}
        </>
      )}
    </Button>
  );
}

export function JoinClubButton({
  clubSlug,
  userId,
  isMember,
}: {
  clubSlug: string;
  userId: string | null;
  isMember: boolean;
}) {
  const loginHref = `/acceso?next=/clubs/${clubSlug}`;

  if (!userId) {
    return (
      <Button className="w-full" asChild>
        <a href={loginHref}>{es.clubDetail.joinClub}</a>
      </Button>
    );
  }

  if (isMember) {
    const leaveAction = leaveClub.bind(null, clubSlug);
    return (
      <form action={leaveAction}>
        <SubmitButton
          label={es.clubDetail.isMember}
          variant="outline"
          icon={<Check className="h-4 w-4" />}
        />
      </form>
    );
  }

  const joinAction = joinClub.bind(null, clubSlug);
  return (
    <form action={joinAction}>
      <SubmitButton label={es.clubDetail.joinClub} />
    </form>
  );
}
