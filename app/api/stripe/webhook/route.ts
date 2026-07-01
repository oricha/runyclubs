import { PlanTier } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSubscriptionPeriodEnd } from "@/lib/billing/stripe-subscription";
import { getStripe } from "@/lib/stripe";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

function parseTier(value: string | undefined): PlanTier | null {
  if (value === "PRO" || value === "BUSINESS") {
    return value;
  }
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { clubId, tier: tierRaw } = session.metadata ?? {};
      const tier = parseTier(tierRaw);

      if (!clubId || !tier || !session.subscription) {
        break;
      }

      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      const stripeSub = await stripe.subscriptions.retrieve(subId);
      const customerId =
        typeof session.customer === "string" ? session.customer : session.customer?.id;
      const periodEnd = getSubscriptionPeriodEnd(stripeSub);

      await prisma.subscription.upsert({
        where: { clubId },
        create: {
          clubId,
          tier,
          stripeCustomerId: customerId ?? undefined,
          stripeSubId: subId,
          status: "active",
          currentPeriodEnd: periodEnd,
        },
        update: {
          tier,
          stripeCustomerId: customerId ?? undefined,
          stripeSubId: subId,
          status: "active",
          currentPeriodEnd: periodEnd,
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;

      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: {
          status: sub.status,
          currentPeriodEnd: getSubscriptionPeriodEnd(sub),
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;

      await prisma.subscription.updateMany({
        where: { stripeSubId: sub.id },
        data: { status: "canceled", tier: PlanTier.FREE },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
