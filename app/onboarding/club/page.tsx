import { Container } from "@/components/common/Container";
import { CITY_DETAILS } from "@/lib/cities";

import { ClubWizard } from "./ClubWizard";

export default function ClubOnboardingPage() {
  return (
    <Container className="py-10">
      <ClubWizard cities={CITY_DETAILS} />
    </Container>
  );
}
