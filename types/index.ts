export type Pace = "ALL_PACES" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export interface RunTypeTag {
  key: string;
  emoji: string;
  label: string;
}

export interface ClubSummary {
  id: string;
  slug: string;
  name: string;
  city: string;
  logoUrl?: string;
  pace: Pace;
  frequency: number;
  verified?: boolean;
  types: RunTypeTag[];
  awards: { key: string; icon: string; label: string }[];
}

export interface ClubDetail extends ClubSummary {
  description: string;
  coverUrl?: string;
  instagramUrl?: string;
  usesPlatform: boolean;
  memberCount: number;
  memberAvatars: string[];
  runsSummary: string;
  upcomingRuns: RunSummary[];
  nearbyClubs: ClubSummary[];
}

export interface RunSummary {
  id: string;
  slug: string;
  title: string;
  startAt: string;
  location: string;
  club: { name: string; logoUrl?: string; slug: string };
  distanceKm?: number;
  pace?: string;
  types: RunTypeTag[];
  attendeeCount: number;
  signupType: "internal" | "external";
  externalSignupUrl?: string;
  organizerName?: string;
  organizerRole?: string;
  priceCents?: number | null;
}

export interface RunDetail extends RunSummary {
  description?: string;
  attendeeAvatars: string[];
  club: ClubSummary & { name: string; logoUrl?: string; slug: string };
}

export interface RunFilters {
  city?: string;
  types?: string[];
  pace?: Pace[];
  weekday?: number[];
  dateRange?: "week" | "month";
  q?: string;
}
