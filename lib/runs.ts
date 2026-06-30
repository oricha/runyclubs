import { prisma } from "@/lib/prisma";
import type {
  ClubSummary,
  Pace,
  RunDetail,
  RunFilters,
  RunSummary,
  RunTypeTag,
} from "@/types";

export { PACE_LABELS, getPaceLabel } from "@/lib/pace-labels";

const MAX_RESULTS = 200;

const runInclude = {
  club: true,
  types: { include: { type: true } },
  _count: { select: { attendees: true } },
} as const;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function mapClubToSummaryForRun(club: {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  pace: Pace;
  frequency: number;
  verified: boolean;
  city: { name: string };
  types: { type: { key: string; emoji: string; label: string } }[];
  awards: { key: string; icon: string; label: string }[];
}): ClubSummary {
  return {
    id: club.id,
    slug: club.slug,
    name: club.name,
    city: club.city.name,
    logoUrl: club.logoUrl ?? undefined,
    pace: club.pace,
    frequency: club.frequency,
    verified: club.verified,
    types: club.types.map(({ type }) => ({
      key: type.key,
      emoji: type.emoji,
      label: type.label,
    })),
    awards: club.awards.map((a) => ({
      key: a.key,
      icon: a.icon,
      label: a.label,
    })),
  };
}

function mapRunToSummary(run: {
  id: string;
  slug: string;
  title: string;
  startAt: Date;
  location: string;
  distanceKm: number | null;
  pace: string | null;
  signupType: string;
  externalSignupUrl: string | null;
  organizerName: string | null;
  organizerRole: string | null;
  priceCents: number | null;
  club: { name: string; logoUrl: string | null; slug: string };
  types: { type: { key: string; emoji: string; label: string } }[];
  _count: { attendees: number };
}): RunSummary {
  const types: RunTypeTag[] = run.types.map(({ type }) => ({
    key: type.key,
    emoji: type.emoji,
    label: type.label,
  }));

  return {
    id: run.id,
    slug: run.slug,
    title: run.title,
    startAt: run.startAt.toISOString(),
    location: run.location,
    club: {
      name: run.club.name,
      logoUrl: run.club.logoUrl ?? undefined,
      slug: run.club.slug,
    },
    distanceKm: run.distanceKm ?? undefined,
    pace: run.pace ?? undefined,
    types,
    attendeeCount: run._count.attendees,
    signupType: run.signupType as "internal" | "external",
    externalSignupUrl: run.externalSignupUrl ?? undefined,
    organizerName: run.organizerName ?? undefined,
    organizerRole: run.organizerRole ?? undefined,
    priceCents: run.priceCents,
  };
}

function getDateUpperBound(dateRange: "week" | "month", now: Date): Date {
  const upper = new Date(now);
  if (dateRange === "week") {
    upper.setDate(now.getDate() + 7);
  } else {
    upper.setMonth(now.getMonth() + 1);
  }
  return upper;
}

export async function getRuns(
  filters: RunFilters = {},
): Promise<{ count: number; items: RunSummary[] }> {
  const now = new Date();

  const clubFilter = {
    ...(filters.city ? { city: { slug: filters.city } } : {}),
    ...(filters.pace?.length ? { pace: { in: filters.pace } } : {}),
  };

  const runs = await prisma.run.findMany({
    where: {
      status: "SCHEDULED",
      startAt: {
        gte: now,
        ...(filters.dateRange
          ? { lte: getDateUpperBound(filters.dateRange, now) }
          : {}),
      },
      ...(Object.keys(clubFilter).length ? { club: clubFilter } : {}),
      ...(filters.types?.length
        ? {
            types: {
              some: { type: { key: { in: filters.types } } },
            },
          }
        : {}),
      ...(filters.q
        ? {
            OR: [
              { title: { contains: filters.q, mode: "insensitive" } },
              { location: { contains: filters.q, mode: "insensitive" } },
              {
                club: {
                  name: { contains: filters.q, mode: "insensitive" },
                },
              },
            ],
          }
        : {}),
    },
    include: runInclude,
    orderBy: { startAt: "asc" },
    take: MAX_RESULTS,
  });

  let filtered = runs;

  if (filters.weekday?.length) {
    filtered = runs.filter((run) =>
      filters.weekday!.includes(run.startAt.getDay()),
    );
  }

  const items = filtered.map(mapRunToSummary);

  return { count: items.length, items };
}

export async function getRunBySlug(slug: string): Promise<RunDetail | null> {
  const now = new Date();

  const run = await prisma.run.findFirst({
    where: {
      slug,
      status: "SCHEDULED",
      startAt: { gte: now },
    },
    include: {
      club: {
        include: {
          city: true,
          types: { include: { type: true } },
          awards: true,
        },
      },
      types: { include: { type: true } },
      attendees: {
        include: { user: { select: { image: true } } },
        orderBy: { joinedAt: "asc" },
        take: 12,
      },
      _count: { select: { attendees: true } },
    },
  });

  if (!run) return null;

  const summary = mapRunToSummary(run);
  const club = mapClubToSummaryForRun(run.club);

  return {
    ...summary,
    description: run.description ?? undefined,
    attendeeAvatars: run.attendees
      .map((a) => a.user.image)
      .filter((url): url is string => Boolean(url)),
    club,
  };
}

export async function getRunsAroundDate(
  date: Date,
  excludeRunId: string,
  take = 3,
): Promise<RunSummary[]> {
  const now = new Date();
  const from = addDays(date, -3);
  const lowerBound = from > now ? from : now;

  const runs = await prisma.run.findMany({
    where: {
      id: { not: excludeRunId },
      status: "SCHEDULED",
      startAt: {
        gte: lowerBound,
        lte: addDays(date, 3),
      },
    },
    include: runInclude,
    orderBy: { startAt: "asc" },
    take,
  });

  return runs.map(mapRunToSummary);
}

/** Parsea query params de URL/API a RunFilters. */
export function parseRunFilters(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): RunFilters {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) {
      return params.get(key);
    }
    const value = params[key];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  const getAll = (key: string): string[] => {
    if (params instanceof URLSearchParams) {
      return params.getAll(key);
    }
    const value = params[key];
    if (Array.isArray(value)) return value.filter(Boolean) as string[];
    return value ? [value] : [];
  };

  const date = get("date");
  const dateRange =
    date === "week" || date === "month" ? date : undefined;

  const weekday = getAll("weekday")
    .map(Number)
    .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6);

  const pace = getAll("pace").filter((p): p is Pace =>
    ["ALL_PACES", "BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(p),
  );

  const types = getAll("types");
  const city = get("city") ?? undefined;
  const q = get("q") ?? undefined;

  return {
    ...(city ? { city } : {}),
    ...(types.length ? { types } : {}),
    ...(pace.length ? { pace } : {}),
    ...(weekday.length ? { weekday } : {}),
    ...(dateRange ? { dateRange } : {}),
    ...(q ? { q } : {}),
  };
}
