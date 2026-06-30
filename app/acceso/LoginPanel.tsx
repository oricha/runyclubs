"use client";

import { useState } from "react";
import { Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { es } from "@/lib/i18n/es";
import { signInWithEmail, signInWithGoogle } from "./actions";

export function LoginPanel({ redirectTo }: { redirectTo: string }) {
  const [showEmailForm, setShowEmailForm] = useState(false);

  return (
    <div className="mx-auto w-full max-w-md animate-fade-in px-4">
      <div className="rounded-2xl border border-border/20 bg-card p-8 shadow-xl">
        <h1 className="font-serif text-3xl text-foreground">{es.auth.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{es.auth.subtitle}</p>

        <form action={signInWithGoogle} className="mt-8">
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button type="submit" className="w-full" variant="default">
            {es.auth.continueWithGoogle}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {es.auth.or}
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {!showEmailForm ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setShowEmailForm(true)}
          >
            <Mail className="mr-2 h-4 w-4" />
            {es.auth.continueWithEmail}
          </Button>
        ) : (
          <form action={signInWithEmail} className="space-y-3">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <Input
              type="email"
              name="email"
              required
              autoFocus
              placeholder={es.auth.emailPlaceholder}
              aria-label={es.auth.emailPlaceholder}
            />
            <Button type="submit" className="w-full">
              {es.auth.sendMagicLink}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
