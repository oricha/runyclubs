/**
 * Script temporal de desarrollo: marca una carrera existente como inscripción externa
 * para verificar US-5. No forma parte del seed ni de producción.
 *
 * Uso: npx tsx scripts/dev-patch-external-run.ts [slug-opcional]
 */
import "dotenv/config";

import { prisma } from "../lib/prisma";

async function main() {
  const slugArg = process.argv[2];

  const run = slugArg
    ? await prisma.run.findUnique({ where: { slug: slugArg } })
    : await prisma.run.findFirst({
        where: { status: "SCHEDULED", startAt: { gte: new Date() } },
        orderBy: { startAt: "asc" },
      });

  if (!run) {
    console.error("No se encontró ninguna carrera para actualizar.");
    process.exit(1);
  }

  await prisma.run.update({
    where: { id: run.id },
    data: {
      signupType: "external",
      externalSignupUrl: "https://example.com/inscripcion-test",
      organizerName: "María García",
      organizerRole: "Organizadora",
    },
  });

  console.log(`Carrera actualizada: /carreras/${run.slug}`);
  console.log("signupType=external, externalSignupUrl=https://example.com/inscripcion-test");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
