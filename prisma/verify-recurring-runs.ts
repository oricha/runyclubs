import "dotenv/config";

import { generateRuns, summarizeWeekdays } from "../lib/recurring";
import { prisma } from "../lib/prisma";

async function main() {
  const recurringCount = await prisma.recurringRun.count({
    where: { active: true },
  });

  if (recurringCount === 0) {
    throw new Error(
      "No hay RecurringRun activas. Ejecuta primero: npx prisma db seed",
    );
  }

  const beforeCount = await prisma.run.count();
  const firstRun = await generateRuns();

  console.log("Primera ejecución:", firstRun);

  if (firstRun.runsCreated === 0 && beforeCount === 0) {
    throw new Error("No se creó ninguna Run en la primera ejecución");
  }

  const afterFirstCount = await prisma.run.count();

  if (afterFirstCount <= beforeCount) {
    throw new Error(
      `El conteo de Run no aumentó (${beforeCount} → ${afterFirstCount})`,
    );
  }

  const secondRun = await generateRuns();

  console.log("Segunda ejecución (idempotencia):", secondRun);

  if (secondRun.runsCreated !== 0) {
    throw new Error(
      `Idempotencia fallida: segunda ejecución creó ${secondRun.runsCreated} runs`,
    );
  }

  const afterSecondCount = await prisma.run.count();

  if (afterSecondCount !== afterFirstCount) {
    throw new Error(
      `Conteo inconsistente tras segunda ejecución (${afterFirstCount} → ${afterSecondCount})`,
    );
  }

  const sampleClub = await prisma.club.findFirst({
    where: { slug: "retiro-morning-crew" },
    include: {
      recurringRuns: { where: { active: true }, select: { weekday: true } },
    },
  });

  if (!sampleClub) {
    throw new Error("Club de ejemplo retiro-morning-crew no encontrado");
  }

  const summary = summarizeWeekdays(
    sampleClub.recurringRuns.map((run) => run.weekday),
  );

  console.log(`Resumen Retiro Morning Crew: "${summary}"`);

  if (summary !== "Cada martes y domingo") {
    throw new Error(`Resumen inesperado: "${summary}"`);
  }

  const emptySummary = summarizeWeekdays([]);
  if (emptySummary !== "Sin carreras programadas") {
    throw new Error(`Resumen vacío inesperado: "${emptySummary}"`);
  }

  console.log("Conteos finales:", {
    recurringRunsActivas: recurringCount,
    runsTotales: afterSecondCount,
    runsEsperadasAprox: `${recurringCount} × 20 semanas (menos ocurrencias pasadas hoy)`,
  });

  console.log("✓ Verificación de recurring-runs completada");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
