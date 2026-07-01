import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { AssignOwnerForm } from "@/components/admin/AssignOwnerForm";
import { ClubVerifiedToggle } from "@/components/admin/ClubVerifiedToggle";
import { CreateClubForm } from "@/components/admin/CreateClubForm";
import { Container } from "@/components/common/Container";
import { SectionLabel } from "@/components/common/SectionLabel";
import { auth } from "@/auth";
import { es } from "@/lib/i18n/es";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${es.admin.title} | RunClubs.es`,
  robots: { index: false, follow: false },
};

const ACTION_LABELS: Record<string, string> = {
  "club.create": es.admin.actionCreate,
  "club.disable": es.admin.actionDisable,
  "club.enable": es.admin.actionEnable,
  "club.assign_owner": es.admin.actionAssignOwner,
};

type AuditLogEntry = Prisma.AdminAuditLogGetPayload<{
  include: { actor: { select: { email: true } } };
}>;

function formatAuditDate(date: Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/acceso?next=/admin");
  if (!session.user.isSuperAdmin) redirect("/");

  const [clubs, auditLog] = await Promise.all([
    prisma.club.findMany({
      include: {
        city: { select: { name: true } },
        owner: { select: { email: true, name: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.adminAuditLog.findMany({
      take: 50,
      include: { actor: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const targetIds = auditLog
    .map((entry: AuditLogEntry) => entry.targetId)
    .filter((id): id is string => Boolean(id));
  const targetClubs =
    targetIds.length > 0
      ? await prisma.club.findMany({
          where: { id: { in: targetIds } },
          select: { id: true, name: true },
        })
      : [];
  const clubNameById = new Map(targetClubs.map((c) => [c.id, c.name]));

  return (
    <Container className="py-10">
      <SectionLabel as="p" className="mb-2">
        {es.admin.title}
      </SectionLabel>
      <h1 className="font-serif text-3xl tracking-tight">{es.admin.heading}</h1>

      <section className="mt-10">
        <h2 className="font-serif text-xl">{es.admin.clubsSection}</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 font-medium">{es.admin.colName}</th>
                <th className="px-4 py-3 font-medium">{es.admin.colCity}</th>
                <th className="px-4 py-3 font-medium">{es.admin.colOwner}</th>
                <th className="px-4 py-3 font-medium">{es.admin.colVerified}</th>
                <th className="px-4 py-3 font-medium">{es.admin.colMembers}</th>
                <th className="px-4 py-3 font-medium">{es.admin.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium">{club.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{club.city.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {club.owner.email}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        club.verified
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-muted text-muted-foreground",
                      )}
                      title={club.verified ? es.admin.verifiedYes : es.admin.verifiedNo}
                    >
                      {club.verified ? "✓" : "✗"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{club._count.members}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-3">
                      <AssignOwnerForm clubId={club.id} />
                      <ClubVerifiedToggle clubId={club.id} verified={club.verified} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl">{es.admin.createSection}</h2>
        <div className="mt-4">
          <CreateClubForm />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl">{es.admin.auditSection}</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 font-medium">{es.admin.colDate}</th>
                <th className="px-4 py-3 font-medium">{es.admin.colActor}</th>
                <th className="px-4 py-3 font-medium">{es.admin.colAction}</th>
                <th className="px-4 py-3 font-medium">{es.admin.colTarget}</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    {es.admin.auditEmpty}
                  </td>
                </tr>
              ) : (
                auditLog.map((entry: AuditLogEntry) => (
                  <tr key={entry.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatAuditDate(entry.createdAt)}
                    </td>
                    <td className="px-4 py-3">{entry.actor.email}</td>
                    <td className="px-4 py-3">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {entry.targetId
                        ? (clubNameById.get(entry.targetId) ?? entry.targetId)
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </Container>
  );
}
