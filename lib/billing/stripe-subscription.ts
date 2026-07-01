import type Stripe from "stripe";

/** Stripe API 2026+ exposes period end on subscription items, not the root object. */
export function getSubscriptionPeriodEnd(sub: Stripe.Subscription): Date | null {
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  if (typeof periodEnd === "number") {
    return new Date(periodEnd * 1000);
  }
  return null;
}
