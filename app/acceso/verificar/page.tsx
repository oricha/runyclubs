import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { es } from "@/lib/i18n/es";

export default function VerificarPage() {
  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center bg-brand px-4 py-16">
      <div className="mx-auto w-full max-w-md animate-fade-in rounded-2xl border border-border/20 bg-card p-8 text-center shadow-xl">
        <MailCheck className="mx-auto h-10 w-10 text-primary" aria-hidden />
        <h1 className="mt-4 font-serif text-2xl text-foreground">{es.auth.checkYourInbox}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{es.auth.emailSent}</p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/acceso">{es.auth.backToLogin}</Link>
        </Button>
      </div>
    </div>
  );
}
