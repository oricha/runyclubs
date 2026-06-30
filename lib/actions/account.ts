"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateUserName(name: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  const trimmed = name.trim();
  if (!trimmed || trimmed.length < 2) {
    return { error: "El nombre debe tener al menos 2 caracteres." };
  }
  if (trimmed.length > 80) {
    return { error: "El nombre no puede superar 80 caracteres." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: trimmed },
  });

  revalidatePath("/cuenta");
  return {};
}

export async function updateUserCity(city: string): Promise<{ error?: string }> {
  const session = await auth();
  if (!session?.user) redirect("/acceso");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { city: city || null },
  });

  revalidatePath("/cuenta");
  return {};
}
