import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginPanel } from "./LoginPanel";

function resolveRedirectTo(params: {
  next?: string;
  callbackUrl?: string;
}): string {
  const candidate = params.next ?? params.callbackUrl ?? "/";
  if (candidate.startsWith("/") && !candidate.startsWith("//")) {
    return candidate;
  }
  return "/";
}

export default async function AccesoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const redirectTo = resolveRedirectTo(params);
  const session = await auth();

  if (session?.user) {
    redirect(redirectTo);
  }

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-brand px-4 py-16 text-primary-foreground">
      <LoginPanel redirectTo={redirectTo} />
    </div>
  );
}
