import { prisma } from "@/lib/prisma";
import { getRuns } from "@/lib/runs";
import {
  MIN_QUERY_LENGTH,
  type SearchResultItem,
} from "@/types/search";

export { MIN_QUERY_LENGTH, type SearchResultItem } from "@/types/search";

const MAX_RUNS = 5;
const MAX_CLUBS = 5;

function formatRunSubtitle(startAt: string): string {
  const d = new Date(startAt);
  return d.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

async function searchClubsMinimal(query: string): Promise<SearchResultItem[]> {
  const clubs = await prisma.club.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      city: { select: { name: true } },
    },
    orderBy: { name: "asc" },
    take: MAX_CLUBS,
  });

  return clubs.map((club) => ({
    id: club.id,
    kind: "club" as const,
    title: club.name,
    subtitle: club.city.name,
    href: `/clubs/${club.slug}`,
  }));
}

export async function searchAll(query: string): Promise<SearchResultItem[]> {
  const trimmed = query.trim();
  if (trimmed.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const [{ items: runs }, clubs] = await Promise.all([
    getRuns({ q: trimmed }),
    searchClubsMinimal(trimmed),
  ]);

  const runItems: SearchResultItem[] = runs.slice(0, MAX_RUNS).map((run) => ({
    id: run.id,
    kind: "carrera" as const,
    title: run.title,
    subtitle: formatRunSubtitle(run.startAt),
    href: `/carreras/${run.slug}`,
  }));

  return [...runItems, ...clubs];
}
