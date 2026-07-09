"use server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactResult = {
  success: boolean;
  error?: string;
};

function getContactConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.CONTACT_EMAIL;

  if (!apiKey || !from || !to) {
    return null;
  }

  return { apiKey, from, to };
}

async function sendContactEmail(params: {
  subject: string;
  body: string;
  replyTo?: string;
}): Promise<ContactResult> {
  const config = getContactConfig();

  if (!config) {
    console.error("Contact email: missing RESEND_API_KEY, EMAIL_FROM or CONTACT_EMAIL");
    return {
      success: false,
      error: "El servicio de contacto no está disponible. Inténtalo más tarde.",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: config.from,
        to: config.to,
        reply_to: params.replyTo,
        subject: params.subject,
        text: params.body,
      }),
    });

    if (!res.ok) {
      console.error("Resend contact error:", res.status);
      return {
        success: false,
        error: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Contact email error:", error);
    return {
      success: false,
      error: "No se pudo enviar el mensaje. Inténtalo de nuevo.",
    };
  }
}

export type CollaborationFormData = {
  company: string;
  contactName: string;
  email: string;
  area?: string;
  message: string;
};

export async function sendCollaborationEmail(
  data: CollaborationFormData
): Promise<ContactResult> {
  const company = data.company?.trim();
  const contactName = data.contactName?.trim();
  const email = data.email?.trim().toLowerCase();
  const message = data.message?.trim();
  const area = data.area?.trim();

  if (!company || !contactName || !email || !message) {
    return { success: false, error: "Completa todos los campos obligatorios." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Introduce un email válido." };
  }

  const body = [
    "Nueva solicitud de colaboración — RunClubs.es",
    "",
    `Empresa: ${company}`,
    `Contacto: ${contactName}`,
    `Email: ${email}`,
    area ? `Área: ${area}` : null,
    "",
    "Mensaje:",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return sendContactEmail({
    subject: `[Colaboraciones] ${company}`,
    body,
    replyTo: email,
  });
}

export const AD_TYPES = ["banner", "race_sponsorship", "newsletter", "other"] as const;
export type AdType = (typeof AD_TYPES)[number];

export const AD_TYPE_LABELS: Record<AdType, string> = {
  banner: "Banner",
  race_sponsorship: "Patrocinio de carrera",
  newsletter: "Newsletter",
  other: "Otro",
};

export type AdvertiseFormData = {
  company: string;
  contactName: string;
  email: string;
  adType: AdType;
  budget?: string;
  message: string;
};

export async function sendAdvertiseEmail(data: AdvertiseFormData): Promise<ContactResult> {
  const company = data.company?.trim();
  const contactName = data.contactName?.trim();
  const email = data.email?.trim().toLowerCase();
  const message = data.message?.trim();
  const budget = data.budget?.trim();
  const adType = data.adType;

  if (!company || !contactName || !email || !message || !adType) {
    return { success: false, error: "Completa todos los campos obligatorios." };
  }

  if (!AD_TYPES.includes(adType)) {
    return { success: false, error: "Selecciona un tipo de anuncio válido." };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: "Introduce un email válido." };
  }

  const body = [
    "Nueva solicitud publicitaria — RunClubs.es",
    "",
    `Empresa: ${company}`,
    `Contacto: ${contactName}`,
    `Email: ${email}`,
    `Tipo de anuncio: ${AD_TYPE_LABELS[adType]}`,
    budget ? `Presupuesto: ${budget}` : null,
    "",
    "Mensaje:",
    message,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return sendContactEmail({
    subject: `[Publicidad] ${company} — ${AD_TYPE_LABELS[adType]}`,
    body,
    replyTo: email,
  });
}
