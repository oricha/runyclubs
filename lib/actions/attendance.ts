"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function joinRun(runSlug: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/acceso?next=/carreras/${runSlug}`);
  }

  const run = await prisma.run.findUnique({
    where: { slug: runSlug },
    select: { id: true },
  });
  if (!run) return;

  await prisma.runAttendee.upsert({
    where: { runId_userId: { runId: run.id, userId: session.user.id } },
    create: { runId: run.id, userId: session.user.id },
    update: {},
  });

  revalidatePath(`/carreras/${runSlug}`);
}

export async function leaveRun(runSlug: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/acceso?next=/carreras/${runSlug}`);
  }

  const run = await prisma.run.findUnique({
    where: { slug: runSlug },
    select: { id: true },
  });
  if (!run) return;

  await prisma.runAttendee.deleteMany({
    where: { runId: run.id, userId: session.user.id },
  });

  revalidatePath(`/carreras/${runSlug}`);
}

export async function joinClub(clubSlug: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/acceso?next=/clubs/${clubSlug}`);
  }

  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: { id: true },
  });
  if (!club) return;

  await prisma.clubMember.upsert({
    where: { clubId_userId: { clubId: club.id, userId: session.user.id } },
    create: { clubId: club.id, userId: session.user.id, role: "MEMBER" },
    update: {},
  });

  revalidatePath(`/clubs/${clubSlug}`);
}

export async function leaveClub(clubSlug: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/acceso?next=/clubs/${clubSlug}`);
  }

  const club = await prisma.club.findUnique({
    where: { slug: clubSlug },
    select: { id: true },
  });
  if (!club) return;

  await prisma.clubMember.deleteMany({
    where: { clubId: club.id, userId: session.user.id },
  });

  revalidatePath(`/clubs/${clubSlug}`);
}
