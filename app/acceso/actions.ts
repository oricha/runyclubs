"use server";

import { signIn } from "@/auth";

export async function signInWithGoogle(formData: FormData) {
  const redirectTo = sanitizeRedirect(formData.get("redirectTo"));
  await signIn("google", { redirectTo });
}

export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.trim()) {
    return;
  }
  const redirectTo = sanitizeRedirect(formData.get("redirectTo"));
  await signIn("resend", { email: email.trim(), redirectTo });
}

function sanitizeRedirect(value: FormDataEntryValue | null): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}
