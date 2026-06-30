import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  const [cityCount, typeCount, clubCount, awardCount, recurringCount] =
    await Promise.all([
      prisma.city.count(),
      prisma.runTypeTag.count(),
      prisma.club.count(),
      prisma.clubAward.count(),
      prisma.recurringRun.count(),
    ]);

  console.log("Conteos:", {
    cities: cityCount,
    types: typeCount,
    clubs: clubCount,
    awards: awardCount,
    recurringRuns: recurringCount,
  });

  if (cityCount !== 20 || typeCount !== 11 || clubCount !== 20) {
    throw new Error("Conteos incorrectos tras el seed");
  }

  if (awardCount < 1 || recurringCount < 20) {
    throw new Error("Faltan awards o recurring runs en el seed");
  }

  const clubs = await prisma.club.findMany({
    include: {
      city: true,
      types: { include: { type: true } },
      recurringRuns: true,
      awards: true,
    },
  });

  if (clubs.length !== 20) {
    throw new Error("No se pudieron cargar los 20 clubs con relaciones");
  }

  console.log("✓ Seed verificado correctamente");
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
