import { Container } from "@/components/common/Container";
import { SectionLabel } from "@/components/common/SectionLabel";
import { AwardBadge, AwardStack } from "@/components/club";
import { AWARD_CATALOG } from "@/lib/awards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SAMPLE_AWARDS = [
  AWARD_CATALOG.find((a) => a.key === "founders")!,
  AWARD_CATALOG.find((a) => a.key === "top-club")!,
].map(({ key, icon, label }) => ({ key, icon, label }));

export default function AwardsDemoPage() {
  return (
    <Container className="space-y-12 py-10">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl">Demo — Insignias de club</h1>
        <p className="text-muted-foreground">
          Página de verificación para la capability <code>awards-badges</code>.
          Integración en <code>ClubCard</code> y ficha de club pendiente de
          capabilities futuras.
        </p>
      </div>

      <section className="space-y-4">
        <SectionLabel>AwardBadge (individual)</SectionLabel>
        <div className="flex flex-wrap gap-4">
          {AWARD_CATALOG.map((award) => (
            <div key={award.key} className="space-y-2 text-center">
              <AwardBadge award={award} size="sm" />
              <p className="text-xs text-muted-foreground">{award.key}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionLabel>AwardStack — modo compacto</SectionLabel>
        <Card className="relative max-w-sm">
          <div className="absolute right-3 top-3">
            <AwardStack awards={SAMPLE_AWARDS} verified variant="compact" />
          </div>
          <CardHeader>
            <CardTitle>Retiro Morning Crew</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tarjeta simulada con insignias en esquina superior derecha (founders +
              top-club + verificado).
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <SectionLabel>AwardStack — modo expandido</SectionLabel>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Ficha de club simulada</CardTitle>
          </CardHeader>
          <CardContent>
            <AwardStack awards={SAMPLE_AWARDS} verified variant="expanded" />
          </CardContent>
        </Card>
      </section>
    </Container>
  );
}
