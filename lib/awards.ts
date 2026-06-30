export interface AwardDefinition {
  key: string;
  icon: string;
  label: string;
  description: string;
}

export const AWARD_CATALOG: AwardDefinition[] = [
  {
    key: "founders",
    icon: "🏆",
    label: "Fundadores",
    description: "Club fundador de la comunidad RunClubs.es",
  },
  {
    key: "top-club",
    icon: "🥇",
    label: "Top club",
    description: "Club con alta actividad y valoración de la comunidad",
  },
  {
    key: "verified",
    icon: "✅",
    label: "Verificado",
    description: "Club revisado y confirmado por el equipo de RunClubs.es",
  },
];

export function getAwardDefinition(key: string): AwardDefinition | undefined {
  return AWARD_CATALOG.find((a) => a.key === key);
}

export type ClubAwardDisplay = {
  key: string;
  icon: string;
  label: string;
};

/** Combina awards de BD con badge «Verificado» derivado de Club.verified (Opción A). */
export function resolveClubAwards(
  awards: ClubAwardDisplay[],
  verified?: boolean,
): ClubAwardDisplay[] {
  const resolved = [...awards];

  if (verified && !resolved.some((a) => a.key === "verified")) {
    const verifiedDef = getAwardDefinition("verified");
    if (verifiedDef) {
      resolved.unshift({
        key: verifiedDef.key,
        icon: verifiedDef.icon,
        label: verifiedDef.label,
      });
    }
  }

  return resolved;
}
