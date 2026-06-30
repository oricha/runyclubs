"use client";

import { Check } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { joinRun, leaveRun } from "@/lib/actions/attendance";
import { es } from "@/lib/i18n/es";

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

export function JoinRunButton({
  runSlug,
  userId,
  isAttending,
}: {
  runSlug: string;
  userId: string | null;
  isAttending: boolean;
}) {
  const loginHref = `/acceso?next=/carreras/${runSlug}`;

  if (!userId) {
    return (
      <Button className="w-full" asChild>
        <a href={loginHref}>{es.runDetail.joinRun}</a>
      </Button>
    );
  }

  if (isAttending) {
    const leaveAction = leaveRun.bind(null, runSlug);
    return (
      <form action={leaveAction}>
        <SubmitButton
          label={es.common.going}
          variant="outline"
          icon={<Check className="h-4 w-4" />}
        />
      </form>
    );
  }

  const joinAction = joinRun.bind(null, runSlug);
  return (
    <form action={joinAction}>
      <SubmitButton label={es.runDetail.joinRun} />
    </form>
  );
}
