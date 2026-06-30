"use server";

import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SubscribeResult = {
  success: boolean;
  alreadySubscribed: boolean;
  error?: string;
};

// Rate limiting: no implementado en app — añadir en infra (Vercel Firewall / edge) en producción.

export async function subscribeToNewsletter(email: string): Promise<SubscribeResult> {
  const normalized = email.trim().toLowerCase();

  if (!normalized || !EMAIL_REGEX.test(normalized)) {
    return {
      success: false,
      alreadySubscribed: false,
      error: "Introduce un email válido.",
    };
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: normalized },
      select: { id: true },
    });

    await prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      create: { email: normalized },
      update: {},
    });

    return {
      success: true,
      alreadySubscribed: Boolean(existing),
    };
  } catch {
    return {
      success: false,
      alreadySubscribed: false,
      error: "No se pudo completar la suscripción. Inténtalo de nuevo.",
    };
  }
}
