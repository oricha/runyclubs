"use server";

import type { Pace } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { generateRuns } from "@/lib/recurring";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

import type { RecurrenciaInput } from "./types";

export type CreateClubInput = {
  name: string;
  citySlug: string;
  description: string;
  pace: string;
  typeIds: string[];
  recurrencias: RecurrenciaInput[];
  logoUrl?: string;
  coverUrl?: string;
  instagramUrl?: string;
  stravaUrl?: string;
  website?: string;
};

export type CreateClubResult =
  | { success: true; slug: string }
  | { success: false; error: string };

const TIME_REGEX = /^\d{2}:\d{2}$/;

function isValidOptionalUrl(value?: string): boolean {
  if (!value?.trim()) return true;
  const trimmed = value.trim();
  if (!/^https?:\/\//.test(trimmed)) return false;
  try {
    return URL.canParse(trimmed);
  } catch {
    return false;
  }
}

function validateInput(input: CreateClubInput): string | null {
  if (!input.name?.trim() || input.name.trim().length < 2) {
    return "El nombre del club es obligatorio (mínimo 2 caracteres).";
  }
  if (!input.description?.trim() || input.description.trim().length < 20) {
    return "La descripción debe tener al menos 20 caracteres.";
  }
  if (!input.citySlug) {
    return "Debes seleccionar una ciudad.";
  }
  if (!input.recurrencias?.length) {
    return "Añade al menos una carrera recurrente.";
  }

  for (const r of input.recurrencias) {
    if (!r.title?.trim()) {
      return "El nombre de la salida es obligatorio.";
    }
    if (!r.location?.trim()) {
      return "El lugar de encuentro es obligatorio.";
    }
    if (r.weekday < 0 || r.weekday > 6) {
      return "Día de la semana no válido.";
    }
    if (!TIME_REGEX.test(r.time)) {
      return "Introduce la hora en formato HH:MM.";
    }
  }

  if (!isValidOptionalUrl(input.logoUrl)) {
    return "Introduce una URL válida (debe empezar por https://).";
  }
  if (!isValidOptionalUrl(input.coverUrl)) {
    return "Introduce una URL válida (debe empezar por https://).";
  }
  if (!isValidOptionalUrl(input.instagramUrl)) {
    return "Introduce una URL válida (debe empezar por https://).";
  }
  if (!isValidOptionalUrl(input.stravaUrl)) {
    return "Introduce una URL válida (debe empezar por https://).";
  }
  if (!isValidOptionalUrl(input.website)) {
    return "Introduce una URL válida (debe empezar por https://).";
  }

  return null;
}

export async function createClub(input: CreateClubInput): Promise<CreateClubResult> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/acceso?next=/onboarding/club");
  }

  const userId = session.user.id;
  const validationError = validateInput(input);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const baseSlug = slugify(input.name.trim());
  let slug = baseSlug;
  let attempt = 0;

  while (await prisma.club.findUnique({ where: { slug }, select: { id: true } })) {
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  try {
    const club = await prisma.$transaction(async (tx) => {
      const city = await tx.city.findUnique({
        where: { slug: input.citySlug },
        select: { id: true },
      });
      if (!city) {
        throw new Error("Ciudad no encontrada");
      }

      const created = await tx.club.create({
        data: {
          slug,
          name: input.name.trim(),
          description: input.description.trim(),
          cityId: city.id,
          pace: input.pace as Pace,
          frequency: input.recurrencias.length,
          ownerId: userId,
          usesPlatform: true,
          verified: false,
          instagramUrl: input.instagramUrl?.trim() || null,
          stravaUrl: input.stravaUrl?.trim() || null,
          website: input.website?.trim() || null,
          logoUrl: input.logoUrl?.trim() || null,
          coverUrl: input.coverUrl?.trim() || null,
        },
      });

      if (input.typeIds.length > 0) {
        const tags = await tx.runTypeTag.findMany({
          where: { key: { in: input.typeIds } },
          select: { id: true },
        });
        if (tags.length > 0) {
          await tx.clubType.createMany({
            data: tags.map((tag) => ({ clubId: created.id, typeId: tag.id })),
            skipDuplicates: true,
          });
        }
      }

      for (const r of input.recurrencias) {
        await tx.recurringRun.create({
          data: {
            clubId: created.id,
            title: r.title.trim(),
            weekday: r.weekday,
            time: r.time,
            location: r.location.trim(),
            distanceKm: r.distanceKm ? parseFloat(r.distanceKm) : null,
            pace: r.pace?.trim() || null,
            types: r.typeIds,
            active: true,
          },
        });
      }

      await tx.clubMember.create({
        data: { clubId: created.id, userId, role: "OWNER" },
      });

      return created;
    });

    try {
      await generateRuns();
    } catch {
      // No bloqueante — el cron generará runs más tarde
    }

    revalidatePath("/clubs");
    revalidatePath(`/clubs/${club.slug}`);

    return { success: true, slug: club.slug };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al crear el club.";
    return { success: false, error: message };
  }
}
