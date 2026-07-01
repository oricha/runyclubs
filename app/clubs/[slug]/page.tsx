import { notFound } from "next/navigation";

import { Container } from "@/components/common/Container";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ClubSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const club = await prisma.club.findUnique({
    where: { slug },
    select: { id: true, name: true },
  });

  if (!club) notFound();

  return (
    <Container className="py-10">
      <h1 className="font-serif text-3xl">{club.name}</h1>
      <p className="mt-2 text-muted-foreground">Ficha del club próximamente.</p>
    </Container>
  );
}
