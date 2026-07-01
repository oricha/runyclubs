"use client";

import { useState, useTransition } from "react";

import { createCheckoutSession, createPortalSession } from "@/lib/actions/billing";
import { es } from "@/lib/i18n/es";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PlanTier = "FREE" | "PRO" | "BUSINESS";

type UpgradeClubCardProps = {
  clubSlug: string;
  clubName: string;
  tier: PlanTier;
};

export function UpgradeClubCard({ clubSlug, clubName, tier }: UpgradeClubCardProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isFree = tier === "FREE" || tier === undefined;

  function handleUpgrade() {
    setError(null);
    startTransition(async () => {
      const result = await createCheckoutSession(clubSlug, "PRO");
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  function handleManage() {
    setError(null);
    startTransition(async () => {
      const result = await createPortalSession(clubSlug);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
      }
    });
  }

  const planLabel =
    tier === "BUSINESS"
      ? es.billing.plans.business
      : tier === "PRO"
        ? es.billing.plans.pro
        : es.billing.plans.free;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{clubName}</CardTitle>
        <CardDescription>
          {es.billing.currentPlan}: <strong>{planLabel}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isFree ? (
          <p className="text-sm text-muted-foreground">{es.billing.upgradeSubtitle}</p>
        ) : (
          <p className="text-sm text-muted-foreground">{es.billing.cancelAnytime}</p>
        )}
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      </CardContent>
      <CardFooter>
        {isFree ? (
          <Button type="button" disabled={isPending} onClick={handleUpgrade}>
            {isPending ? "…" : es.billing.upgradeCta}
          </Button>
        ) : (
          <Button type="button" variant="outline" disabled={isPending} onClick={handleManage}>
            {isPending ? "…" : es.billing.managePlan}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
