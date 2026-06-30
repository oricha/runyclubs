import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const WEEKDAY_NAMES: Record<number, string> = {
  0: "domingo",
  1: "lunes",
  2: "martes",
  3: "miércoles",
  4: "jueves",
  5: "viernes",
  6: "sábado",
};

/** Orden natural de semana en español: lunes → domingo. */
const SPANISH_WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0] as const;

export type GenerateRunsResult = {
  recurringRunsProcessed: number;
  runsCreated: number;
};

/** Calcula la fecha del weekday indicado, desplazada `addWeeks` semanas desde `from`. */
export function nextWeekday(from: Date, weekday: number, addWeeks: number): Date {
  const date = new Date(from);
  const diff = (weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + diff + addWeeks * 7);
  return date;
}

/**
 * Resume en español los días de la semana de recurrencias activas.
 * Ej.: "Cada miércoles y domingo".
 */
export function summarizeWeekdays(weekdays: number[]): string {
  const unique = [...new Set(weekdays)];

  if (unique.length === 0) {
    return "Sin carreras programadas";
  }

  const sorted = SPANISH_WEEK_ORDER.filter((day) => unique.includes(day)).map(
    (day) => WEEKDAY_NAMES[day],
  );

  if (sorted.length === 1) {
    return `Cada ${sorted[0]}`;
  }

  const last = sorted[sorted.length - 1];
  const rest = sorted.slice(0, -1).join(", ");
  return `Cada ${rest} y ${last}`;
}

/** Genera instancias Run para las próximas `weeksAhead` semanas (idempotente). */
export async function generateRuns(
  weeksAhead = 20,
): Promise<GenerateRunsResult> {
  const recurring = await prisma.recurringRun.findMany({
    where: { active: true },
  });
  const today = new Date();
  let runsCreated = 0;

  for (const recurringRun of recurring) {
    for (let week = 0; week < weeksAhead; week++) {
      const date = nextWeekday(today, recurringRun.weekday, week);
      const [hours, minutes] = recurringRun.time.split(":").map(Number);
      date.setHours(hours, minutes, 0, 0);

      if (date < today) {
        continue;
      }

      const slug = `${slugify(recurringRun.title)}-${date.toISOString().slice(0, 10)}`;
      const existing = await prisma.run.findUnique({
        where: { slug },
        select: { id: true },
      });

      await prisma.run.upsert({
        where: { slug },
        update: {},
        create: {
          slug,
          clubId: recurringRun.clubId,
          recurringRunId: recurringRun.id,
          title: recurringRun.title,
          description: recurringRun.description ?? undefined,
          startAt: date,
          location: recurringRun.location,
          lat: recurringRun.lat,
          lng: recurringRun.lng,
          distanceKm: recurringRun.distanceKm,
          pace: recurringRun.pace,
          status: "SCHEDULED",
          types: {
            create: recurringRun.types.map((key) => ({
              type: { connect: { key } },
            })),
          },
        },
      });

      if (!existing) {
        runsCreated++;
      }
    }
  }

  return {
    recurringRunsProcessed: recurring.length,
    runsCreated,
  };
}
