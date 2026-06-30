"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { generateRuns } from "@/lib/recurring";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireSuperAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/acceso?next=/admin");
  if (!session.user.isSuperAdmin) redirect("/");
  return session.user;
}

async function logAdminAction(
  actorId: string,
  action: string,
  targetId?: string | null,
  metadata?: Prisma.InputJsonValue,
) {
  await prisma.adminAuditLog.create({
    data: {
      actorId,
      action,
      targetId: targetId ?? null,
      metadata: metadata ?? undefined,
    },
  });
}

async function uniqueClubSlug(name: string): Promise<string> {
  const baseSlug = slugify(name.trim());
  let slug = baseSlug;
  let attempt = 0;

  while (await prisma.club.findUnique({ where: { slug }, select: { id: true } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  return slug;
}

export async function disableClub(clubId: string): Promise<void> {
  const actor = await requireSuperAdmin();

  await prisma.club.update({
    where: { id: clubId },
    data: { verified: false },
  });

  await logAdminAction(actor.id, "club.disable", clubId);
  revalidatePath("/admin");
  revalidatePath("/clubs");
}

export async function enableClub(clubId: string): Promise<void> {
  const actor = await requireSuperAdmin();

  await prisma.club.update({
    where: { id: clubId },
    data: { verified: true },
  });

  await logAdminAction(actor.id, "club.enable", clubId);
  revalidatePath("/admin");
  revalidatePath("/clubs");
}

export async function assignClubOwner(
  clubId: string,
  ownerEmail: string,
): Promise<{ error?: string }> {
  const actor = await requireSuperAdmin();
  const normalizedEmail = ownerEmail.trim().toLowerCase();

  const newOwner = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (!newOwner) {
    return { error: "Usuario no encontrado" };
  }

  await prisma.$transaction([
    prisma.club.update({
      where: { id: clubId },
      data: { ownerId: newOwner.id },
    }),
    prisma.clubMember.upsert({
      where: { clubId_userId: { clubId, userId: newOwner.id } },
      create: { clubId, userId: newOwner.id, role: "OWNER" },
      update: { role: "OWNER" },
    }),
  ]);

  await logAdminAction(actor.id, "club.assign_owner", clubId, {
    newOwnerEmail: normalizedEmail,
  });

  revalidatePath("/admin");
  revalidatePath("/clubs");
  return {};
}

export type CreateClubAsAdminInput = {
  name: string;
  citySlug: string;
  ownerEmail: string;
};

export async function createClubAsAdmin(
  data: CreateClubAsAdminInput,
): Promise<{ error?: string }> {
  const actor = await requireSuperAdmin();

  const name = data.name.trim();
  if (!name || name.length < 2) {
    return { error: "El nombre debe tener al menos 2 caracteres." };
  }

  const normalizedEmail = data.ownerEmail.trim().toLowerCase();
  const [city, owner] = await Promise.all([
    prisma.city.findUnique({
      where: { slug: data.citySlug },
      select: { id: true },
    }),
    prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    }),
  ]);

  if (!city) {
    return { error: "Ciudad no encontrada." };
  }
  if (!owner) {
    return { error: "Usuario no encontrado" };
  }

  const slug = await uniqueClubSlug(name);

  const club = await prisma.$transaction(async (tx) => {
    const created = await tx.club.create({
      data: {
        slug,
        name,
        description: "Pendiente de configuración.",
        cityId: city.id,
        ownerId: owner.id,
        verified: false,
      },
    });

    await tx.clubMember.create({
      data: {
        clubId: created.id,
        userId: owner.id,
        role: "OWNER",
      },
    });

    return created;
  });

  await logAdminAction(actor.id, "club.create", club.id);
  await generateRuns();

  revalidatePath("/admin");
  revalidatePath("/clubs");
  return {};
}
