"use server";

import { PlanTier } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const PRICE_IDS: Record<"PRO" | "BUSINESS", string> = {
  PRO: process.env.STRIPE_PRO_PRICE_ID ?? "",
  BUSINESS: process.env.STRIPE_BUSINESS_PRICE_ID ?? "",
};

function appUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}

export async function createCheckoutSession(
  clubSlug: string,
  tier: "PRO" | "BUSINESS"
): Promise<{ url: string | null; error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const membership = await prisma.clubMember.findFirst({
    where: {
      club: { slug: clubSlug },
      userId: session.user.id,
      role: "OWNER",
    },
    include: { club: { include: { subscription: true } } },
  });

  if (!membership) {
    return { url: null, error: "Solo el fundador puede cambiar el plan." };
  }

  const club = membership.club;
  const priceId = PRICE_IDS[tier];
  if (!priceId) {
    return { url: null, error: "Plan no disponible." };
  }

  const stripe = getStripe();

  let customerId = club.subscription?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email ?? undefined,
      name: club.name,
      metadata: { clubId: club.id, clubSlug: club.slug },
    });
    customerId = customer.id;

    await prisma.subscription.upsert({
      where: { clubId: club.id },
      create: {
        clubId: club.id,
        tier: PlanTier.FREE,
        stripeCustomerId: customerId,
      },
      update: { stripeCustomerId: customerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl()}/cuenta?checkout=success&club=${clubSlug}`,
    cancel_url: `${appUrl()}/cuenta?checkout=canceled`,
    metadata: { clubId: club.id, clubSlug: club.slug, tier },
    subscription_data: {
      metadata: { clubId: club.id, tier },
    },
  });

  return { url: checkoutSession.url };
}

export async function createPortalSession(
  clubSlug: string
): Promise<{ url: string | null; error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const membership = await prisma.clubMember.findFirst({
    where: {
      club: { slug: clubSlug },
      userId: session.user.id,
      role: "OWNER",
    },
    include: { club: { include: { subscription: true } } },
  });

  if (!membership?.club.subscription?.stripeCustomerId) {
    return { url: null, error: "No hay suscripción activa." };
  }

  const stripe = getStripe();
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: membership.club.subscription.stripeCustomerId,
    return_url: `${appUrl()}/cuenta`,
  });

  return { url: portalSession.url };
}
