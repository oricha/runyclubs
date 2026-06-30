export const RUN_TYPES = [
  { id: "social", emoji: "😊", label: "Social" },
  { id: "founders", emoji: "🏆", label: "Fundadores" },
  { id: "performance", emoji: "⏱️", label: "Rendimiento" },
  { id: "trail", emoji: "🏔️", label: "Trail" },
  { id: "beginner", emoji: "😊", label: "Apto principiantes" },
  { id: "long-run", emoji: "🏃", label: "Tirada larga" },
  { id: "girls-only", emoji: "🙋‍♀️", label: "Solo chicas" },
  { id: "lgbtqi", emoji: "🏳️‍🌈", label: "LGTBIQ+" },
  { id: "singles", emoji: "❤️", label: "Solteros" },
  { id: "international", emoji: "🌍", label: "Internacional" },
  { id: "beer-run", emoji: "🍺", label: "Cervecera" },
] as const;

export type RunTypeId = (typeof RUN_TYPES)[number]["id"];
